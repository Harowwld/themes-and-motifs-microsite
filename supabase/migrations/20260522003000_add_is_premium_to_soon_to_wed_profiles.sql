-- Add is_premium column to soon_to_wed_profiles
ALTER TABLE "public"."soon_to_wed_profiles" ADD COLUMN IF NOT EXISTS "is_premium" BOOLEAN DEFAULT FALSE;
