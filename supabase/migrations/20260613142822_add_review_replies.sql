-- Create review_replies table for soon-to-wed users to reply to reviews
CREATE TABLE IF NOT EXISTS review_replies (
  id bigserial PRIMARY KEY,
  review_id bigint NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS review_replies_review_id_idx ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS review_replies_user_id_idx ON review_replies(user_id);

-- Row-Level Security
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read replies on published reviews
CREATE POLICY "review_replies_select" ON review_replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_replies.review_id
        AND r.status = 'published'
    )
  );

-- Authenticated users can insert their own replies
CREATE POLICY "review_replies_insert" ON review_replies
  FOR INSERT
  TO authenticated
  WITH CHECK ( (select auth.uid()) = user_id );

-- Users can delete their own replies
CREATE POLICY "review_replies_delete" ON review_replies
  FOR DELETE
  TO authenticated
  USING ( (select auth.uid()) = user_id );

-- Grants for authenticated role
GRANT SELECT, INSERT, DELETE ON review_replies TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE review_replies_id_seq TO authenticated;
