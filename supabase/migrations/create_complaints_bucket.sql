-- Create storage bucket for complaint proof documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof of complain', 'proof of complain', true)
ON CONFLICT (id) DO NOTHING;

-- Set allowed MIME types for the bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'proof of complain';

-- Set file size limit (3MB)
UPDATE storage.buckets
SET file_size_limit = 3145728
WHERE id = 'proof of complain';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;

-- Create policy for public uploads (INSERT)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proof of complain');

-- Create policy for public access (SELECT)
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proof of complain');
