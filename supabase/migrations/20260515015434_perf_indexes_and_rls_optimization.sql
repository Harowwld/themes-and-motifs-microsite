-- =============================================================================
-- Performance optimization: indexes + RLS auth.uid() caching
-- =============================================================================
-- Context: The landing page suffers ~300ms delays due to:
--   1. Separate single-column indexes that can't cover composite WHERE clauses
--   2. Missing covering index on vendor_images (forces heap fetch per row)
--   3. auth.uid() called once per row in RLS policies (expensive on large tables)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PART 1: Composite & Covering Indexes
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) so it can run in a
-- transaction. Apply during a low-traffic window.
-- ---------------------------------------------------------------------------

-- vendors: composite index for the featured query
-- (is_active = true AND is_featured = true — used on every landing page load)
CREATE INDEX IF NOT EXISTS vendors_active_featured_idx
  ON public.vendors (is_active, is_featured)
  WHERE is_active = true;

-- vendors: composite index for the default "rating" sort
-- eliminates the sort step for the most common listing query
CREATE INDEX IF NOT EXISTS vendors_active_rating_idx
  ON public.vendors (is_active, average_rating DESC NULLS LAST, review_count DESC NULLS LAST)
  WHERE is_active = true;

-- vendors: composite index for "newest" sort (created_at)
CREATE INDEX IF NOT EXISTS vendors_active_created_idx
  ON public.vendors (is_active, created_at DESC)
  WHERE is_active = true;

-- vendor_images: covering index — vendor_id + sort cols + INCLUDE(image_url)
-- enables an index-only scan for getCoverImagesByVendorId(),
-- which currently fetches (vendor_id, is_cover, display_order, image_url)
-- The plain idx_vendor_images_vendor_id only covers vendor_id lookups.
CREATE INDEX IF NOT EXISTS vendor_images_cover_lookup_idx
  ON public.vendor_images (vendor_id, is_cover DESC, display_order ASC)
  INCLUDE (image_url);

-- promos: composite index for the featured promos query
-- (currently has separate is_active + is_featured single-col indexes)
CREATE INDEX IF NOT EXISTS promos_active_featured_idx
  ON public.promos (is_active, is_featured)
  WHERE is_active = true AND is_featured = true;

-- ---------------------------------------------------------------------------
-- PART 2: Fix auth.uid() called per-row in RLS helper functions
--
-- The skill rule (security-rls-performance.md) states:
--   WRONG: auth.uid() = user_id          -- called once per row
--   RIGHT: (select auth.uid()) = user_id -- evaluated once, result cached
--
-- Both is_admin() and owns_vendor() call auth.uid() inside their bodies
-- without the (select ...) wrapper, so they're re-evaluated per row.
-- We replace them with STABLE security definer functions that wrap auth.uid()
-- in a subselect so Postgres evaluates it once and caches the result.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.owns_vendor(vendor_id_input integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendors
    WHERE id = vendor_id_input
      AND user_id = (SELECT auth.uid())
  )
$$;

-- Fix the inline auth.uid() calls on the vendors SELECT policy.
-- Current: (is_active = true) OR (user_id = auth.uid()) OR is_admin()
-- auth.uid() here is called raw (per-row), not via the helper.
-- We drop and recreate it using (select auth.uid()) for the inline check.
DROP POLICY IF EXISTS "Active vendors are viewable by everyone" ON public.vendors;
CREATE POLICY "Active vendors are viewable by everyone"
  ON public.vendors
  FOR SELECT
  USING (
    (is_active = true)
    OR (user_id = (SELECT auth.uid()))
    OR is_admin()
  );

-- Fix vendors UPDATE policy
DROP POLICY IF EXISTS "Suppliers can update their own vendor" ON public.vendors;
CREATE POLICY "Suppliers can update their own vendor"
  ON public.vendors
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- Fix vendors DELETE policy
DROP POLICY IF EXISTS "Suppliers can delete their own vendor" ON public.vendors;
CREATE POLICY "Suppliers can delete their own vendor"
  ON public.vendors
  FOR DELETE
  USING (
    (user_id = (SELECT auth.uid()))
    OR is_admin()
  );
