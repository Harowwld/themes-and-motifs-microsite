-- Create storage buckets for image uploads
-- Run this in Supabase Dashboard > Storage > Buckets > New Bucket

-- Note: This migration documents the bucket structure.
-- Buckets must be created via Supabase Dashboard or Storage API.

-- Buckets to create:
-- 1. vendor-assets - Vendor logos, cover images, gallery photos (public)
-- 2. user-assets - Profile photos, album photos (public)
-- 3. promo-assets - Promo/announcement images (public)
-- 4. document-assets - Verification documents (private - already exists)

-- Bucket configuration:
-- - Public access: ON (for vendor-assets, user-assets, promo-assets)
-- - File size limit: 10MB (enforced via application)
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- Folder structure within buckets:
-- vendor-assets/
--   logos/{vendor_id}/{timestamp}-{id}.jpg
--   covers/{vendor_id}/{timestamp}-{id}.jpg
--   gallery/{vendor_id}/{timestamp}-{id}.jpg
--
-- user-assets/
--   profiles/{user_id}/{timestamp}-{id}.jpg
--   albums/{album_id}/{timestamp}-{id}.jpg
--
-- promo-assets/
--   promos/{promo_id}/{timestamp}-{id}.jpg
