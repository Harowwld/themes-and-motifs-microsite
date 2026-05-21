-- Migration: Add tin column to vendor_registrations, vendors, and vendor_subscriptions
ALTER TABLE public.vendor_registrations ADD COLUMN IF NOT EXISTS tin text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS tin text;
ALTER TABLE public.vendor_subscriptions ADD COLUMN IF NOT EXISTS tin text;
