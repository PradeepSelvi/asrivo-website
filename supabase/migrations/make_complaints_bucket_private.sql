-- Migration: Make complaint proof bucket private and restrict access (Finding F-029 / CWE-862)
-- Description: Ensures proof of complain bucket is private and removes public SELECT policies.

-- 1. Ensure bucket is private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof of complain',
  'proof of complain',
  false,
  3145728, -- 3MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- 2. Drop insecure public SELECT policies
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to complaint proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read complaint proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete complaint proofs" ON storage.objects;

-- 3. Policy for public inserts (file upload on complaint submission)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proof of complain');

-- 4. Policy for authorized admin reviews (SELECT)
CREATE POLICY "Allow admins to read complaint proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof of complain' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 5. Policy for admin deletions (DELETE)
CREATE POLICY "Allow admins to delete complaint proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'proof of complain' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
