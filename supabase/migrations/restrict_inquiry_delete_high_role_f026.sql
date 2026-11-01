-- ============================================================
-- F-026 Remediation: Restrict client_inquiries DELETE to
--        high-role administrators only (CWE-863)
-- ============================================================
-- Background
-- ----------
-- harden_client_inquiries_rls.sql:71-75 defined a DELETE policy
-- that checked only admin_profiles membership, without verifying
-- the administrator's role. A low-role administrator could therefore
-- bypass the application-layer restriction (which reserves deletion
-- for high-role admins) by calling the Supabase REST API directly.
--
-- This migration drops the permissive policy and replaces it with
-- one that requires role = 'high', matching the server action
-- authorization model.
-- ============================================================

-- 1. Drop the broad membership-only DELETE policy
DROP POLICY IF EXISTS "Admins can delete inquiries" ON client_inquiries;

-- 2. Recreate with high-role restriction
CREATE POLICY "Admins can delete inquiries"
  ON client_inquiries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.role = 'high'
    )
  );

-- Verification (uncomment to inspect after applying):
-- SELECT policyname, cmd, roles, qual
--   FROM pg_policies WHERE tablename = 'client_inquiries'
--   ORDER BY cmd, policyname;

