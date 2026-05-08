-- Fix broken Storage RLS Policies for vendor-assets and promo-assets
-- Created: 2026-05-08

-- ============================================
-- BUCKET: vendor-assets (FIXED)
-- ============================================

-- Drop the broken DELETE policy
DROP POLICY IF EXISTS "Vendor owners can delete their assets" ON storage.objects;

-- Create fixed DELETE policy that matches actual folder structure
-- Storage paths: gallery/{vendor_id}/file.jpg, logos/{vendor_id}/file.jpg
CREATE POLICY "Vendor owners can delete their assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vendor-assets'
  AND (
    -- Admins can delete any vendor asset
    auth.jwt() ->> 'role' = 'admin'
    -- Vendors can delete assets in their own folders
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND (
        storage.objects.name LIKE 'gallery/' || v.id || '/%'
        OR storage.objects.name LIKE 'logos/' || v.id || '/%'
      )
    )
  )
);

-- ============================================
-- BUCKET: promo-assets (FIXED)
-- ============================================

-- Drop the admin-only DELETE policy
DROP POLICY IF EXISTS "Only admins can delete promo assets" ON storage.objects;

-- Create new DELETE policy that allows vendors to delete their own promo images
-- Storage paths: promos/{vendor_id}/file.jpg
CREATE POLICY "Vendors and admins can delete promo assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'promo-assets'
  AND (
    -- Admins can delete any promo asset
    auth.jwt() ->> 'role' = 'admin'
    -- Vendors can delete promo assets for their own vendor
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND storage.objects.name LIKE 'promos/' || v.id || '/%'
    )
  )
);

-- ============================================
-- BUCKET: promo-assets INSERT Policy (FIXED)
-- ============================================

-- Drop the admin-only INSERT policy
DROP POLICY IF EXISTS "Only admins can upload promo assets" ON storage.objects;

-- Create new INSERT policy that allows vendors to upload their own promo images
CREATE POLICY "Vendors and admins can upload promo assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'promo-assets'
  AND (
    -- Admins can upload any promo asset
    auth.jwt() ->> 'role' = 'admin'
    -- Vendors can upload promo assets for their own vendor
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND storage.objects.name LIKE 'promos/' || v.id || '/%'
    )
  )
);

-- ============================================
-- BUCKET: vendor-assets INSERT Policy (FIXED)
-- ============================================

-- Drop the generic INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload vendor assets" ON storage.objects;

-- Create new INSERT policy that restricts vendors to their own folders
CREATE POLICY "Vendors can upload to their own folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vendor-assets'
  AND (
    -- Admins can upload anywhere
    auth.jwt() ->> 'role' = 'admin'
    -- Vendors can only upload to their own gallery or logos folders
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND (
        storage.objects.name LIKE 'gallery/' || v.id || '/%'
        OR storage.objects.name LIKE 'logos/' || v.id || '/%'
      )
    )
  )
);
