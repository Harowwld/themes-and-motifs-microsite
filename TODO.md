# TODO

## Not implemented yet

### Vendor verification documents (anti-troll / quality control)

- **Document upload flow** (DTI/SEC/TIN/etc.)
  - Decide required docs for listing vs “Verified” badge.
  - Supabase Storage bucket (name + RLS rules).
  - DB table suggestion: `verification_documents` with:
    - `id`, `vendor_registration_id` (or `vendor_id`), `doc_type`, `file_path`/`file_url`, `status`, `created_at`.

- **Recommended required docs (PH-friendly)**
  - DTI Business Name Registration OR SEC registration.
  - Mayor’s Permit / Business Permit.
  - BIR Certificate of Registration (Form 2303) / TIN proof.
  - Government-issued ID of owner/authorized representative.
  - Authorization letter if submitter isn’t the owner.

### Communications

- **Email notifications**
  - Submit confirmation.
  - Approved / rejected / needs-info emails.

### Admin enhancements

- **Admin notes UI** for registrations (store in `vendor_registrations.admin_notes`).
- **Needs-info status** + ability to request missing docs/info.

### Vendor portal (optional)

- **Applicant status page**
  - Check registration status via reference id + email, or magic link.

### Vendor plans gaps (from `contexts_txt_files/vendor_plans_context.txt`)

- ~~**Vendor logo** (Premium)~~
  - ~~Add logo field + storage + display on vendor page + directory.~~

- ~~**Plan gating (Free vs Premium)**~~
  - ~~Enforce feature access based on `plan_id` (e.g. website/social links/phone numbers/albums/promos).~~

- ~~**Public email via contact form**~~
  - ~~Replace `mailto:` with a contact form flow (spam protection + vendor notification).~~
  
- **Admin-only contact fields**
  - Store admin email + admin phone separately from public contact fields.

- **Secondary categories (up to 3 total)**
  - Persist + manage multiple vendor categories (currently only primary is inserted on approval).
  - Validate max categories.

- **Affiliations / associations assignment**
  - Admin nominate/assign affiliations by region (DB + admin UI + vendor page/directory filters).

- **Ratings & reviews submission flow**
  - UI + API for couples to submit ratings/reviews.
  - Auth rules: only registered couples can review.
  - Moderation/status workflow (draft/published).

- **Promos (exclusive deals / marketplace)**
  - Vendor-side creation/editing UI + API (or define admin-only workflow).
  - Enforce limits (Free: 1/day & only on vendor page; Premium: unlimited).
  - Display promos on vendor public page.

- **Album rules**
  - Enforce Free limits (1 album, max 10 photos).
  - Support Premium “posts” concept if needed.
  - Instagram integration/embedding (Premium) if still required.

- **Business docs upload + verification workflow**
  - Upload docs to storage + DB records.
  - Verification badge criteria and admin review.

- **Search requirements**
  - Keyword search beyond business name (e.g. description, categories, affiliations).
  - Area search definition (city/region/address consistency).

- **Archive after 12 months of inactivity**
  - Auto-deactivate/archive vendor after no login.
  - Reactivate on login.

- **Marketplace activation after docs**
  - Feature flag / per-vendor activation once docs are approved.

