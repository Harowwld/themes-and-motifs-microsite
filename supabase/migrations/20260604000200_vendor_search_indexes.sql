-- Optimize search_vendors RPC with partial and GIN indexes

-- Ensure pg_trgm is enabled for ILIKE queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Partial index for active vendors (the RPC always filters by is_active = true)
-- Using IF NOT EXISTS safely. (Note: CONCURRENTLY is normally preferred in production but cannot be run inside a transaction block easily via Supabase CLI sometimes, we will omit CONCURRENTLY for local dev migrations).
CREATE INDEX IF NOT EXISTS idx_vendors_active_partial
ON public.vendors (id) 
WHERE is_active = true;

-- GIN index for fast ILIKE search on business_name
CREATE INDEX IF NOT EXISTS idx_vendors_business_name_trgm 
ON public.vendors USING GIN (business_name gin_trgm_ops);

-- Index for ordering by rating (most common sort)
CREATE INDEX IF NOT EXISTS idx_vendors_rating_active
ON public.vendors (average_rating DESC NULLS LAST, review_count DESC NULLS LAST)
WHERE is_active = true;

-- Index for location/city text search
CREATE INDEX IF NOT EXISTS idx_vendors_city_trgm
ON public.vendors USING GIN (city gin_trgm_ops);
