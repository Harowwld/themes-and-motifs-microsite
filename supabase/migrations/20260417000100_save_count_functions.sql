-- Add RPC functions to increment/decrement vendor save_count

CREATE OR REPLACE FUNCTION increment_save_count(vendor_id INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vendors
  SET save_count = save_count + 1
  WHERE id = vendor_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_save_count(vendor_id INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE vendors
  SET save_count = GREATEST(save_count - 1, 0)
  WHERE id = vendor_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_save_count TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION decrement_save_count TO authenticated, anon, service_role;
