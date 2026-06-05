-- Add theme_id to vendor_images table
ALTER TABLE "public"."vendor_images" ADD COLUMN IF NOT EXISTS "theme_id" integer;

-- Add foreign key constraint to themes table
ALTER TABLE "public"."vendor_images" 
  ADD CONSTRAINT "vendor_images_theme_id_fkey" 
  FOREIGN KEY ("theme_id") 
  REFERENCES "public"."themes"("id") 
  ON DELETE SET NULL;

-- Create an index for faster querying by theme
CREATE INDEX IF NOT EXISTS "idx_vendor_images_theme" ON "public"."vendor_images" USING btree ("theme_id");
