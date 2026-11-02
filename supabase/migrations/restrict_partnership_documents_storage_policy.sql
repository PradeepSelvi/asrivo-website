-- ==============================================================================
-- Migration: Restrict partnership-documents storage bucket policies (Finding f72d2a11 / CWE-862)
-- Description: Ensures partnership-documents storage bucket is private and restricts
-- SELECT and DELETE policies strictly to verified administrators (admin_profiles).
-- ==============================================================================

-- 1. Ensure bucket is marked private
UPDATE storage.buckets
SET public = false
WHERE id = 'partnership-documents';

-- 2. Drop insecure policies
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;

-- 3. Re-create storage SELECT policy strictly enforcing admin_profiles membership
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 4. Re-create storage DELETE policy strictly enforcing admin_profiles membership
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

