-- Create system_settings table to store global site configurations
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to ensure safe re-run of migration if needed)
DROP POLICY IF EXISTS "Allow public read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow active superadmins write system_settings" ON public.system_settings;

-- Create policy to allow public read access (necessary for couples and guests visiting standard pages to read configuration)
CREATE POLICY "Allow public read system_settings"
  ON public.system_settings
  FOR SELECT
  USING (true);

-- Create policy to restrict insert/update/delete strictly to active superadmins
CREATE POLICY "Allow active superadmins write system_settings"
  ON public.system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.superadmins
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.superadmins
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  );

-- Seed global_ads_enabled default setting
INSERT INTO public.system_settings (key, value)
VALUES ('global_ads_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
