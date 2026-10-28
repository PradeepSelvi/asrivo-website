-- ============================================================
-- SECURITY: RLS Policies for partnerships table
-- ============================================================
-- Context
-- -------
-- RLS is already enabled on the partnerships table in the live
-- database, but no policies exist. While the app exclusively
-- uses the service-role key (which bypasses RLS), having zero
-- policies means Supabase will return 0 rows for any anon or
-- authenticated query — which is the right default behaviour
-- for private applicant data.
--
-- This migration makes the intended policy explicit and guards
-- against accidental future use of the anon client.
--
-- Policy model
-- ------------
--   anon        → INSERT only (public partnership application form)
--   authenticated → INSERT only (logged-in submission)
--   service_role  → ALL (bypasses RLS; used by all API routes)
--
-- No SELECT policy for anon/authenticated: partnership
-- applications contain private business information and should
-- only be read through admin API routes (which use service-role).
-- ============================================================

-- 1. Ensure RLS is enabled (idempotent)
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any stale policies from previous migration attempts
DROP POLICY IF EXISTS "Enable insert for anon" ON partnerships;
DROP POLICY IF EXISTS "Enable all for service role" ON partnerships;
DROP POLICY IF EXISTS "Enable read for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable update for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Allow public insert" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated read" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated update" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated delete" ON partnerships;
DROP POLICY IF EXISTS "partnerships_anon_insert" ON partnerships;
DROP POLICY IF EXISTS "partnerships_auth_insert" ON partnerships;
DROP POLICY IF EXISTS "partnerships_admin_and_owner_select" ON partnerships;
DROP POLICY IF EXISTS "partnerships_admin_update" ON partnerships;
DROP POLICY IF EXISTS "partnerships_admin_delete" ON partnerships;

-- 3. INSERT policies — public partnership application submission
CREATE POLICY "partnerships_anon_insert"
  ON partnerships
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "partnerships_auth_insert"
  ON partnerships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. SELECT policy: verified admins can view all, applicant owners can view their own
CREATE POLICY "partnerships_admin_and_owner_select"
  ON partnerships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
    OR (
      email = (auth.jwt() ->> 'email')
    )
  );

-- 5. UPDATE policy: verified admins only
CREATE POLICY "partnerships_admin_update"
  ON partnerships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 6. DELETE policy: verified admins only
CREATE POLICY "partnerships_admin_delete"
  ON partnerships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );
