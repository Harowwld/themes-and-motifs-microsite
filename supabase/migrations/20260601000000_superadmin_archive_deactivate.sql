-- Add is_archived to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Add is_active and is_archived to public.wedding_moments
ALTER TABLE public.wedding_moments ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.wedding_moments ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies on wedding_moments if necessary to prevent non-active or archived posts from being viewed publicly
-- Public users should only see active, non-archived public moments
DROP POLICY IF EXISTS "Public moments are viewable by everyone" ON public.wedding_moments;
CREATE POLICY "Public moments are viewable by everyone" ON public.wedding_moments
  FOR SELECT USING (visibility = 'public' AND is_active = true AND is_archived = false);
