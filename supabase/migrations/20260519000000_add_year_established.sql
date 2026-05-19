-- Add year_established column as a date data type
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS year_established date;
ALTER TABLE public.vendor_registrations ADD COLUMN IF NOT EXISTS year_established date;
