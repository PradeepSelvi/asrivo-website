-- Create storage bucket for partnership documents (PRIVATE)
-- Run this in Supabase SQL Editor

-- Step 1: Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnership-documents', 
  'partnership-documents', 
  false,  -- PRIVATE bucket
  10485760,  -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Step 2: Create storage policies
-- Allow public to upload (secured by API validation)
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

-- Allow authenticated users (admins) to read
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partnership-documents');

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partnership-documents');

-- Step 3: Verify bucket creation
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'partnership-documents';
