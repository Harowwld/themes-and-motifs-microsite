-- Update all existing vendors to verified status
UPDATE vendors
SET verified_status = 'verified'
WHERE verified_status IS NULL OR verified_status != 'verified';
