# Verified Review System - Implementation Plan

## Overview
Replace the current open review system with a **verified customer review** system that only allows reviews from users who have had actual interactions with vendors.

## Phase 1: Database Schema (Priority: Critical)

### 1.1 Reviews Table Updates
```sql
-- Add new columns to reviews table
ALTER TABLE reviews ADD COLUMN is_verified BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN verified_by_inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN verified_by_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN moderated_at TIMESTAMPTZ;

-- Add unique constraint to prevent duplicate reviews
ALTER TABLE reviews ADD CONSTRAINT unique_user_vendor_review UNIQUE (user_id, vendor_id);

-- Index for verification lookups
CREATE INDEX idx_reviews_verified_by_inquiry ON reviews(verified_by_inquiry_id);
CREATE INDEX idx_reviews_verified_by_booking ON reviews(verified_by_booking_id);
```

### 1.2 Review Replies Table (Vendor Responses)
```sql
CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_replies_review ON review_replies(review_id);
CREATE INDEX idx_review_replies_vendor ON review_replies(vendor_id);
```

### 1.3 Review Helpful Votes Table
```sql
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_votes_review ON review_votes(review_id);
```

## Phase 2: Verification Flow (Priority: Critical)

### 2.1 Inquiry-Based Verification
When a user sends an inquiry to a vendor, this creates eligibility to review that vendor.

**Process:**
1. User submits inquiry via `/api/inquiries` → Creates `inquiries` record
2. User can only review after inquiry status is `responded` or `completed`
3. On review submission, check if user has verified interaction

### 2.2 API Verification Logic
Update `/api/reviews/route.ts` POST handler:

```typescript
// Before creating review, verify eligibility:
const { data: eligibleInteraction } = await supabase
  .from('inquiries')
  .select('id')
  .eq('user_id', user.id)
  .eq('vendor_id', vendorId)
  .in('status', ['responded', 'completed', 'booked'])
  .maybeSingle();

// Alternative: check bookings
const { data: eligibleBooking } = await supabase
  .from('bookings')
  .select('id')
  .eq('user_id', user.id)
  .eq('vendor_id', vendorId)
  .in('status', ['confirmed', 'completed'])
  .maybeSingle();

if (!eligibleInteraction?.id && !eligibleBooking?.id) {
  return NextResponse.json(
    { error: "Only verified customers can review. Please contact this vendor first." },
    { status: 403 }
  );
}
```

### 2.3 Update Review Creation
```typescript
// Create review with verification
const { data: created, error: createErr } = await supabase
  .from('reviews')
  .insert({
    vendor_id: vendorId,
    user_id: user.id,
    rating,
    review_text: reviewText || null,
    status: 'pending', // Changed from 'published' to 'pending'
    is_verified: true,
    verified_by_inquiry_id: eligibleInteraction?.id || null,
    verified_by_booking_id: eligibleBooking?.id || null,
  })
  .select('id, vendor_id, user_id, rating, review_text, status, created_at')
  .single();
```

## Phase 3: Moderation System (Priority: Medium)

### 3.1 Admin Dashboard Page
Create `/admin/reviews` page with:
- Tab 1: **Pending Reviews** - List of reviews awaiting approval
- Tab 2: **Published Reviews** - Approved reviews
- Tab 3: **Rejected Reviews** - Hidden/removed reviews
- Tab 4: **Vendor Replies** - Vendor responses needing approval

### 3.2 Review Actions
Each review card should have:
- **Approve** → `status: 'published'`, set `moderated_at`, `moderated_by`
- **Reject** → `status: 'rejected'`, optional reason field
- **View Context** → Show inquiry/booking details that verified the review

### 3.3 Moderation API
Create `/api/admin/reviews/[id]/moderate`:
```typescript
// POST /api/admin/reviews/[id]/moderate
{
  action: 'approve' | 'reject',
  reason?: string // required if rejecting
}
```

## Phase 4: Frontend Updates (Priority: Medium)

### 4.1 Review Display Component
Update review cards to show:
- **Verified Badge** - "Verified Customer" badge for `is_verified=true`
- **Date** - When review was created
- **Vendor Reply** - If vendor has responded (show after moderation)
- **Helpful Count** - Number of users who found this helpful

### 4.2 Review Form Updates
Update `VendorReviewForm.tsx`:
- Check verification eligibility before showing form
- If not verified: Show message "Contact this vendor to become eligible to review"
- If verified: Show form with "Verified Customer" badge
- After submission: Show "Your review is pending approval"

### 4.3 Vendor Dashboard - Reply to Reviews
Add section in vendor dashboard:
- List of published reviews for their business
- Reply button (text area + submit)
- Show pending replies awaiting admin approval

## Phase 5: Migration Strategy (Priority: Medium)

### 5.1 Backfill Existing Reviews
```sql
-- Mark existing reviews as pending moderation
UPDATE reviews SET status = 'published' WHERE status IS NULL OR status = '';

-- Set is_verified = false for all existing reviews (they weren't verified)
UPDATE reviews SET is_verified = false WHERE is_verified IS NULL;
```

### 5.2 Gradual Rollout Options

**Option A: Immediate Switch (Recommended for new platform)**
- Deploy all changes at once
- Existing reviews remain but new ones require verification

**Option B: Grace Period**
- Announce changes 2 weeks in advance
- During grace period: New reviews require verification OR account age > 30 days
- After grace period: Strict verification only

**Option C: Hybrid Display**
- Show verified reviews first/highlighted
- Show unverified reviews separately with disclaimer

## Phase 6: Testing & Validation

### 6.1 Test Cases
| Scenario | Expected Result |
|----------|----------------|
| Unauthenticated user views review form | "Sign in to review" button |
| Authenticated user, no inquiry | "Contact vendor to become eligible" message |
| Authenticated user with inquiry | Can submit review, goes to pending |
| Vendor tries to review own business | "Vendors cannot review" error |
| User submits duplicate review | "You already reviewed this vendor" error (409) |
| Admin approves review | Review becomes visible on vendor page |
| Admin rejects review | Review hidden, user sees status in their profile |
| Vendor replies to review | Reply goes to pending, then visible after admin approval |

### 6.2 Edge Cases
- User has multiple inquiries with vendor (use most recent)
- Inquiry was deleted after review (keep review, is_verified remains true)
- Vendor account deleted after reply (keep reply, anonymize vendor name)

## Implementation Timeline

| Phase | Estimated Time | Dependencies |
|-------|----------------|--------------|
| Database Schema | 1 day | None |
| Verification Logic | 2 days | Database Schema |
| Moderation Dashboard | 2 days | Verification Logic |
| Frontend Updates | 2 days | API updates |
| Testing & Bug Fixes | 2 days | All above |
| **Total** | **9 days** | |

## Success Metrics

After implementation, track:
- Review quality score (manual sample rating)
- Vendor satisfaction with review authenticity
- User trust indicators (inquiry-to-review conversion)
- Reduction in disputed/fake reviews

## Open Questions to Resolve

1. **Should unverified users see the review form at all, or just a message?**
2. **How long after an inquiry can a user leave a review? (e.g., 90 days?)**
3. **Should vendors be notified of new reviews?**
4. **Do we need a "report review" feature for users to flag inappropriate content?**
5. **Should we implement email notifications for moderation actions?**
