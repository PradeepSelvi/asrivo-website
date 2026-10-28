-- ============================================================
-- RUN THESE 3 BLOCKS ONE AT A TIME IN SUPABASE SQL EDITOR
-- ============================================================


-- ════════════════════════════════════════════
-- BLOCK 1: Nuke all old triggers and functions
-- Run this first, alone.
-- ════════════════════════════════════════════

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop every trg_audit trigger on every table in public schema
  FOR r IN
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_name = 'trg_audit'
      AND trigger_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit ON %I', r.event_object_table);
  END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS log_audit_event() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;


-- ════════════════════════════════════════════
-- BLOCK 2: Fix audit_logs column + create admin_profiles
-- Run after Block 1 succeeds.
-- ════════════════════════════════════════════

ALTER TABLE audit_logs ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

CREATE TABLE IF NOT EXISTS admin_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own profile" ON admin_profiles;
CREATE POLICY "Admins can read their own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);


-- ════════════════════════════════════════════
-- BLOCK 3: Enroll Admin Users (Secure Enrollment - F-011 / CWE-798)
-- Run after Block 2 succeeds.
-- ════════════════════════════════════════════
-- SECURITY NOTE:
-- Do NOT insert fixed passwords or raw auth.users records in SQL scripts.
-- 
-- 1. Create the admin user accounts securely in Supabase Dashboard:
--    Dashboard -> Authentication -> Users -> "Add User" (or "Invite User").
--    Supply a strong, unique password for each administrator.
--
-- 2. Run the script below to link the auth user to admin_profiles:

-- Assign High Admin Role to existing auth user
INSERT INTO public.admin_profiles (id, email, role)
SELECT id, email, 'high'
FROM auth.users
WHERE email = 'pradeepselvi126@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'high', updated_at = NOW();

-- Assign Low Admin Role to existing auth user
INSERT INTO public.admin_profiles (id, email, role)
SELECT id, email, 'low'
FROM auth.users
WHERE email = 'idnumberselect@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'low', updated_at = NOW();

-- Verify admin setup:
SELECT id, email, role, created_at FROM public.admin_profiles;
