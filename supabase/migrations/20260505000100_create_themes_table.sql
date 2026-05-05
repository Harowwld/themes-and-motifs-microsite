-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_themes join table
CREATE TABLE IF NOT EXISTS vendor_themes (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, theme_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_themes_vendor_id ON vendor_themes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_themes_theme_id ON vendor_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);

-- Enable RLS on vendor_themes
ALTER TABLE vendor_themes ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_themes
CREATE POLICY "Allow public read on vendor_themes"
  ON vendor_themes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on vendor_themes"
  ON vendor_themes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on vendor_themes"
  ON vendor_themes FOR DELETE
  USING (true);

-- Enable RLS on themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Create policies for themes
CREATE POLICY "Allow public read on themes"
  ON themes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on themes"
  ON themes FOR INSERT
  WITH CHECK (true);

-- Insert some default themes
INSERT INTO themes (name, slug, description) VALUES
  ('Rustic', 'rustic', 'Natural, earthy, and countryside-inspired weddings'),
  ('Modern', 'modern', 'Clean lines, minimal decor, and contemporary aesthetics'),
  ('Vintage', 'vintage', 'Classic, old-world charm and antique elements'),
  ('Bohemian', 'bohemian', 'Free-spirited, eclectic, and nature-focused style'),
  ('Romantic', 'romantic', 'Soft colors, delicate details, and dreamy ambiance'),
  ('Garden', 'garden', 'Outdoor settings with lush greenery and flowers'),
  ('Beach', 'beach', 'Coastal, tropical, and ocean-inspired weddings'),
  ('Elegant', 'elegant', 'Sophisticated, refined, and luxurious celebrations'),
  ('Minimalist', 'minimalist', 'Simple, clean, and uncluttered design'),
  ('Traditional', 'traditional', 'Classic, time-honored wedding customs and decor'),
  ('Industrial', 'industrial', 'Raw spaces, exposed elements, and urban venues'),
  ('Fairytale', 'fairytale', 'Whimsical, magical, and storybook-inspired themes')
ON CONFLICT (slug) DO NOTHING;
