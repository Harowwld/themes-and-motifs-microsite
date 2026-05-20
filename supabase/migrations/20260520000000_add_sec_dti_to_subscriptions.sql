-- Migration: Add SEC and DTI document columns to vendor_subscriptions
ALTER TABLE public.vendor_subscriptions
ADD COLUMN IF NOT EXISTS sec_doc_url text,
ADD COLUMN IF NOT EXISTS dti_doc_url text;
