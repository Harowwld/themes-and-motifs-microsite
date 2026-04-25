-- Storage RLS Policies for image upload security

-- ============================================
-- BUCKET: vendor-assets
-- ============================================

-- SELECT policy: Public can view all vendor images
CREATE POLICY "Public can view vendor assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vendor-assets');

-- INSERT policy: Authenticated users can upload
-- Note: Additional application-level checks should verify vendor ownership
CREATE POLICY "Authenticated users can upload vendor assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-assets');

-- DELETE policy: Only admins or vendor owners can delete
CREATE POLICY "Vendor owners can delete their assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vendor-assets' 
  AND (
    -- Check if user is admin (via user metadata or role table)
    auth.jwt() ->> 'role' = 'admin'
    -- OR path contains user-owned vendor_id (enforced at application level)
    OR EXISTS (
      SELECT 1 FROM vendors v
      JOIN vendor_profiles vp ON vp.id = v.vendor_profile_id
      WHERE vp.clerk_id = auth.uid()::text
      AND storage.objects.name LIKE 'vendor-assets/' || v.id || '/%'
    )
  )
);

-- ============================================
-- BUCKET: user-assets
-- ============================================

-- SELECT policy: Public can view user images
CREATE POLICY "Public can view user assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-assets');

-- INSERT policy: Authenticated users can upload to their own folders
CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets'
  AND (
    -- User can upload to their own profile folder
    storage.objects.name LIKE 'profiles/' || auth.uid() || '/%'
    -- User can upload to their own albums
    OR storage.objects.name LIKE 'albums/' || auth.uid() || '/%'
  )
);

-- DELETE policy: Users can only delete their own assets
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets'
  AND (
    storage.objects.name LIKE 'profiles/' || auth.uid() || '/%'
    OR storage.objects.name LIKE 'albums/' || auth.uid() || '/%'
  )
);

-- ============================================
-- BUCKET: promo-assets
-- ============================================

-- SELECT policy: Public can view promo images
CREATE POLICY "Public can view promo assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'promo-assets');

-- INSERT policy: Only admins can upload promo images
CREATE POLICY "Only admins can upload promo assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'promo-assets'
  AND auth.jwt() ->> 'role' = 'admin'
);

-- DELETE policy: Only admins can delete promo images
CREATE POLICY "Only admins can delete promo assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'promo-assets'
  AND auth.jwt() ->> 'role' = 'admin'
);

-- ============================================
-- Enable RLS on storage.objects (if not already enabled)
-- ============================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
