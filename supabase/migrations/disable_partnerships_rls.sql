-- SECURITY: RLS must NOT be disabled on partnerships.
-- Ensure RLS is enabled and clean up stale policies
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

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

-- Public submission policy
CREATE POLICY "partnerships_anon_insert"
  ON partnerships FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "partnerships_auth_insert"
  ON partnerships FOR INSERT TO authenticated WITH CHECK (true);

-- Admin & Owner read policy
CREATE POLICY "partnerships_admin_and_owner_select"
  ON partnerships FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
    OR (
      email = (auth.jwt() ->> 'email')
    )
  );

-- Admin-only update policy
CREATE POLICY "partnerships_admin_update"
  ON partnerships FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Admin-only delete policy
CREATE POLICY "partnerships_admin_delete"
  ON partnerships FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

