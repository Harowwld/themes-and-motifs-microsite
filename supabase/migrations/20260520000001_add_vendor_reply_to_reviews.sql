-- Migration: Add vendor reply columns to reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS vendor_reply_text text,
ADD COLUMN IF NOT EXISTS vendor_reply_at timestamp without time zone;
