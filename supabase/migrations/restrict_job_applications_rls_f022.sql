-- ============================================================
-- F-022 Remediation: Restrict job_applications RLS to admins (CWE-863)
-- ============================================================
-- Background
-- ----------
-- create_job_applications_table.sql defined three overly-broad
-- policies that granted every authenticated user unconditional
-- SELECT, UPDATE, and DELETE access to all applicant rows,
-- exposing applicants' PII (name, email, phone, resume URL,
-- cover letter) to any registered account.
--
-- This migration replaces those policies with admin-only
-- equivalents that check admin_profiles membership, matching
-- the application-layer authorization model used everywhere else.
--
-- Access model after this migration
-- ----------------------------------
--   anon / public    → INSERT only (public application form)
--   authenticated    → no direct DB access (all reads/writes go
--                      through service-role API routes that
--                      verify admin_profiles membership)
--   service_role     → ALL (bypasses RLS; used by every API
--                      route after server-side admin check)
-- ============================================================

-- 1. Ensure RLS is on
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 2. Drop the over-broad policies from the original migration
DROP POLICY IF EXISTS "Authenticated users can view all applications"   ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications"     ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications"     ON public.job_applications;

-- 3. Drop any stale admin variants (idempotent re-run safety)
DROP POLICY IF EXISTS "job_applications_admin_select"  ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_admin_update"  ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_admin_delete"  ON public.job_applications;

-- Keep the public INSERT policy (application form is unauthenticated)
-- "Anyone can submit job applications" is left in place.

-- 4. Admin-only SELECT
CREATE POLICY "job_applications_admin_select"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 5. Admin-only UPDATE
CREATE POLICY "job_applications_admin_update"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 6. Admin-only DELETE
CREATE POLICY "job_applications_admin_delete"
  ON public.job_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Revoke the blanket SELECT grant that was given to anon at the GRANT level
-- (anon only needs INSERT for the application form)
REVOKE SELECT ON public.job_applications FROM anon;

-- Verification (uncomment to inspect after applying):
-- SELECT policyname, cmd, roles, qual
--   FROM pg_policies WHERE tablename = 'job_applications'
--   ORDER BY cmd, policyname;

