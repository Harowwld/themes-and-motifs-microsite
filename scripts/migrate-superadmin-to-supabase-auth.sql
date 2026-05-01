-- Migration Script: Link Existing Superadmin to Supabase Auth
-- 
-- This script helps migrate an existing superadmin from custom password-based auth
-- to Supabase Auth. Run this after creating the auth user in Supabase.
--
-- IMPORTANT: You must first create the auth user via Supabase Dashboard or API
-- before running this script.

-- Step 1: Create the auth user (do this via Supabase Dashboard or API)
-- Go to Supabase Dashboard -> Authentication -> Users -> Add User
-- Or use the Supabase API to create a user with email and password

-- Step 2: Get the auth user's UUID
-- After creating the user, note their UUID from the Supabase Dashboard

-- Step 3: Update the superadmins table to link the auth user
-- Replace 'auth-user-uuid-here' with the actual UUID from Supabase Auth
-- Replace 'admin' with your superadmin's username if different

-- Example:
-- UPDATE public.superadmins 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000000'
-- WHERE username = 'admin';

-- Or if you know the superadmin's ID:
-- UPDATE public.superadmins 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000000'
-- WHERE id = 'your-superadmin-id';

-- Verify the link was created:
-- SELECT s.id, s.username, s.auth_user_id, u.email
-- FROM public.superadmins s
-- LEFT JOIN auth.users u ON s.auth_user_id = u.id
-- WHERE s.username = 'admin';

-- After migration:
-- 1. The superadmin can now log in using email/password via Supabase Auth
-- 2. Legacy sessions will still work during the transition period
-- 3. Once verified, you can optionally clear the password_hash column:
--    UPDATE public.superadmins SET password_hash = '' WHERE auth_user_id IS NOT NULL;
