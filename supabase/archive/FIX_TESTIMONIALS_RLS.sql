-- Allow public to submit testimonials (they land as unverified/pending)
DROP POLICY IF EXISTS "Enable insert for all users" ON testimonials;
CREATE POLICY "Enable insert for all users" ON testimonials
  FOR INSERT
  WITH CHECK (true);
