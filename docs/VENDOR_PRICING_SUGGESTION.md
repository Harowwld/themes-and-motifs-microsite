# Vendor Pricing Strategy & Cost Breakdown

## Executive Summary

Recommended vendor subscription pricing based on current platform features, Supabase infrastructure costs, and market positioning in the Philippines wedding industry.

---

## Current Platform Features Analysis

### Free/Standard Plan (Currently Available)
| Feature | Implementation Cost |
|---------|-------------------|
| Company name, address & contact display | Database row + RLS policies |
| Mobile number on listing | Basic field storage |
| Contact form for inquiries | API endpoint + email/notification |
| Up to 3 searchable categories | Category junction table |
| Ratings & reviews display | Review table queries |
| Up to 6 photos | Storage bucket (6 images/vendor) |
| Website & social media links | Basic text fields |
| Detailed service description | Text field storage |

### Premium Plan (Currently Implemented)
| Feature | Infrastructure Impact |
|---------|----------------------|
| **Featured in search results** | Algorithm boost + index prioritization |
| **Priority placement** | Custom sorting logic + higher DB queries |
| **Verified badge** | Badge UI + verified_status field check |
| **Unlimited photo gallery** | **Storage cost scales per image** |
| **Album showcase** | Additional storage + bandwidth |
| **Video showcase** | **High storage + bandwidth costs** |
| **Analytics dashboard** | **Aggregated queries + view tracking** |
| **Lead generation tools** | Inquiry tracking + CRM features |
| **Promos/Deals creation** | Additional table + API endpoints |
| **Social links management** | Separate table + UI |

---

## Infrastructure Cost Breakdown (Supabase)

### Current Supabase Pricing (2025)
| Plan | Monthly Cost | Database | Storage | Bandwidth | MAU |
|------|-------------|----------|---------|-----------|-----|
| **Free** | $0 | 500 MB | 1 GB | 5 GB egress | 50,000 |
| **Pro** | $25 | 8 GB | 100 GB | 250 GB egress | 100,000 |
| **Team** | $599 | Custom | Custom | Custom | Custom |

### Estimated Monthly Costs Per Vendor Tier

#### Free Tier Vendors
```
Database: ~50 KB per vendor
Storage: ~3 MB (6 photos avg 500KB each)
Bandwidth: ~100 MB/month (light listing views)
Compute: Minimal (cached queries)

Cost per vendor: ~$0.05/month
Margin at $0: -$0.05 (acquisition cost)
```

#### Premium Tier Vendors
```
Database: ~200 KB (more fields, tracking tables)
Storage: ~50-200 MB (unlimited photos, videos)
  - 50 photos @ 1MB = 50 MB
  - 3 videos @ 20MB = 60 MB
  - Promos/images = 10 MB
Bandwidth: ~2-5 GB/month (featured placement = more views)
  - Analytics queries
  - Image/video delivery
  - Lead form submissions

Estimated cost per premium vendor: $0.50 - $2.00/month
```

---

## Recommended Pricing Structure

### Option 1: Freemium Model (Recommended)

| Plan | Monthly Price | Annual Price | Target Margin |
|------|--------------|--------------|---------------|
| **Standard** | FREE | FREE | Acquisition cost |
| **Premium** | ₱1,499 (~$25) | ₱14,990 (~$250) | ~90% gross margin |

#### Why ₱1,499/month ($25)?

**Cost Justification:**
1. **Infrastructure**: $0.50-2.00/vendor/month → $25 covers 12-50 vendors' infra
2. **Supabase Pro Plan**: $25/month baseline - 1 premium vendor covers the platform
3. **Philippine Market**: Wedding vendors average ₱20,000-100,000 per booking
4. **Competitor Analysis**: Similar platforms charge ₱1,000-3,000/month

**Value Metrics:**
- Average wedding vendor profit per booking: ₱30,000+
- 1 lead conversion = 3-6 months of subscription cost recovered
- Featured placement = 3-5x more visibility = more inquiries

---

### Option 2: Three-Tier Model

| Plan | Monthly | Annual | Features |
|------|---------|--------|----------|
| **Starter** | FREE | FREE | Basic listing, 6 photos |
| **Growth** | ₱799 (~$13) | ₱7,990 | Unlimited photos, analytics |
| **Pro** | ₱2,499 (~$42) | ₱24,990 | Featured, videos, lead tools |

---

## Feature-to-Price Mapping

### Free Tier (₱0)
```
Purpose: Vendor acquisition, marketplace liquidity
- Basic profile (name, address, contact)
- 6 photos maximum
- Contact form
- Standard search placement (chronological)
- Reviews display
```

### Premium Tier (₱1,499/month)
```
Purpose: Revenue generation, vendor success

CORE VALUE DRIVERS:
┌─────────────────────────────────────────────────────┐
│ VISIBILITY PACKAGE          VALUE: ₱500/month     │
├─────────────────────────────────────────────────────┤
│ • Featured placement in search results              │
│ • Priority sorting (algorithm boost)                 │
│ • Verified badge (trust signal)                    │
├─────────────────────────────────────────────────────┤
│ MEDIA PACKAGE               VALUE: ₱400/month       │
├─────────────────────────────────────────────────────┤
│ • Unlimited photos (vs 6 free)                      │
│ • Video showcase capability                        │
│ • Album organization                                │
├─────────────────────────────────────────────────────┤
│ LEAD GENERATION             VALUE: ₱600/month     │
├─────────────────────────────────────────────────────┤
│ • Analytics dashboard (views, saves, clicks)      │
│ • Promos/deals creation tool                        │
│ • Social media integration                          │
│ • Priority inquiry routing                          │
└─────────────────────────────────────────────────────┘
                         TOTAL VALUE: ₱1,500/month
                         PRICE: ₱1,499/month
```

---

## Revenue Projections

### Break-Even Analysis

**Scenario: 100 Active Vendors**
```
Mix: 70% Free (70 vendors), 30% Premium (30 vendors)

Infrastructure Costs:
- Supabase Pro Plan: $25/month
- Storage for 100 vendors (avg): $5/month
- Bandwidth: $10/month
- Total: ~$40/month (₱2,400)

Revenue:
- 30 Premium × ₱1,499 = ₱44,970/month
- Gross Margin: (44,970 - 2,400) / 44,970 = 94.7%

Annual Projection:
- Revenue: ₱539,640 ($9,000)
- Costs: ₱28,800 ($480)
- Gross Profit: ₱510,840 ($8,520)
```

### Growth Scenarios

| Total Vendors | Premium % | Monthly Revenue | Annual Revenue |
|--------------|-----------|-----------------|----------------|
| 100 | 30% | ₱44,970 | ₱539,640 |
| 250 | 25% | ₱93,688 | ₱1,124,250 |
| 500 | 20% | ₱149,900 | ₱1,798,800 |
| 1,000 | 20% | ₱299,800 | ₱3,597,600 |

---

## Implementation Recommendations

### Phase 1: Launch (Immediate)
1. **Keep Free tier unlimited** during growth phase
2. **Set Premium at ₱999/month** introductory (₱11,988/year)
3. **Target**: Convert 20% of verified vendors to Premium

### Phase 2: Optimization (3-6 months)
1. **A/B test pricing**: ₱999 vs ₱1,499 vs ₱1,999
2. **Add annual discount**: 2 months free (17% savings)
3. **Introduce tier limits**: Free = 3 photos, Premium = unlimited

### Phase 3: Scale (6-12 months)
1. **Add "Pro" tier** at ₱2,999 for high-volume vendors
2. **Implement usage limits** on free tier
3. **Add transactional fees** on bookings (3-5%)

---

## Technical Implementation Notes

### Database Schema Update Needed
```sql
-- Add pricing fields to plans table
ALTER TABLE plans ADD COLUMN monthly_price DECIMAL(10,2);
ALTER TABLE plans ADD COLUMN annual_price DECIMAL(10,2);
ALTER TABLE plans ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update existing plans
UPDATE plans SET 
  monthly_price = 0, 
  annual_price = 0 
WHERE name = 'Standard';

UPDATE plans SET 
  monthly_price = 1499, 
  annual_price = 14990 
WHERE name = 'Premium';
```

### Payment Integration Options
1. **Stripe** - International cards, USD billing
2. **PayMongo** - Philippine local (GCash, Maya, cards)
3. **Xendit** - Southeast Asia focus

Recommended: **PayMongo** for local market optimization

---

## Competitive Positioning

| Platform | Monthly Price | Features |
|----------|--------------|----------|
| Themes & Motifs (Proposed) | ₱1,499 | Featured + Unlimited + Analytics |
| WeddingWire PH | ₱2,500+ | Leads + Reviews |
| The Knot (Global) | $99/month | Full suite |
| Carousell (Basic) | ₱0-500 | Listing only |
| Facebook Groups | ₱0 | No structure |

**Positioning**: Mid-market premium between free listings and enterprise solutions

---

## Conclusion

**Recommended Launch Price: ₱1,499/month ($25)**

**Justification Summary:**
- ✅ Covers infrastructure costs (5% of revenue)
- ✅ 94%+ gross margin sustainable
- ✅ Competitive in Philippine market
- ✅ High value-to-price ratio for vendors
- ✅ Scalable as platform grows
- ✅ 1 converted lead = 3-6 months ROI for vendor

**Next Steps:**
1. Implement payment gateway integration
2. Create pricing page with feature comparison
3. Set up subscription management in dashboard
4. Add upgrade prompts for free tier vendors
