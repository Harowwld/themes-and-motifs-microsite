-- Create trigger to enforce wedding moments and photos quotas for standard accounts
CREATE OR REPLACE FUNCTION check_moment_quotas()
RETURNS TRIGGER AS $$
DECLARE
  is_prem BOOLEAN;
  existing_albums INT;
  existing_photos INT;
  target_user_id UUID;
BEGIN
  -- 1. Identify target couple user_id
  IF TG_TABLE_NAME = 'wedding_moments' THEN
    target_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'moment_photos' THEN
    SELECT user_id INTO target_user_id FROM wedding_moments WHERE id = NEW.moment_id;
  END IF;

  -- 2. Check user premium status
  SELECT is_premium INTO is_prem FROM soon_to_wed_profiles WHERE user_id = target_user_id;
  
  IF NOT COALESCE(is_prem, false) THEN
    -- 3. Check album count for 'photo' moment types
    IF TG_TABLE_NAME = 'wedding_moments' AND NEW.moment_type = 'photo' THEN
      SELECT COUNT(*) INTO existing_albums FROM wedding_moments WHERE user_id = target_user_id AND moment_type = 'photo';
      IF existing_albums >= 1 THEN
        RAISE EXCEPTION 'Free accounts are limited to 1 photo album. Please upgrade to Premium to upload more albums!';
      END IF;
    END IF;

    -- 4. Check total photo count
    IF TG_TABLE_NAME = 'moment_photos' THEN
      SELECT COUNT(*) INTO existing_photos FROM moment_photos 
      JOIN wedding_moments ON moment_photos.moment_id = wedding_moments.id 
      WHERE wedding_moments.user_id = target_user_id;
      
      IF existing_photos >= 10 THEN
        RAISE EXCEPTION 'Free accounts are limited to 10 photos total. Please upgrade to Premium to upload more photos!';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers to ensure clean execution
DROP TRIGGER IF EXISTS check_wedding_moments_quotas ON wedding_moments;
CREATE TRIGGER check_wedding_moments_quotas
  BEFORE INSERT ON wedding_moments
  FOR EACH ROW
  EXECUTE FUNCTION check_moment_quotas();

DROP TRIGGER IF EXISTS check_moment_photos_quotas ON moment_photos;
CREATE TRIGGER check_moment_photos_quotas
  BEFORE INSERT ON moment_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_moment_quotas();
