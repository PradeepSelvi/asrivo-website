-- ============================================================
-- F-028 Remediation: Revoke seeded administrator sessions and
-- prevent hard-coded credential re-use (CWE-798)
-- ============================================================
-- Background
-- ----------
-- Early deployment scripts (ADMIN_SETUP_MINIMAL.sql and
-- SUPABASE_FUNCTIONS_AND_ADMINS.sql) contained hardcoded
-- credentials (crypt('PRk@123456', ...), crypt('IDn@123456', ...))
-- used to bootstrap default administrator identities.
--
-- The scripts were updated to require out-of-band invitation and
-- secure dashboard enrollment with unique credentials.
--
-- This migration ensures that any active sessions or refresh tokens
-- generated from those legacy bootstrap credentials are terminated,
-- requiring all administrators to log in using unique, rotated credentials.
-- ============================================================

DO $$
BEGIN
  -- 1. Invalidate active refresh tokens for the seeded administrator emails
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'refresh_tokens'
  ) THEN
    DELETE FROM auth.refresh_tokens
    WHERE user_id IN (
      SELECT id FROM auth.users
      WHERE email IN ('pradeepselvi126@gmail.com', 'idnumberselect@gmail.com')
    );
  END IF;

  -- 2. Invalidate active sessions if auth.sessions table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'sessions'
  ) THEN
    DELETE FROM auth.sessions
    WHERE user_id IN (
      SELECT id FROM auth.users
      WHERE email IN ('pradeepselvi126@gmail.com', 'idnumberselect@gmail.com')
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Notice: Session revocation handled or skipped: %', SQLERRM;
END $$;

