-- Migration to add foreign key relation between wedding_moments and public.users
-- This allows PostgREST to resolve the schema join query for superadmin posts page

ALTER TABLE public.wedding_moments 
  DROP CONSTRAINT IF EXISTS fk_wedding_moments_users;

ALTER TABLE public.wedding_moments 
  ADD CONSTRAINT fk_wedding_moments_users 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;
