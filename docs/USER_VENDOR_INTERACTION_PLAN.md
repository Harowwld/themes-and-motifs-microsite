# User-Vendor Interaction System Plan

## Overview
Design the complete flow for how couples discover, contact, book, and work with wedding vendors through the platform.

---

## Phase 1: Discovery & Shortlisting (Priority: High)

### 1.1 Vendor Discovery
**Current State:** Browse by category, search by name/location

**Enhancements:**
- **Smart Filters**: Price range, availability date, package types, guest capacity
- **Compare Tool**: Side-by-side vendor comparison (max 3 vendors)
- **Saved Vendors**: Heart/favorite button to save to personal shortlist

### 1.2 User Dashboard - "My Wedding"
Create `/dashboard` page for couples:

```
┌─────────────────────────────────────────────────────────┐
│  MY WEDDING DASHBOARD                                   │
├─────────────────────────────────────────────────────────┤
│  📌 SAVED VENDORS              📋 ACTIVE INQUIRIES      │
│  ━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━  │
│  • Floral Studio (Flowers)     • Venue inquiry (3d)   │
│  • DJ Mike Smith (Music)         Response pending       │
│  • Sweet Cakes (Desserts)       • Photo inquiry (1w)    │
│                                 Quote received ✓        │
│                                                         │
│  📅 BOOKED VENDORS             💬 MESSAGES            │
│  ━━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━━    │
│  ✓ The Grand Hall (Venue)      3 unread messages        │
│  ✓ Capture Moments (Photo)      from Floral Studio      │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Database Schema - Saved Vendors
```sql
CREATE TABLE saved_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

CREATE INDEX idx_saved_vendors_user ON saved_vendors(user_id);
```

---

## Phase 2: Inquiry System (Priority: Critical)

### 2.1 Inquiry Submission Flow

**Step 1: User clicks "Inquire" on vendor page**
- Opens inquiry modal (not new page)

**Step 2: Inquiry Form Fields**
```typescript
interface InquiryForm {
  // Pre-filled from user profile (editable)
  eventDate?: string;           // Wedding date
  guestCount?: number;          // Expected guests
  budgetRange?: string;         // e.g., "$5,000 - $10,000"
  venue?: string;               // Already booked venue (if any)
  
  // User fills out
  message: string;              // Free text - what they need
  servicesNeeded: string[];     // Checkboxes: "Photography", "Videography", "Both"
  preferredContact: 'email' | 'phone';
  phoneNumber?: string;
  
  // System adds
  userId: string;
  vendorId: number;
}
```

**Step 3: Inquiry Created**
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Event Details
  event_date DATE,
  guest_count INTEGER,
  budget_range VARCHAR(50),
  venue_name VARCHAR(255),
  
  -- Inquiry Content
  message TEXT NOT NULL,
  services_needed TEXT[],
  preferred_contact VARCHAR(20),
  phone_number VARCHAR(20),
  
  -- Status Pipeline
  status VARCHAR(30) NOT NULL DEFAULT 'submitted' 
    CHECK (status IN (
      'submitted',      -- Just sent
      'viewed',         -- Vendor opened it
      'responded',      -- Vendor replied
      'quote_sent',     -- Vendor sent pricing
      'negotiating',    -- Back and forth on terms
      'booked',         -- Confirmed booking
      'declined',       -- Vendor unavailable / not interested
      'cancelled'       -- User cancelled
    )),
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  -- Soft delete (users can archive)
  is_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_vendor ON inquiries(vendor_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
```

### 2.2 Vendor Notification System

**Immediate Actions on New Inquiry:**
1. Email notification to vendor ("New lead from Jane & John")
2. Push notification (if vendor has app)
3. Dashboard notification badge (+1)
4. SMS (optional, vendor-configurable)

**Email Template:**
```
Subject: New wedding inquiry - Event Date: June 15, 2026

Hi [Vendor Name],

You received a new inquiry from [User Name] for [Event Date].

Message preview:
"[First 150 chars of message]..."

Guest count: [X] | Budget: [Range]
Services needed: [List]

[View Full Inquiry →]

---
Tip: Respond within 24 hours for best results. 
Vendors who respond quickly have 3x higher booking rates.
```

### 2.3 API Endpoints

```typescript
// POST /api/inquiries
// Creates new inquiry, triggers notifications

// GET /api/inquiries?role=user|vendor
// List inquiries with filtering

// GET /api/inquiries/[id]
// Full inquiry details + message thread

// PATCH /api/inquiries/[id]/status
// Update status (vendor only for most statuses)

// POST /api/inquiries/[id]/archive
// Soft delete for user/vendor
```

---

## Phase 3: Messaging System (Priority: High)

### 3.1 Threaded Conversations
Each inquiry gets a message thread for back-and-forth communication.

```sql
CREATE TABLE inquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'vendor', 'system')),
  
  message TEXT NOT NULL,
  attachments JSONB, -- [{url, filename, size}]
  
  -- Metadata
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_inquiry ON inquiry_messages(inquiry_id);
CREATE INDEX idx_messages_unread ON inquiry_messages(inquiry_id, is_read) WHERE is_read = false;
```

### 3.2 Message Features
- **File attachments**: Contracts, mood boards, inspiration photos (max 10MB)
- **Read receipts**: "Seen at 2:34 PM"
- **Quick replies**: Vendor can send template responses:
  - "Thanks for your inquiry! I'll get back to you within 24 hours."
  - "I'm available on that date. Let's schedule a call."
  - "Unfortunately, I'm already booked that weekend."

### 3.3 Real-time Updates
Use Supabase Realtime for instant message delivery:
```typescript
supabase
  .channel(`inquiry:${inquiryId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiry_messages' }, callback)
  .subscribe()
```

---

## Phase 4: Booking & Contracts (Priority: High)

### 4.1 Quote System
Vendor can send formal quotes through the platform:

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Quote Details
  package_name VARCHAR(255),
  description TEXT,
  items JSONB, -- [{name, description, quantity, unit_price, total}]
  
  -- Pricing
  subtotal DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Terms
  deposit_required DECIMAL(10,2),
  deposit_percentage INTEGER DEFAULT 50,
  payment_terms TEXT,
  cancellation_policy TEXT,
  
  -- Validity
  valid_until DATE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Booking Confirmation
When user accepts a quote:

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id),
  
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vendor_id INTEGER NOT NULL REFERENCES vendors(id),
  
  -- Event Details
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue_address TEXT,
  
  -- Financial
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  balance_due DECIMAL(10,2),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN (
      'confirmed',      -- Deposit paid, date held
      'deposit_paid',   -- Partial payment
      'paid_in_full',   -- All paid
      'completed',      -- Service delivered
      'cancelled'       -- Refunded/voided
    )),
  
  -- Contract
  contract_url VARCHAR(500),
  signed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Payment Integration (Stripe)
```typescript
// POST /api/bookings/[id]/pay-deposit
// Creates Stripe payment intent for deposit amount

// POST /api/bookings/[id]/pay-balance
// Full payment flow

// Webhook: stripe.payment_intent.succeeded
// Updates booking status, sends confirmations
```

**Payment Flow:**
1. User accepts quote
2. Redirected to Stripe checkout for deposit
3. On success: Booking confirmed, vendor notified
4. Calendar holds the date
5. Balance due reminder sent 7 days before event

---

## Phase 5: Vendor Dashboard - Lead Management (Priority: Critical)

### 5.1 Lead Pipeline View
Create `/vendor/dashboard` with kanban-style pipeline:

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  NEW LEADS   │  RESPONDED   │  QUOTE SENT  │  BOOKED      │
│  (12)        │  (8)         │  (5)         │  (3)         │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Jane & John  │ Smith Wed-   │ Johnson      │ Williams     │
│ Jun 15       │ ding         │ Package A    │ June 12      │
│ $5k-10k      │ •••          │ $4,500       │ Deposit ✓    │
│ [Reply]      │ [View]       │ [Follow up]  │ [Details]    │
│              │              │              │              │
│ Mike & Sue   │ Brown        │              │              │
│ Aug 22       │ Anniversary  │              │              │
│ $3k-5k       │ •••          │              │              │
│ [Reply]      │ [View]       │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 5.2 Lead Details Page
```
┌─────────────────────────────────────────────────────────┐
│  Jane & John - June 15, 2026                            │
│  Status: NEW → [Mark as Viewed] [Send Quote] [Decline]  │
├─────────────────────────────────────────────────────────┤
│  EVENT DETAILS                                          │
│  • Date: Saturday, June 15, 2026                        │
│  • Guests: 150                                          │
│  • Budget: $5,000 - $10,000                            │
│  • Venue: The Grand Hall                                │
│                                                         │
│  MESSAGE                                                │
│  "Hi! We're looking for a photographer for our         │
│   wedding. We love your style and would love to        │
│   hear about your packages. Our ceremony is at         │
│   2 PM and reception at 6 PM."                         │
│                                                         │
│  SERVICES NEEDED                                        │
│  ☑ Photography    ☐ Videography    ☑ Engagement shoot │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  MESSAGES (Real-time chat)                              │
│  ───────────────────────────────────────────────────────│
│  Jane: [original message]                               │
│  You: Thanks for reaching out! ...                     │
│  ───────────────────────────────────────────────────────│
│  [Type a message...]           [Attach] [Send]         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Quick Stats Cards
```
┌──────────┬──────────┬──────────┬──────────┐
│ This     │ Response │ Booking  │ Revenue  │
│ Month    │ Time     │ Rate     │ YTD      │
│ 12 leads │ 2.3 hrs  │ 18%      │ $45,200  │
└──────────┴──────────┴──────────┴──────────┘
```

---

## Phase 6: Calendar & Availability (Priority: Medium)

### 6.1 Vendor Availability Management
```sql
CREATE TABLE vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL 
    CHECK (status IN ('available', 'booked', 'unavailable')),
  
  -- Optional: partial day booking
  start_time TIME,
  end_time TIME,
  
  -- Source (was this a booking or manual block?)
  source VARCHAR(20) CHECK (source IN ('manual', 'booking', 'sync')),
  booking_id UUID REFERENCES bookings(id),
  
  UNIQUE(vendor_id, date)
);
```

### 6.2 Public Availability Display
On vendor profile, show calendar with:
- Green: Available
- Red: Booked
- Grey: Unavailable

Prevent inquiries for dates already booked.

---

## Phase 7: Post-Booking Experience (Priority: Medium)

### 7.1 Booking Dashboard for Users
```
┌─────────────────────────────────────────────────────────┐
│  MY BOOKINGS                                            │
├─────────────────────────────────────────────────────────┤
│  The Grand Hall                    Deposit paid ✓       │
│  Venue | June 15, 2026            [View contract]       │
│  $8,500 total                     [Pay balance $4,250]  │
│  Contact: Sarah (555) 123-4567    [Message vendor]        │
│  ─────────────────────────────────────────────────────  │
│  Capture Moments                   Deposit paid ✓       │
│  Photography | June 15, 2026                            │
│  $4,200 total                                            │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Reminder System
- 30 days before: "Confirm details with vendor"
- 7 days before: "Pay remaining balance"
- 1 day after: "How was your experience? Leave a review" (this enables verified reviews)

---

## Implementation Priority

| Phase | Priority | Estimated Days | Business Impact |
|-------|----------|----------------|-----------------|
| 1. Saved vendors & dashboard | High | 2 days | Engagement |
| 2. Inquiry system | **Critical** | 3 days | Core revenue |
| 3. Messaging | High | 2 days | Trust building |
| 4. Booking & quotes | **Critical** | 4 days | Revenue capture |
| 5. Vendor dashboard | **Critical** | 3 days | Vendor retention |
| 6. Calendar | Medium | 2 days | Efficiency |
| 7. Post-booking | Medium | 2 days | Reviews, retention |
| **Total** | | **18 days** | |

---

## Key Success Metrics

| Metric | Target |
|--------|--------|
| Inquiry to response rate | >80% within 24hrs |
| Quote acceptance rate | >25% |
| Booking completion rate | >60% of quotes |
| Vendor retention | >85% renew annually |
| User NPS | >50 |

---

## Open Questions

1. **Payment handling**: Full Stripe integration or just track offline payments?
2. **Contracts**: Native e-signature (DocuSign API) or just upload PDF?
3. **Commissions**: Does platform take a % of bookings? If so, when?
4. **Vendor tiers**: Free vs paid vendor accounts with different features?
5. **Calendar sync**: Import from Google Calendar/iCal?
