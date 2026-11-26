-- ==============================================================================
-- Migration: fix_admin_profiles_infinite_recursion.sql
-- Fixes: "infinite recursion detected in policy for relation 'admin_profiles'"
-- ==============================================================================
--
-- Why the error happened:
-- A policy on public.admin_profiles (e.g. "High admin can manage all profiles")
-- evaluated an inline subquery:
--   SELECT 1 FROM admin_profiles ap WHERE ap.id = auth.uid() AND ap.role = 'high'
--
-- When Postgres checks RLS on admin_profiles, it encounters the subquery to
-- admin_profiles, which recursively checks the same RLS policy -> infinite recursion!
--
-- Solution:
-- 1. Create a SECURITY DEFINER function `get_admin_role(p_user_id UUID)` that runs
--    with table owner privileges and bypasses RLS evaluation on admin_profiles.
-- 2. Drop the recursive policy and re-apply RLS policies on admin_profiles using
--    auth.uid() = id for self-read, and get_admin_role(auth.uid()) = 'high' for management.

-- Step 1: Create the non-recursive helper function
CREATE OR REPLACE FUNCTION public.get_admin_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.admin_profiles WHERE id = p_user_id;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_role(UUID) TO authenticated;

-- Step 2: Ensure RLS is active on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing recursive policies
DROP POLICY IF EXISTS "Admins can read their own profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "High admin can manage all profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "High admin can read all profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "High admin can insert profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "High admin can update profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "High admin can delete profiles" ON public.admin_profiles;

-- Step 4: Create non-recursive policies
-- 4a. Any admin can view their own profile row
CREATE POLICY "Admins can read their own profile" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4b. High admins can view all profiles
CREATE POLICY "High admin can read all profiles" ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (public.get_admin_role(auth.uid()) = 'high');

-- 4c. High admins can insert new admin profiles
CREATE POLICY "High admin can insert profiles" ON public.admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_admin_role(auth.uid()) = 'high');

-- 4d. High admins can update admin profiles
CREATE POLICY "High admin can update profiles" ON public.admin_profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_admin_role(auth.uid()) = 'high')
  WITH CHECK (public.get_admin_role(auth.uid()) = 'high');

-- 4e. High admins can delete admin profiles
CREATE POLICY "High admin can delete profiles" ON public.admin_profiles
  FOR DELETE
  TO authenticated
  USING (public.get_admin_role(auth.uid()) = 'high');

