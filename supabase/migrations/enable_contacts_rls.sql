-- ============================================================
-- SECURITY: Enable RLS on contacts table (F-010 / CWE-862)
-- ============================================================
-- Context
-- -------
-- Finding F-010 flagged an authorization bypass where setup_contacts_realtime.sql
-- disabled RLS on contacts, and HTTP handlers (/api/contacts and /api/contacts/[id])
-- lacked independent admin authorization checks before database queries.
--
-- Access Control Model:
-- - INSERT: Public (anonymous visitors can submit contact inquiries).
-- - SELECT: Admin only (contacts contain visitor PII: email, phone, name, message).
-- - UPDATE: Admin only (only staff can update status e.g. unread -> read -> responded).
-- - DELETE: High Admin only (preserves audit trail; only high admin can prune).
-- ============================================================

-- 1. Ensure contacts table exists
CREATE TABLE IF NOT EXISTS public.contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT,
  type TEXT DEFAULT 'contact',
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Explicitly enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing/stale policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contacts;
DROP POLICY IF EXISTS "Public can submit contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts;

DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.contacts;
DROP POLICY IF EXISTS "Enable read for admins only" ON public.contacts;
DROP POLICY IF EXISTS "Admin read only contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admin read only" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_admin" ON public.contacts;

DROP POLICY IF EXISTS "Block all updates from clients contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_admin" ON public.contacts;

DROP POLICY IF EXISTS "Block all deletes from clients contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_admin" ON public.contacts;
DROP POLICY IF EXISTS "High admin full access" ON public.contacts;

-- 4. INSERT Policy: Allow public / anonymous visitors to submit contact forms
CREATE POLICY "contacts_insert_public"
  ON public.contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. SELECT Policy: Admins ONLY can view contact inquiries
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

-- 6. UPDATE Policy: Admins ONLY can update contact records (e.g. status)
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

-- 7. DELETE Policy: High Admins ONLY can delete contacts
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

-- 8. Defense-in-depth: Revoke SELECT, UPDATE, DELETE permissions from anon role
REVOKE SELECT, UPDATE, DELETE ON public.contacts FROM anon;
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;

-- ============================================================
-- VERIFICATION QUERY
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'contacts'
-- ORDER BY cmd, policyname;
-- ============================================================
