-- ============================================================
-- SECURITY: Enable RLS on analytics, archive, and analytics_archive
-- ============================================================
-- This migration secures telemetry and archive tables:
-- 1. analytics:
--    - Public INSERT allowed (for logging page views / events)
--    - Admin-only SELECT (protects visitor IP addresses, user agents, session IDs)
--    - No UPDATE or DELETE for public/anon/regular authenticated users
-- 2. archive / analytics_archive:
--    - Strict admin-only access (ALL commands restricted to admin_profiles)
--    - Anonymous access completely revoked
-- ============================================================

-- ============================================================
-- 1. ANALYTICS TABLE
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics') THEN
    -- 1. Enable Row Level Security
    EXECUTE 'ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY';

    -- 2. Clean up any existing / stale policies
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all users" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "analytics_insert_public" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "analytics_insert_policy" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "Admin read access" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "analytics_select_admin" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "High admin full access" ON public.analytics';

    -- 3. INSERT Policy: Allow public/anon and authenticated users to log events
    EXECUTE 'CREATE POLICY "analytics_insert_public"
      ON public.analytics
      FOR INSERT
      TO public
      WITH CHECK (true)';

    -- 4. SELECT Policy: Admins ONLY can view analytics logs
    --    Protects visitor PII (IP addresses, user agents, session IDs)
    EXECUTE 'CREATE POLICY "analytics_select_admin"
      ON public.analytics
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
        )
      )';

    -- 5. Revoke UPDATE and DELETE from anon & standard authenticated
    --    Only service_role (or high admins) can purge analytics data
    EXECUTE 'REVOKE UPDATE, DELETE ON public.analytics FROM anon, authenticated';
    EXECUTE 'GRANT INSERT ON public.analytics TO anon, authenticated';
    EXECUTE 'GRANT SELECT ON public.analytics TO authenticated';

    RAISE NOTICE 'RLS enabled and secured on public.analytics';
  ELSE
    RAISE NOTICE 'Table public.analytics does not exist; skipping';
  END IF;
END $$;


-- ============================================================
-- 2. ARCHIVE TABLE (If named 'archive')
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'archive') THEN
    -- 1. Enable Row Level Security
    EXECUTE 'ALTER TABLE public.archive ENABLE ROW LEVEL SECURITY';

    -- 2. Clean up any existing / stale policies
    EXECUTE 'DROP POLICY IF EXISTS "archive_admin_only" ON public.archive';
    EXECUTE 'DROP POLICY IF EXISTS "archive_admin_access" ON public.archive';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.archive';

    -- 3. Policy: Full access for authenticated administrators ONLY
    EXECUTE 'CREATE POLICY "archive_admin_access"
      ON public.archive
      FOR ALL
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
      )';

    -- 4. Revoke all permissions from anon
    EXECUTE 'REVOKE ALL ON public.archive FROM anon';
    EXECUTE 'GRANT ALL ON public.archive TO authenticated';

    RAISE NOTICE 'RLS enabled and secured on public.archive';
  ELSE
    RAISE NOTICE 'Table public.archive does not exist; skipping';
  END IF;
END $$;


-- ============================================================
-- 3. ANALYTICS_ARCHIVE TABLE (If named 'analytics_archive')
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_archive') THEN
    -- 1. Enable Row Level Security
    EXECUTE 'ALTER TABLE public.analytics_archive ENABLE ROW LEVEL SECURITY';

    -- 2. Clean up any existing / stale policies
    EXECUTE 'DROP POLICY IF EXISTS "analytics_archive_admin_access" ON public.analytics_archive';

    -- 3. Policy: Full access for authenticated administrators ONLY
    EXECUTE 'CREATE POLICY "analytics_archive_admin_access"
      ON public.analytics_archive
      FOR ALL
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
      )';

    -- 4. Revoke all permissions from anon
    EXECUTE 'REVOKE ALL ON public.analytics_archive FROM anon';
    EXECUTE 'GRANT ALL ON public.analytics_archive TO authenticated';

    RAISE NOTICE 'RLS enabled and secured on public.analytics_archive';
  ELSE
    RAISE NOTICE 'Table public.analytics_archive does not exist; skipping';
  END IF;
END $$;


-- ============================================================
-- 4. VERIFICATION
-- Run this block to inspect policies currently configured:
-- ============================================================
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE tablename IN ('analytics', 'archive', 'analytics_archive')
-- ORDER BY tablename, cmd;
