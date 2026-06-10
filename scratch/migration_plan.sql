-- 1. Create island_groups
CREATE TABLE public.island_groups (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert island groups
INSERT INTO public.island_groups (id, name) VALUES
(2, 'Luzon'),
(3, 'Visayas'),
(4, 'Mindanao');

-- 2. Add island_group_id to regions
ALTER TABLE public.regions ADD COLUMN island_group_id integer REFERENCES public.island_groups(id);

-- Update regions with island_group_id
UPDATE public.regions SET island_group_id = 2 WHERE id IN (1, 5, 6, 7, 8, 9, 10, 11, 22);
UPDATE public.regions SET island_group_id = 3 WHERE id IN (12, 13, 14, 15);
UPDATE public.regions SET island_group_id = 4 WHERE id IN (16, 17, 18, 19, 20, 21);

-- 3. Create provinces
CREATE TABLE public.provinces (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    region_id integer REFERENCES public.regions(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert provinces mapping to correct regions
-- NCR (Region 1) -> Metro Manila (22)
INSERT INTO public.provinces (id, name, region_id) VALUES (22, 'Metro Manila', 1);

-- CAR (5)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 5 FROM public.regions WHERE id IN (23, 29, 35, 57, 62, 75);
-- Ilocos (6)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 6 FROM public.regions WHERE id IN (58, 59, 63, 83);
-- Cagayan Valley (7)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 7 FROM public.regions WHERE id IN (33, 40, 61, 80, 85);
-- Central Luzon (8)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 8 FROM public.regions WHERE id IN (30, 32, 39, 79, 82, 98, 100);
-- Calabarzon (9)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 9 FROM public.regions WHERE id IN (34, 46, 64, 84, 86);
-- Mimaropa (10)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 10 FROM public.regions WHERE id IN (69, 71, 72, 81, 87);
-- Bicol (11)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 11 FROM public.regions WHERE id IN (27, 41, 42, 45, 70, 91);
-- Western Visayas (12)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 12 FROM public.regions WHERE id IN (26, 28, 44, 56, 60);
-- NIR (13)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 13 FROM public.regions WHERE id IN (76, 77, 90);
-- Central Visayas (14)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 14 FROM public.regions WHERE id IN (37, 47);
-- Eastern Visayas (15)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 15 FROM public.regions WHERE id IN (36, 55, 67, 78, 88, 93);
-- Zamboanga Pen (16)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 16 FROM public.regions WHERE id IN (101, 102, 103);
-- Northern Mindanao (17)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 17 FROM public.regions WHERE id IN (38, 43, 65, 73, 74);
-- Davao (18)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 18 FROM public.regions WHERE id IN (48, 50, 51, 52, 53);
-- Soccsksargen (19)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 19 FROM public.regions WHERE id IN (49, 89, 92, 94);
-- Caraga (20)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 20 FROM public.regions WHERE id IN (24, 25, 54, 96, 97);
-- BARMM (21)
INSERT INTO public.provinces (id, name, region_id) SELECT id, name, 21 FROM public.regions WHERE id IN (31, 66, 68, 95, 99);

-- 4. Update cities schema
ALTER TABLE public.cities DROP CONSTRAINT IF EXISTS cities_region_id_fkey;
ALTER TABLE public.cities RENAME COLUMN region_id TO province_id;
ALTER TABLE public.cities ADD CONSTRAINT cities_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);

-- 5. Delete provinces, island groups, and duplicate NCR from regions table
DELETE FROM public.regions WHERE id >= 22;
DELETE FROM public.regions WHERE id IN (2, 3, 4);

-- 6. Add city_id to vendors
ALTER TABLE public.vendors ADD COLUMN city_id integer REFERENCES public.cities(id);

-- 7. Update vendors region_id if needed. (Right now they use 1, 5-21, which are correct).
-- We can also map their 'city' string to city_id later via a fuzzy match, but for now we just add the column.
