-- Migration: Create superadmin invitations table for invite-only signup
-- Allows existing superadmins to invite new superadmins

CREATE TABLE IF NOT EXISTS public.superadmin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.superadmins(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_superadmin_invitations_token 
ON public.superadmin_invitations(token);

-- Create index for email lookups (to prevent duplicate active invites)
CREATE INDEX IF NOT EXISTS idx_superadmin_invitations_email 
ON public.superadmin_invitations(email) 
WHERE used_at IS NULL;

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION public.generate_superadmin_invite_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Revoke permissions
REVOKE ALL ON TABLE public.superadmin_invitations FROM anon, authenticated;

-- Grant permissions to service_role
GRANT ALL ON TABLE public.superadmin_invitations TO service_role;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION public.generate_superadmin_invite_token() TO service_role;
