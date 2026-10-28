-- ==============================================================================
-- Migration: Create Storage Bucket for Job Application Resumes (PDF Only, Private)
-- Description: Creates the 'resumes' storage bucket with strict 10 MB limit,
--              enforcing application/pdf MIME type, private access, and RLS policies.
-- ==============================================================================

-- 1. Create or update storage bucket as PRIVATE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,  -- PRIVATE bucket
  10485760, -- 10 MB limit
  ARRAY['application/pdf'] -- Strictly PDF only
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload resume" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete resumes" ON storage.objects;

-- 3. Policy: Anyone can upload a resume (INSERT)
CREATE POLICY "Anyone can upload resume"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'resumes'
);

-- 4. Policy: Only admins can view resumes (F-013 / CWE-863)
CREATE POLICY "Admins can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 5. Policy: Only admins can update resumes (F-013 / CWE-863)
CREATE POLICY "Admins can update resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
)
WITH CHECK (bucket_id = 'resumes');

-- 6. Policy: Only admins can delete resumes (F-013 / CWE-863)
CREATE POLICY "Admins can delete resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 7. Verification Query
SELECT 
  id, 
  name, 
  public, 
  file_size_limit AS max_bytes,
  (file_size_limit / 1024 / 1024) || ' MB' AS max_size_mb,
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'resumes';
