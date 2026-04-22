-- Combine vendor and user role queries into a single function
DROP FUNCTION IF EXISTS get_user_vendor_role(UUID);

CREATE FUNCTION get_user_vendor_role(p_user_id UUID)
RETURNS TABLE (vendor_id BIGINT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vendor_id BIGINT;
  v_role TEXT;
BEGIN
  SELECT id INTO v_vendor_id FROM vendors WHERE user_id = p_user_id LIMIT 1;

  SELECT users.role INTO v_role FROM users WHERE users.id = p_user_id LIMIT 1;

  RETURN QUERY SELECT v_vendor_id, v_role;
END;
$$;
