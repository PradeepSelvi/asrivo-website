-- ============================================
-- CREATE PARTNERSHIP-DOCUMENTS STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create private bucket for partnership documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnership-documents', 
  'partnership-documents', 
  false, -- PRIVATE bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf'] -- PDF ONLY for security
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Step 2: Storage Policies
-- Allow public to upload (secured by API validation)
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

-- Restrict read access strictly to verified administrators (Finding f72d2a11 / CWE-862)
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Restrict delete access strictly to verified administrators (Finding 53e19df2 / CWE-863 / F-024)
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Step 3: Verify bucket creation
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'partnership-documents';
