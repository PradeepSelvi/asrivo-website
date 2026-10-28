-- ============================================================
-- SECURITY: Enable RLS on complaints table (F-007 / CWE-862)
-- ============================================================
-- Context
-- -------
-- The original migrations disabled Row Level Security with
-- "ALTER TABLE complaints DISABLE ROW LEVEL SECURITY" to
-- simplify public-form submission. This left the table fully
-- readable and writable by the anon role, allowing any caller
-- with the public anon key to enumerate all complaints and
-- overwrite status / priority fields.
--
-- Application-layer fixes (F-001, F-002, F-003) added auth
-- and admin checks to every route, but defence-in-depth
-- requires the database to enforce its own boundary.
--
-- This migration re-enables RLS and adds policies that match
-- the *intended* access model:
--
--   anon role       → INSERT only (public complaint submission)
--   authenticated   → INSERT only (logged-in submission)
--   service_role    → ALL (bypasses RLS; used by every API
--                    route that needs SELECT / UPDATE)
--
-- No SELECT or UPDATE policy is granted to anon/authenticated
-- because every read and workflow-update goes through a
-- service-role API route that already enforces auth checks.
-- ============================================================

-- 1. Re-enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 2. Drop any stale policies left by earlier migrations
DROP POLICY IF EXISTS "Allow public read" ON complaints;
DROP POLICY IF EXISTS "Allow public insert" ON complaints;
DROP POLICY IF EXISTS "Allow public update" ON complaints;
DROP POLICY IF EXISTS "Allow authenticated read" ON complaints;
DROP POLICY IF EXISTS "Allow authenticated insert" ON complaints;
DROP POLICY IF EXISTS "Allow authenticated update" ON complaints;
DROP POLICY IF EXISTS "complaints_anon_insert" ON complaints;
DROP POLICY IF EXISTS "complaints_auth_insert" ON complaints;
DROP POLICY IF EXISTS "complaints_owner_select" ON complaints;

-- 3. INSERT policies (public complaint submission)
--    Anyone — including unauthenticated visitors — may submit
--    a complaint. The API route performs CAPTCHA + validation
--    before the insert, but we also grant at DB level so the
--    service-role insert still works without special handling.

CREATE POLICY "complaints_anon_insert"
  ON complaints
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "complaints_auth_insert"
  ON complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. SELECT policy — authenticated users may read their OWN rows only
--    (matches the /api/complaints/status ownership check)
--    Admins always use the service-role key and bypass this.

CREATE POLICY "complaints_owner_select"
  ON complaints
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- NOTE: No UPDATE policy for anon or authenticated.
--       All status/priority updates go through the admin
--       API route which uses the service-role key and
--       therefore bypasses RLS entirely.

-- 5. Verify
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'complaints';

-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'complaints'
-- ORDER BY cmd, policyname;
