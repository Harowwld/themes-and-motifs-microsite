-- Add theme_id to vendor_images to support tagging photos with themes
ALTER TABLE "public"."vendor_images" ADD COLUMN IF NOT EXISTS "theme_id" integer REFERENCES "public"."themes"("id") ON DELETE SET NULL;

-- Add new verification document URLs to vendor_subscriptions
ALTER TABLE "public"."vendor_subscriptions" ADD COLUMN IF NOT EXISTS "bir_doc_url" text;
ALTER TABLE "public"."vendor_subscriptions" ADD COLUMN IF NOT EXISTS "mayors_permit_url" text;
