-- Allow established_professional badge to coexist with verification_in_progress.
-- Previously, the trigger forcibly cleared established_professional when
-- verification_in_progress was set, hiding the 10-year badge during verification.
-- This migration removes that suppression and enforces non-null document_verified.

CREATE OR REPLACE FUNCTION public.update_vendor_established_status()
RETURNS trigger AS $$
DECLARE
  current_year integer;
  established_year integer;
  is_10_years boolean;
  statuses text[];
  new_statuses text[];
  s text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::integer;

  IF NEW.year_established IS NOT NULL THEN
    established_year := EXTRACT(YEAR FROM NEW.year_established)::integer;
    is_10_years := (current_year - established_year) >= 10;
  ELSE
    is_10_years := false;
  END IF;

  -- Parse current document_verified
  IF NEW.document_verified IS NOT NULL AND NEW.document_verified <> '' THEN
    SELECT array_agg(trim(val)) INTO statuses
    FROM unnest(string_to_array(NEW.document_verified, ',')) val;
  ELSE
    statuses := ARRAY[]::text[];
  END IF;

  -- Filter out existing 'established_professional' and empty/null items
  new_statuses := ARRAY[]::text[];
  IF statuses IS NOT NULL THEN
    FOREACH s IN ARRAY statuses LOOP
      IF s <> 'established_professional' AND s <> '' AND s IS NOT NULL THEN
        new_statuses := array_append(new_statuses, s);
      END IF;
    END LOOP;
  END IF;

  -- NOTE: verification_in_progress and established_professional CAN now coexist.
  -- A vendor that has been in business for 10+ years retains their established badge
  -- even while their documents are undergoing verification.
  -- Append 'established_professional' if vendor is at least 10 years old.
  IF is_10_years THEN
    new_statuses := array_append(new_statuses, 'established_professional');
  END IF;

  -- Serialize back to NEW.document_verified.
  -- Never set to NULL — default to 'verification_in_progress' when the array is empty.
  IF array_length(new_statuses, 1) IS NULL THEN
    NEW.document_verified := 'verification_in_progress';
  ELSE
    NEW.document_verified := array_to_string(new_statuses, ',');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill: set any NULL document_verified to 'verification_in_progress'
UPDATE public.vendors
SET document_verified = 'verification_in_progress'
WHERE document_verified IS NULL OR document_verified = '';

-- Enforce NOT NULL at the column level going forward
ALTER TABLE public.vendors
  ALTER COLUMN document_verified SET NOT NULL,
  ALTER COLUMN document_verified SET DEFAULT 'verification_in_progress';

-- Re-sync all vendors so the trigger applies to existing records
-- (re-appends established_professional where suppressed previously)
UPDATE public.vendors SET updated_at = now();
