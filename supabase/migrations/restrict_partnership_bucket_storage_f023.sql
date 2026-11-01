-- ============================================================
-- F-023 Remediation: Admin-only storage policies for
--        partnership-documents bucket (CWE-863)
-- ============================================================
-- Background
-- ----------
-- create_partnership_bucket.sql originally created a storage
-- SELECT policy scoped only to bucket_id = 'partnership-documents',
-- treating authentication alone as sufficient authority to read
-- every organization's private documents. Any registered user
-- could call the Supabase Storage API directly to list and
-- download files without going through the application's
-- admin-membership check.
--
-- Multiple setup/repair scripts were shipped, and whichever ran
-- last determines the live policy set. This migration is the
-- canonical final step that always leaves the bucket in the
-- secure state regardless of which installer ran previously.
--
-- Policy model after this migration
-- -----------------------------------
--   public / anon      → INSERT only (applicant document upload)
--   authenticated      → SELECT  — admin_profiles member only
--   authenticated      → DELETE  — admin_profiles member only
--   service_role       → ALL (bypasses RLS; used by API routes
--                        that already enforce server-side checks)
-- ============================================================

-- 1. Ensure bucket is private
UPDATE storage.buckets
SET public = false
WHERE id = 'partnership-documents';

-- 2. Drop every known policy name variant (idempotent)
DROP POLICY IF EXISTS "Allow public read partnership documents"         ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read partnership docs"   ON storage.objects;
DROP POLICY IF EXISTS "Admins can read partnership documents"           ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partnership documents"         ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload of partnership documents"    ON storage.objects;

-- 3. Public INSERT — applicants upload their own documents
--    (The API route validates file type, size, and ownership before
--    storing; this policy simply allows the operation at DB level)
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

-- 4. Admin-only SELECT — verified administrators read documents
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

-- 5. Admin-only DELETE
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

-- Verification (uncomment to inspect after applying):
-- SELECT policyname, cmd, roles, qual
--   FROM pg_policies
--   WHERE tablename = 'objects'
--     AND qual LIKE '%partnership-documents%'
--   ORDER BY cmd, policyname;

