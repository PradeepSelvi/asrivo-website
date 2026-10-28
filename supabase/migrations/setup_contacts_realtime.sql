-- ============================================
-- SETUP CONTACTS TABLE WITH REALTIME & SECURE RLS
-- (Finding F-018 / CWE-862 Remediation)
-- ============================================

-- 1. Ensure contacts table exists with all columns
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

-- 2. Add type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE public.contacts ADD COLUMN type TEXT DEFAULT 'contact';
    END IF;
END $$;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);

-- 4. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Keep RLS enabled when configuring realtime.
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop obsolete or legacy policies
DROP POLICY IF EXISTS "Enable insert for all users" ON public.contacts;
DROP POLICY IF EXISTS "Public can submit contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_public" ON public.contacts;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON public.contacts;
DROP POLICY IF EXISTS "Enable read for admins only" ON public.contacts;
DROP POLICY IF EXISTS "Admin read only contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_admin" ON public.contacts;
DROP POLICY IF EXISTS "Block all updates from clients contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_admin" ON public.contacts;
DROP POLICY IF EXISTS "Block all deletes from clients contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_admin" ON public.contacts;
DROP POLICY IF EXISTS "High admin full access" ON public.contacts;

-- Policy A: Separate public submission policy (anonymous visitors can submit)
CREATE POLICY "contacts_insert_public"
  ON public.contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy B: Explicit administrator policy for reads (admins only)
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

-- Policy C: Explicit administrator policy for updates (admins only)
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

-- Policy D: Explicit administrator policy for deletes (high admin only)
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

-- 6. Permissions Hardening
REVOKE SELECT, UPDATE, DELETE ON public.contacts FROM anon;
GRANT INSERT ON public.contacts TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contacts TO authenticated;

-- ============================================================
-- 7. Realtime configuration
-- Safely add to realtime publication with RLS maintained
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'contacts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
  END IF;
END $$;
