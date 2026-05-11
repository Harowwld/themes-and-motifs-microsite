-- Create wedding_moments table
CREATE TABLE IF NOT EXISTS wedding_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('photo', 'review', 'story', 'milestone')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'friends')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wedding_moments_user_id ON wedding_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_moments_created_at ON wedding_moments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wedding_moments_visibility ON wedding_moments(visibility);
CREATE INDEX IF NOT EXISTS idx_wedding_moments_type ON wedding_moments(moment_type);

-- Enable RLS
ALTER TABLE wedding_moments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own moments
CREATE POLICY "Users can view own moments" ON wedding_moments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own moments
CREATE POLICY "Users can insert own moments" ON wedding_moments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own moments
CREATE POLICY "Users can update own moments" ON wedding_moments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own moments
CREATE POLICY "Users can delete own moments" ON wedding_moments
  FOR DELETE USING (auth.uid() = user_id);

-- Public users can view public moments
CREATE POLICY "Public moments are viewable by everyone" ON wedding_moments
  FOR SELECT USING (visibility = 'public');

-- Create moment_photos table
CREATE TABLE IF NOT EXISTS moment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES wedding_moments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for moment_photos
CREATE INDEX IF NOT EXISTS idx_moment_photos_moment_id ON moment_photos(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_photos_upload_order ON moment_photos(upload_order);

-- Enable RLS for moment_photos
ALTER TABLE moment_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for moment_photos
-- Users can view photos of their own moments and public moments
CREATE POLICY "Users can view own moment photos" ON moment_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wedding_moments 
      WHERE wedding_moments.id = moment_photos.moment_id 
      AND (wedding_moments.user_id = auth.uid() OR wedding_moments.visibility = 'public')
    )
  );

-- Users can insert photos for their own moments
CREATE POLICY "Users can insert photos for own moments" ON moment_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_moments 
      WHERE wedding_moments.id = moment_photos.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Users can update photos of their own moments
CREATE POLICY "Users can update photos of own moments" ON moment_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wedding_moments 
      WHERE wedding_moments.id = moment_photos.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Users can delete photos of their own moments
CREATE POLICY "Users can delete photos of own moments" ON moment_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wedding_moments 
      WHERE wedding_moments.id = moment_photos.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_wedding_moments_updated_at 
    BEFORE UPDATE ON wedding_moments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
