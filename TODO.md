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

