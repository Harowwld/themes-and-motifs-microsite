-- Create vendor_reviews table
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES public.wedding_moments(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating INTEGER NOT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_moment_id ON public.vendor_reviews(moment_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);

-- Enable RLS
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view vendor reviews linked to moments they can view
CREATE POLICY "Users can view own moment reviews" ON public.vendor_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wedding_moments 
      WHERE wedding_moments.id = vendor_reviews.moment_id 
      AND (wedding_moments.user_id = auth.uid() OR wedding_moments.visibility = 'public')
    )
  );

-- Users can insert reviews for moments they own
CREATE POLICY "Users can insert reviews for own moments" ON public.vendor_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_moments 
      WHERE wedding_moments.id = vendor_reviews.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Users can update reviews of moments they own
CREATE POLICY "Users can update reviews of own moments" ON public.vendor_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.wedding_moments 
      WHERE wedding_moments.id = vendor_reviews.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Users can delete reviews of moments they own
CREATE POLICY "Users can delete reviews of own moments" ON public.vendor_reviews
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.wedding_moments 
      WHERE wedding_moments.id = vendor_reviews.moment_id 
      AND wedding_moments.user_id = auth.uid()
    )
  );

-- Attach updated_at trigger
CREATE TRIGGER update_vendor_reviews_updated_at 
    BEFORE UPDATE ON public.vendor_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
