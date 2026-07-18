-- ============================================================
-- ADMIN LOGIN DEBUG SCRIPT
-- Run this to diagnose admin login issues
-- ============================================================

-- 1. Check if admin_profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_profiles'
) AS admin_profiles_exists;

-- 2. Check all users in auth.users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Check all admin profiles
SELECT id, email, role, created_at, updated_at
FROM admin_profiles
ORDER BY created_at DESC;

-- 4. Check if get_admin_role function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'get_admin_role'
) AS get_admin_role_exists;

-- 5. Check RLS policies on admin_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'admin_profiles';

-- 6. Check if RLS is enabled on admin_profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'admin_profiles';

-- 7. Try to find any auth users not in admin_profiles
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN ap.id IS NULL THEN 'NOT IN admin_profiles'
    ELSE 'IN admin_profiles'
  END AS status
FROM auth.users au
LEFT JOIN admin_profiles ap ON au.id = ap.id;
