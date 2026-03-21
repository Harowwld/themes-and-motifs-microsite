CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_superadmins_id_type text;
  v_sessions_superadmin_id_type text;
BEGIN
  SELECT data_type
  INTO v_superadmins_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'superadmins'
    AND column_name = 'id';

  IF v_superadmins_id_type IS NULL THEN
    RAISE EXCEPTION 'public.superadmins table does not exist; run the base superadmin auth migration first.';
  END IF;

  IF v_superadmins_id_type = 'uuid' THEN
    SELECT data_type
    INTO v_sessions_superadmin_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'superadmin_sessions'
      AND column_name = 'superadmin_id';

    IF v_sessions_superadmin_id_type IS DISTINCT FROM 'uuid' THEN
      DROP TABLE IF EXISTS public.superadmin_sessions;

      CREATE TABLE public.superadmin_sessions (
        id bigserial PRIMARY KEY,
        superadmin_id uuid NOT NULL REFERENCES public.superadmins(id) ON DELETE CASCADE,
        token text NOT NULL UNIQUE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_superadmin_id ON public.superadmin_sessions(superadmin_id);
      CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_expires_at ON public.superadmin_sessions(expires_at);

      GRANT ALL ON TABLE public.superadmin_sessions TO service_role;
    END IF;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.superadmin_login(text, text);
DROP FUNCTION IF EXISTS public.superadmin_verify_password(bigint, text);
DROP FUNCTION IF EXISTS public.superadmin_verify_password(uuid, text);
DROP FUNCTION IF EXISTS public.superadmin_change_password(bigint, text);
DROP FUNCTION IF EXISTS public.superadmin_change_password(uuid, text);

CREATE OR REPLACE FUNCTION public.superadmin_login(p_username text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
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

CREATE OR REPLACE FUNCTION public.superadmin_verify_password(p_superadmin_id uuid, p_password text)
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

CREATE OR REPLACE FUNCTION public.superadmin_change_password(p_superadmin_id uuid, p_new_password text)
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

REVOKE ALL ON FUNCTION public.superadmin_login(text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.superadmin_verify_password(uuid, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.superadmin_change_password(uuid, text) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.superadmin_login(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.superadmin_verify_password(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.superadmin_change_password(uuid, text) TO service_role;
