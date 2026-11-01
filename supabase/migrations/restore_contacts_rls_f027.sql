-- ============================================================
-- F-027 Remediation: Restore RLS on contacts table (CWE-862)
-- ============================================================
-- Background
-- ----------
-- setup_contacts_realtime.sql originally contained:
--   ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;  -- line 34
-- to work around a Supabase realtime subscription issue.
-- Enabling realtime does NOT require disabling RLS; the statement
-- was unnecessary and removed the database's access boundary.
--
-- With RLS disabled and Supabase's default anon grants (SELECT,
-- UPDATE on public tables), unauthenticated callers could:
--   - GET /rest/v1/contacts  → enumerate all contact PII
--   - PATCH /rest/v1/contacts?id=eq.<n>  → change status fields
-- …without reaching the application's requireAdmin() check.
--
-- The source file was corrected. This migration is the canonical
-- idempotent final step that guarantees the correct RLS state
-- on any deployment regardless of which setup scripts ran.
--
-- Policy model
-- ------------
--   public / anon    → INSERT only (contact form submission)
--   authenticated    → SELECT  — admin_profiles member only
--   authenticated    → UPDATE  — admin_profiles member only
--   authenticated    → DELETE  — admin_profiles member with role='high'
--   service_role     → ALL (bypasses RLS; used by API routes)
-- ============================================================

-- 1. Enable RLS (safe to run even if already enabled)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 2. Drop all known policy name variants (idempotent)
DROP POLICY IF EXISTS "Enable insert for all users"              ON public.contacts;
DROP POLICY IF EXISTS "Public can submit contacts"               ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_public"                   ON public.contacts;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.contacts;
DROP POLICY IF EXISTS "Enable read for admins only"              ON public.contacts;
DROP POLICY IF EXISTS "Admin read only contacts"                 ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_admin"                    ON public.contacts;
DROP POLICY IF EXISTS "Block all updates from clients contacts"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_admin"                    ON public.contacts;
DROP POLICY IF EXISTS "Block all deletes from clients contacts"  ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_admin"                    ON public.contacts;
DROP POLICY IF EXISTS "High admin full access"                   ON public.contacts;

-- 3. Public INSERT — anonymous visitors may submit the contact form
CREATE POLICY "contacts_insert_public"
  ON public.contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 4. Admin-only SELECT
CREATE POLICY "contacts_select_admin"
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 5. Admin-only UPDATE (any admin role)
CREATE POLICY "contacts_update_admin"
  ON public.contacts
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

-- 6. High-admin-only DELETE
CREATE POLICY "contacts_delete_admin"
  ON public.contacts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.role = 'high'
    )
  );

-- 7. Tighten grants — anon must not have SELECT or UPDATE
REVOKE SELECT, UPDATE, DELETE ON public.contacts FROM anon;
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;

-- Verification (uncomment to inspect after applying):
-- SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables WHERE tablename = 'contacts';
-- SELECT policyname, cmd, roles
--   FROM pg_policies WHERE tablename = 'contacts'
--   ORDER BY cmd, policyname;

