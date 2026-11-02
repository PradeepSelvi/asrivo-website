-- ============================================================
-- F-025 Remediation: Restore RLS on projects table (CWE-862)
-- ============================================================
-- Background
-- ----------
-- enhance_projects_table.sql originally contained:
--   ALTER TABLE projects DISABLE ROW LEVEL SECURITY;   -- line 23
-- SETUP_PROJECTS_COMPLETE.sql contained a similar statement.
--
-- With RLS disabled and Supabase's default table grants in place,
-- anonymous callers could send INSERT/UPDATE/DELETE requests
-- directly to the Supabase REST API (/rest/v1/projects),
-- bypassing the admin_profiles membership checks that the
-- application enforces only at the server-action layer.
--
-- The source files have been corrected; this migration is the
-- canonical, idempotent final step that ensures every deployment
-- ends in the secure state regardless of which setup scripts ran
-- and in what order.
--
-- Policy model after this migration
-- -----------------------------------
--   anon / authenticated → SELECT only (portfolio is public)
--   service_role         → ALL (bypasses RLS; used by admin
--                          server actions that already verify
--                          admin_profiles membership)
--
-- No INSERT / UPDATE / DELETE policy for anon or authenticated:
-- all project mutations go through service-role server actions.
-- ============================================================

-- 1. Enable RLS (safe to run even if already enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop all known stale policy name variants (idempotent)
DROP POLICY IF EXISTS "Allow public read"          ON projects;
DROP POLICY IF EXISTS "Allow public select"        ON projects;
DROP POLICY IF EXISTS "projects_public_select"     ON projects;
DROP POLICY IF EXISTS "projects_admin_all"         ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

-- 3. Public SELECT — portfolio content is intentionally public
CREATE POLICY "projects_public_select"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- NOTE: No INSERT / UPDATE / DELETE policy for anon or authenticated.
--       All writes go through admin server actions that use the
--       service-role key (bypasses RLS) and enforce admin_profiles
--       membership before persisting changes.

-- Verification (uncomment to inspect after applying):
-- SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables WHERE tablename = 'projects';
-- SELECT policyname, cmd, roles
--   FROM pg_policies WHERE tablename = 'projects'
--   ORDER BY cmd, policyname;

