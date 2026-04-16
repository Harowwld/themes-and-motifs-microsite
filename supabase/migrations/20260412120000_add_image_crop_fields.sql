-- Add crop fields to vendor_images table
-- TODO: Uncomment when vendor_images table is created
-- ALTER TABLE vendor_images ADD COLUMN IF NOT EXISTS focus_x numeric(5,2) DEFAULT 50;
-- ALTER TABLE vendor_images ADD COLUMN IF NOT EXISTS focus_y numeric(5,2) DEFAULT 50;
-- ALTER TABLE vendor_images ADD COLUMN IF NOT EXISTS zoom numeric(3,2) DEFAULT 1;

-- Add index for faster queries
-- CREATE INDEX IF NOT EXISTS idx_vendor_images_vendor_id ON vendor_images(vendor_id);
