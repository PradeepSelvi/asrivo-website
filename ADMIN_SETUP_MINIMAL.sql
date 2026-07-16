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
-- BLOCK 3: Create both admin users
-- Run after Block 2 succeeds.
-- ════════════════════════════════════════════

-- High Admin
DO $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'pradeepselvi126@gmail.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'pradeepselvi126@gmail.com', crypt('PRk@123456', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Pradeep Selvi"}'::jsonb,
      'authenticated', 'authenticated', NOW(), NOW()
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_uid::TEXT, v_uid,
      jsonb_build_object('sub', v_uid::TEXT, 'email', 'pradeepselvi126@gmail.com'),
      'email', NOW(), NOW(), NOW()
    );
  END IF;
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_uid, 'pradeepselvi126@gmail.com', 'high')
  ON CONFLICT (id) DO UPDATE SET role = 'high', updated_at = NOW();
END;
$$;

-- Low Admin
DO $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'idnumberselect@gmail.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'idnumberselect@gmail.com', crypt('IDn@123456', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"ID Number Select"}'::jsonb,
      'authenticated', 'authenticated', NOW(), NOW()
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_uid::TEXT, v_uid,
      jsonb_build_object('sub', v_uid::TEXT, 'email', 'idnumberselect@gmail.com'),
      'email', NOW(), NOW(), NOW()
    );
  END IF;
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_uid, 'idnumberselect@gmail.com', 'low')
  ON CONFLICT (id) DO UPDATE SET role = 'low', updated_at = NOW();
END;
$$;

-- Confirm it worked:
SELECT id, email, role FROM admin_profiles;
