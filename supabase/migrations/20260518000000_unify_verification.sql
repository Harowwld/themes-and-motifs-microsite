-- 1. Drop the dependent view first
DROP VIEW IF EXISTS public.vendor_details;

-- 2. Drop the index on the old column
DROP INDEX IF EXISTS idx_vendors_verified;

-- 3. Drop the check constraint on verified_status
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_verified_status_check;

-- 4. Drop the verified_status column from vendors
ALTER TABLE public.vendors DROP COLUMN IF EXISTS verified_status;

-- 5. Recreate the vendor_details view using document_verified
CREATE OR REPLACE VIEW public.vendor_details AS
 SELECT v.id,
    v.business_name,
    v.slug,
    v.description,
    v.location_text,
    v.starting_price,
    v.contact_email,
    v.contact_phone,
    v.website_url,
    v.document_verified,
    v.is_featured,
    v.average_rating,
    v.review_count,
    v.view_count,
    v.save_count,
    p.name AS plan_name,
    u.email AS owner_email
   FROM ((public.vendors v
     LEFT JOIN public.plans p ON ((v.plan_id = p.id)))
     LEFT JOIN public.users u ON ((v.user_id = u.id)))
  WHERE (v.is_active = true);
