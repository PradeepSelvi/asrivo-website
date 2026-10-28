-- Create private storage bucket for complaint proof documents (CWE-862 / F-029)
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof of complain', 'proof of complain', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Set allowed MIME types and ensure private bucket configuration
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
    public = false
WHERE id = 'proof of complain';

-- Set file size limit (3MB)
UPDATE storage.buckets
SET file_size_limit = 3145728
WHERE id = 'proof of complain';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read complaint proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete complaint proofs" ON storage.objects;

-- Create policy for public uploads (INSERT only — submitting proof with complaint)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proof of complain');

-- Create policy for authorized reviewer access (SELECT - authenticated admins only)
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

-- Create policy for admins to delete (DELETE)
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
