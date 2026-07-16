-- Fix infinite recursion in admin_profiles RLS policies
-- The policy was querying admin_profiles to check role,
-- which triggered the same policy again → infinite loop.
-- Solution: use a SECURITY DEFINER function that bypasses RLS.

-- 1. Create a helper function that reads role WITHOUT triggering RLS
CREATE OR REPLACE FUNCTION get_admin_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER  -- runs as the function owner, bypasses RLS
SET search_path = public
AS $$
  SELECT role FROM admin_profiles WHERE id = p_user_id;
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can read their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can manage all profiles" ON admin_profiles;

-- 3. Recreate policies using the helper function (no recursion)
-- Any admin can read their own row
CREATE POLICY "Admins can read their own profile" ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- High admin can read ALL profiles (for the admin list page)
CREATE POLICY "High admin can read all profiles" ON admin_profiles
  FOR SELECT
  USING (get_admin_role(auth.uid()) = 'high');

-- High admin can insert new profiles
CREATE POLICY "High admin can insert profiles" ON admin_profiles
  FOR INSERT
  WITH CHECK (get_admin_role(auth.uid()) = 'high');

-- High admin can update profiles
CREATE POLICY "High admin can update profiles" ON admin_profiles
  FOR UPDATE
  USING (get_admin_role(auth.uid()) = 'high');

-- High admin can delete profiles
CREATE POLICY "High admin can delete profiles" ON admin_profiles
  FOR DELETE
  USING (get_admin_role(auth.uid()) = 'high');

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admin_profiles';
