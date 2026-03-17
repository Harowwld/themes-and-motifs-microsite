CREATE TABLE IF NOT EXISTS public.superadmins (
  id bigserial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.superadmin_sessions (
  id bigserial PRIMARY KEY,
  superadmin_id bigint NOT NULL REFERENCES public.superadmins(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_superadmin_id ON public.superadmin_sessions(superadmin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_expires_at ON public.superadmin_sessions(expires_at);

DROP FUNCTION IF EXISTS public.superadmin_login(text, text);

CREATE OR REPLACE FUNCTION public.superadmin_login(p_username text, p_password text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id bigint;
BEGIN
  SELECT id
  INTO v_id
  FROM public.superadmins
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash)
  LIMIT 1;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.superadmin_verify_password(p_superadmin_id bigint, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT password_hash
  INTO v_hash
  FROM public.superadmins
  WHERE id = p_superadmin_id;

  IF v_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_hash = crypt(p_password, v_hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.superadmin_change_password(p_superadmin_id bigint, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash text;
BEGIN
  v_hash := crypt(p_new_password, gen_salt('bf'));

  UPDATE public.superadmins
  SET password_hash = v_hash,
      updated_at = now()
  WHERE id = p_superadmin_id;
END;
$$;

REVOKE ALL ON TABLE public.superadmins FROM anon, authenticated;
REVOKE ALL ON TABLE public.superadmin_sessions FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.superadmin_login(text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.superadmin_verify_password(bigint, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.superadmin_change_password(bigint, text) FROM anon, authenticated;

GRANT ALL ON TABLE public.superadmins TO service_role;
GRANT ALL ON TABLE public.superadmin_sessions TO service_role;
GRANT EXECUTE ON FUNCTION public.superadmin_login(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.superadmin_verify_password(bigint, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.superadmin_change_password(bigint, text) TO service_role;
