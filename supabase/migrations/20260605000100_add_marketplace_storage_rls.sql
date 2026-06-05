-- Update promo-assets Storage RLS Policies to allow marketplace folder
-- Created: 2026-06-05

-- Drop existing INSERT and DELETE policies for promo-assets
DROP POLICY IF EXISTS "Vendors and admins can delete promo assets" ON storage.objects;
DROP POLICY IF EXISTS "Vendors and admins can upload promo assets" ON storage.objects;

-- Create new DELETE policy that allows vendors to delete their own promo/marketplace images
CREATE POLICY "Vendors and admins can delete promo assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'promo-assets'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND (
        storage.objects.name LIKE 'promos/' || v.id || '/%'
        OR storage.objects.name LIKE 'marketplace/' || v.id || '/%'
      )
    )
  )
);

-- Create new INSERT policy that allows vendors to upload their own promo/marketplace images
CREATE POLICY "Vendors and admins can upload promo assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'promo-assets'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND (
        storage.objects.name LIKE 'promos/' || v.id || '/%'
        OR storage.objects.name LIKE 'marketplace/' || v.id || '/%'
      )
    )
  )
);
