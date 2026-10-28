-- Migration: Make inquiry-documents storage bucket private (Finding F-037 / CWE-862)
-- Description: Sets public = false on inquiry-documents bucket, removes public SELECT policy,
-- and restricts object read and delete operations strictly to authenticated administrators.
-- Public users can only upload files via the inquiry submission form.

-- 1. Ensure bucket exists and is set to private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-documents',
  'inquiry-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Drop existing policies to avoid duplicates and remove public read access
DROP POLICY IF EXISTS "Allow public read access to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete inquiry-documents" ON storage.objects;

-- 3. Policy: Public upload allowed for form submissions
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'inquiry-documents');

-- 4. Policy: Only authenticated admins can read/list objects directly
CREATE POLICY "Allow admins to read inquiry-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'inquiry-documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 5. Policy: Only authenticated admins can delete objects
CREATE POLICY "Allow admins to delete inquiry-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'inquiry-documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
