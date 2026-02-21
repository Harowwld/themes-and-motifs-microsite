ALTER TABLE public.vendor_registrations
ADD COLUMN IF NOT EXISTS extra jsonb;

UPDATE public.vendor_registrations
SET
  extra = CASE
    WHEN description ~ E'\n\n---\nEXTRA_JSON:' THEN (substring(description from E'\n\n---\nEXTRA_JSON:(.*)$'))::jsonb
    ELSE extra
  END,
  description = CASE
    WHEN description ~ E'\n\n---\nEXTRA_JSON:' THEN trim(substring(description from E'^(.*)\n\n---\nEXTRA_JSON:'))
    ELSE description
  END
WHERE description IS NOT NULL
  AND description ~ E'\n\n---\nEXTRA_JSON:';
