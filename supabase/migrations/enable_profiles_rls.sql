-- ============================================================
-- SECURITY: Enable Most Secure RLS on profiles & user_profiles
-- Also secures analytics & archive tables against unauthorized access
-- ============================================================

-- ============================================================
-- 1. USER_PROFILES TABLE (Primary App User Profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure cover_image_url column exists if table already existed
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own_or_admin" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_own_or_admin" ON public.user_profiles;

-- SELECT Policy: Users can ONLY read their own profile (PII protection: email, phone, location)
-- Staff/admins can read profiles for support
CREATE POLICY "user_profiles_select_own_or_admin"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- INSERT Policy: Authenticated users can ONLY insert a profile matching their own auth.uid()
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE Policy: Authenticated users can ONLY update their own profile row
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE Policy: Users can delete their own profile; high admins can also delete
CREATE POLICY "user_profiles_delete_own_or_admin"
  ON public.user_profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role = 'high'
    )
  );

-- Explicitly revoke permissions from anon role (unauthenticated access completely blocked)
REVOKE ALL ON public.user_profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;

-- Hardened Trigger function with search_path = public (prevents search_path hijacking CWE-426)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. PROFILES TABLE (If a separate 'profiles' table exists in DB)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- Drop stale policies
    EXECUTE 'DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "profiles_delete_own_or_admin" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles';

    -- SELECT: Authenticated user can ONLY see their own profile, or admins
    EXECUTE 'CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
      FOR SELECT TO authenticated
      USING (
        auth.uid() = id
        OR EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
        )
      )';

    -- INSERT: Authenticated user can ONLY insert their own profile
    EXECUTE 'CREATE POLICY "profiles_insert_own" ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id)';

    -- UPDATE: Authenticated user can ONLY update their own profile
    EXECUTE 'CREATE POLICY "profiles_update_own" ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)';

    -- DELETE: Own profile or high admin
    EXECUTE 'CREATE POLICY "profiles_delete_own_or_admin" ON public.profiles
      FOR DELETE TO authenticated
      USING (
        auth.uid() = id
        OR EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
          AND admin_profiles.role = ''high''
        )
      )';

    -- Revoke from anon
    EXECUTE 'REVOKE ALL ON public.profiles FROM anon';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated';
  END IF;
END $$;


-- ============================================================
-- 3. ANALYTICS TABLE (Lock down PII: IP addresses, user agents)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics') THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY';

    -- Drop stale policies
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for all users" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "analytics_insert_public" ON public.analytics';
    EXECUTE 'DROP POLICY IF EXISTS "analytics_select_admin" ON public.analytics';

    -- INSERT: Allow public / telemetry clients to log events
    EXECUTE 'CREATE POLICY "analytics_insert_public" ON public.analytics
      FOR INSERT TO public
      WITH CHECK (true)';

    -- SELECT: Only authenticated admins can view analytics logs (protects visitor IP/PII)
    EXECUTE 'CREATE POLICY "analytics_select_admin" ON public.analytics
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
        )
      )';

    -- UPDATE and DELETE: No public/authenticated policy.
    -- Only service_role can mutate or truncate analytics.
    EXECUTE 'REVOKE UPDATE, DELETE ON public.analytics FROM anon, authenticated';
  END IF;
END $$;


-- ============================================================
-- 4. ARCHIVE TABLE (If an 'archive' table exists in DB)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'archive') THEN
    EXECUTE 'ALTER TABLE public.archive ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "archive_admin_only" ON public.archive';
    EXECUTE 'CREATE POLICY "archive_admin_only" ON public.archive
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
        )
      )';
    EXECUTE 'REVOKE ALL ON public.archive FROM anon';
  END IF;
END $$;


-- ============================================================
-- 5. VERIFICATION QUERY (Run to verify policies are applied)
-- ============================================================
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'user_profiles', 'analytics', 'archive')
-- ORDER BY tablename, cmd;
