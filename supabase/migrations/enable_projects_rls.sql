-- ============================================================
-- SECURITY: Enable RLS on projects table (F-009 / CWE-862)
-- ============================================================
-- Context
-- -------
-- enhance_projects_table.sql and SETUP_PROJECTS_COMPLETE.sql
-- both called DISABLE ROW LEVEL SECURITY on the projects table.
-- This allowed anonymous callers to mutate (INSERT/UPDATE/DELETE)
-- project records directly via the Supabase REST API, bypassing
-- the admin checks enforced only at the application layer.
--
-- Policy model
-- ------------
--   anon / authenticated  → SELECT only (projects are public content)
--   service_role          → ALL (bypasses RLS; used by admin routes)
--
-- All project mutations go through server actions that use the
-- service-role key and enforce admin_profiles membership before
-- writing. No INSERT/UPDATE/DELETE policy is needed for anon or
-- authenticated because the application never calls those with a
-- user-session client.
-- ============================================================

-- 1. Re-enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop any stale or conflicting policies
DROP POLICY IF EXISTS "Allow public read" ON projects;
DROP POLICY IF EXISTS "Allow public select" ON projects;
DROP POLICY IF EXISTS "projects_public_select" ON projects;
DROP POLICY IF EXISTS "projects_admin_all" ON projects;

-- 3. Public SELECT — anyone may read project records
--    (portfolio is intentionally public content)
CREATE POLICY "projects_public_select"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- NOTE: No INSERT / UPDATE / DELETE policy for anon or authenticated.
--       All writes go through admin server actions that use the
--       service-role key and therefore bypass RLS entirely.

-- 4. Verify
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'projects';

-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'projects'
-- ORDER BY cmd, policyname;
