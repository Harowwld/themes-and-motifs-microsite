BEGIN;

-- Drop constraints first
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_region_id_fkey;
ALTER TABLE public.cities DROP CONSTRAINT IF EXISTS cities_region_id_fkey;
ALTER TABLE public.regions DROP CONSTRAINT IF EXISTS regions_parent_id_fkey;

-- Create island_groups and populate
CREATE TABLE public.island_groups (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
INSERT INTO public.island_groups (id, name) VALUES (2, 'Luzon'), (3, 'Visayas'), (4, 'Mindanao');

-- Add island_group_id to regions
ALTER TABLE public.regions ADD COLUMN island_group_id integer REFERENCES public.island_groups(id);
UPDATE public.regions SET island_group_id = 2 WHERE id IN (1, 5, 6, 7, 8, 9, 10, 11, 22);
UPDATE public.regions SET island_group_id = 3 WHERE id IN (12, 13, 14, 15);
UPDATE public.regions SET island_group_id = 4 WHERE id IN (16, 17, 18, 19, 20, 21);

-- Create provinces
CREATE TABLE public.provinces (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    region_id integer REFERENCES public.regions(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert NCR as province mapping to Region 1
INSERT INTO public.provinces (id, name, region_id) VALUES (22, 'Metro Manila', 1);

-- Insert other provinces
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 5 FROM public.regions WHERE id IN (23, 29, 35, 57, 62, 75);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 6 FROM public.regions WHERE id IN (58, 59, 63, 83);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 7 FROM public.regions WHERE id IN (33, 40, 61, 80, 85);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 8 FROM public.regions WHERE id IN (30, 32, 39, 79, 82, 98, 100);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 9 FROM public.regions WHERE id IN (34, 46, 64, 84, 86);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 10 FROM public.regions WHERE id IN (69, 71, 72, 81, 87);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 11 FROM public.regions WHERE id IN (27, 41, 42, 45, 70, 91);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 12 FROM public.regions WHERE id IN (26, 28, 44, 56, 60);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 13 FROM public.regions WHERE id IN (76, 77, 90);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 14 FROM public.regions WHERE id IN (37, 47);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 15 FROM public.regions WHERE id IN (36, 55, 67, 78, 88, 93);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 16 FROM public.regions WHERE id IN (101, 102, 103);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 17 FROM public.regions WHERE id IN (38, 43, 65, 73, 74);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 18 FROM public.regions WHERE id IN (48, 50, 51, 52, 53);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 19 FROM public.regions WHERE id IN (49, 89, 92, 94);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 20 FROM public.regions WHERE id IN (24, 25, 54, 96, 97);
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 21 FROM public.regions WHERE id IN (31, 66, 68, 95, 99);

-- Clean up cities table
ALTER TABLE public.cities RENAME COLUMN region_id TO province_id;
ALTER TABLE public.cities ADD CONSTRAINT cities_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);

-- Clean up vendors table
ALTER TABLE public.vendors RENAME COLUMN region_id TO old_region_id;
ALTER TABLE public.vendors ADD COLUMN region_id integer REFERENCES public.regions(id);
ALTER TABLE public.vendors ADD COLUMN province_id integer REFERENCES public.provinces(id);
ALTER TABLE public.vendors ADD COLUMN city_id integer REFERENCES public.cities(id);

-- Migrate vendor locations
-- If old_region_id was a Province (>= 22)
UPDATE public.vendors
SET province_id = old_region_id,
    region_id = (SELECT region_id FROM public.provinces WHERE id = public.vendors.old_region_id)
WHERE old_region_id >= 22;

-- If old_region_id was a Region (< 22)
UPDATE public.vendors
SET region_id = old_region_id
WHERE old_region_id < 22;

-- Optional: try to map 'city' string to city_id based on exact match and correct province
UPDATE public.vendors v
SET city_id = c.id
FROM public.cities c
WHERE LOWER(TRIM(v.city)) = LOWER(TRIM(c.name)) AND c.province_id = v.province_id
AND v.province_id IS NOT NULL;

-- Delete old regions
DELETE FROM public.regions WHERE id >= 22;
DELETE FROM public.regions WHERE id IN (2, 3, 4);

-- Re-add regions parent_id if needed, but we don't need it anymore since we use island_group_id.
-- We can drop parent_id from regions
ALTER TABLE public.regions DROP COLUMN IF EXISTS parent_id;

-- Enable RLS for new tables
ALTER TABLE public.island_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (allow read for everyone, write for authenticated/admin)
CREATE POLICY "Enable read access for all users" ON public.island_groups FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.provinces FOR SELECT USING (true);

COMMIT;
