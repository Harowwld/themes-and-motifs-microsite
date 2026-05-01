-- Migration: Unify superadmin auth with Supabase Auth
-- This adds auth_user_id to link superadmins with auth.users

-- Add auth_user_id column to superadmins table
ALTER TABLE public.superadmins 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create unique index to ensure one superadmin per auth user
CREATE UNIQUE INDEX IF NOT EXISTS idx_superadmins_auth_user_id 
ON public.superadmins(auth_user_id) 
WHERE auth_user_id IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_superadmins_auth_user_id_lookup 
ON public.superadmins(auth_user_id);

-- Function to automatically create superadmin record when a user with role='superadmin' is created
-- This is for future use when creating superadmins via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_superadmin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user's role is 'superadmin' in raw_user_meta_data or public.users
  IF NEW.raw_user_meta_data->>'role' = 'superadmin' THEN
    -- Check if superadmin record already exists
    IF NOT EXISTS (SELECT 1 FROM public.superadmins WHERE auth_user_id = NEW.id) THEN
      INSERT INTO public.superadmins (id, username, password_hash, is_active, auth_user_id)
      VALUES (
        gen_random_uuid(),
        NEW.email,
        '', -- Empty password hash since auth is handled by Supabase
        true,
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_superadmin ON auth.users;
CREATE TRIGGER on_auth_user_created_superadmin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_superadmin_user();

-- Function to sync role changes
CREATE OR REPLACE FUNCTION public.sync_superadmin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changed to 'superadmin', create superadmin record if not exists
  IF NEW.role = 'superadmin' AND OLD.role != 'superadmin' THEN
    IF NOT EXISTS (SELECT 1 FROM public.superadmins WHERE auth_user_id = NEW.id) THEN
      INSERT INTO public.superadmins (id, username, password_hash, is_active, auth_user_id)
      VALUES (
        gen_random_uuid(),
        NEW.email,
        '',
        true,
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To migrate existing superadmin to Supabase Auth:
-- 1. Create a user in auth.users with the superadmin's email
-- 2. Set the user's role in raw_user_meta_data to 'superadmin'
-- 3. Update the superadmins table to set auth_user_id
-- 
-- Example (run manually after creating auth user):
-- UPDATE public.superadmins 
-- SET auth_user_id = 'auth-user-uuid-here'
-- WHERE username = 'admin';
