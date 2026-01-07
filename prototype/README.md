# Themes & Motifs Microsite — Task Checklist

Use the checkboxes to track progress on the requested deliverables.

## Multi-Location Schema
- [x] Design schema where a vendor can have multiple branches (each branch is a distinct searchable entry).
- [x] Add `vendors` base table/model (core vendor identity, owner, contact email).
- [x] Add `vendor_branches` table/model (location, geo fields, pricing/rating aggregates, foreign key to vendor).
- [x] Ensure search queries target branches (include location filters and relevance weighting).
- [x] Seed/migrate sample data for multi-branch vendors to validate queries.

## Admin Override Logic
- [ ] Add `is_admin_override` Boolean flag to the database with default `false`.
- [ ] Wire flag to bypass payment checks only for Superadmin role (feature-gated/permission-checked).
- [ ] Add audit logging when overrides are used (who, when, why, vendor/branch impacted).
- [ ] Expose toggle in admin UI (Superadmin only) with confirmation and tooltip explaining risk.
- [ ] Add automated test covering override vs. non-override flows.

## Tiered Data Structure
- [ ] Add 3-category maximum mapping per vendor/branch (enforced at DB + API validation).
- [ ] Introduce premium-only fields: Social links, YouTube/Vimeo embeds, Direct Mobile #s.
- [ ] Add tier flag per vendor/branch to gate premium-only fields.
- [ ] Update create/update endpoints to validate tier before accepting premium fields.
- [ ] Add UI affordances for premium-only fields (disabled state for standard, visible for premium).

## Account Status Engine
- [ ] Define status enum: `ACTIVE_STANDARD`, `ACTIVE_PREMIUM`, `EXPIRED`, `PENDING_CLAIM`.
- [ ] Implement transition rules (e.g., payment success -> premium, expiry -> expired, claim flow -> pending_claim).
- [ ] Add scheduled/cron job or hook to move `ACTIVE_PREMIUM` to `EXPIRED` on billing lapse.
- [ ] Surface status in admin UI and vendor profile UI (badges, filters, tooltips).
- [ ] Add regression tests for status transitions and access gating per status.

## Verifiable UI Output
- [ ] Build high-fidelity layout shell (Header, Footer, Navigation) with mobile-first, Agoda-style dense spacing.
- [ ] Ensure responsive breakpoints and touch targets optimized for mobile.
- [ ] Include sample pages/sections that consume schema fields (premium badges, branch cards, status states).
- [ ] Add placeholder content/screenshots to verify layout fidelity during review.
- [ ] Run manual/automated visual check on mobile viewport and document findings.
