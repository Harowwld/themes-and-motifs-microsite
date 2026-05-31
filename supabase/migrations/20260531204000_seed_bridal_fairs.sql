-- Seed high-fidelity bridal fair events
INSERT INTO public.bridal_fairs (
  title,
  slug,
  description,
  start_date,
  end_date,
  venue,
  venue_address,
  image_url,
  registration_url,
  is_active,
  is_featured
) VALUES
(
  'The Grand Bridal Fair 2026',
  'the-grand-bridal-fair-2026',
  'Experience the country''s most prestigious and highly-anticipated wedding supplier exhibition. Meet over 300+ DOT-accredited caterers, designers, coordinators, and photographers to make your dream wedding a reality with exclusive discounts.',
  '2026-06-20',
  '2026-06-21',
  'Marriott Grand Ballroom',
  '2 Resort Drive, Newport City, Pasay City, Metro Manila',
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  '/vendors',
  true,
  true
),
(
  'Spring Couture Wedding Showcase 2026',
  'spring-couture-wedding-showcase-2026',
  'An intimate, bespoke wedding consultation event featuring exclusive bridal fashion runways, custom floral installation galleries, and tasting sessions from premier local artisan patisseries and boutique caterers.',
  '2026-08-15',
  '2026-08-16',
  'Crimson Hotel Filinvest City',
  'Entrata Urban Complex, Filinvest Corporate City, Alabang, Muntinlupa City',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
  '/vendors',
  true,
  false
)
ON CONFLICT (slug) DO NOTHING;
