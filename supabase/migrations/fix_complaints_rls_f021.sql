-- ============================================================
-- F-021 Remediation: Restore RLS on complaints table (CWE-862)
-- ============================================================
-- Background
-- ----------
-- An earlier migration (create_complaints_table.sql) contained
-- "ALTER TABLE complaints DISABLE ROW LEVEL SECURITY" at line 18,
-- exposing all complaint rows — including PII and contact details —
-- to anonymous SELECT and UPDATE via the public anon key.
--
-- Subsequent migrations (FIX_COMPLAINTS_SIMPLE.sql,
-- COMPLETE_COMPLAINTS_SETUP.sql) rebuild the table but do not
-- explicitly re-enable RLS, so whichever ran last determines the
-- live security posture.
--
-- This migration is the canonical, idempotent final step that
-- ALWAYS leaves the complaints table in the secure state,
-- regardless of migration order:
--
--   anon role       → INSERT only (public complaint form)
--   authenticated   → INSERT (logged-in submission)
--                     SELECT own rows only (email = auth.email())
--   service_role    → ALL (bypasses RLS; used by admin API routes
--                     that already enforce server-side auth checks)
-- ============================================================

-- 1. Enable RLS (safe to run even if already enabled)
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 2. Drop every stale policy variant (idempotent)
DROP POLICY IF EXISTS "Allow public read"                   ON complaints;
DROP POLICY IF EXISTS "Allow public insert"                 ON complaints;
DROP POLICY IF EXISTS "Allow public update"                 ON complaints;
DROP POLICY IF EXISTS "Allow authenticated read"            ON complaints;
DROP POLICY IF EXISTS "Allow authenticated insert"          ON complaints;
DROP POLICY IF EXISTS "Allow authenticated update"          ON complaints;
DROP POLICY IF EXISTS "complaints_anon_insert"              ON complaints;
DROP POLICY IF EXISTS "complaints_auth_insert"              ON complaints;
DROP POLICY IF EXISTS "complaints_owner_select"             ON complaints;
DROP POLICY IF EXISTS "complaints_admin_all"                ON complaints;

-- 3. Anonymous INSERT — public complaint submission only
CREATE POLICY "complaints_anon_insert"
  ON complaints
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Authenticated INSERT — logged-in submission
CREATE POLICY "complaints_auth_insert"
  ON complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Authenticated SELECT — own rows only
--    Matches the ownership check in GET /api/complaints/[id].
--    Admin reads go through the service-role key and bypass RLS.
CREATE POLICY "complaints_owner_select"
  ON complaints
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- NOTE: No UPDATE or DELETE policy for anon or authenticated.
--       All status/priority changes go through the admin API
--       route which uses the service-role key (bypasses RLS)
--       and already requires "high" administrator role.

-- Verification (uncomment to inspect after applying):
-- SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables WHERE tablename = 'complaints';
-- SELECT policyname, cmd, roles
--   FROM pg_policies WHERE tablename = 'complaints'
--   ORDER BY cmd, policyname;

