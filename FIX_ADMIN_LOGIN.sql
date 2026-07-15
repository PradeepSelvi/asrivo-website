-- ============================================================
-- COMPLETE ADMIN LOGIN FIX
-- This script ensures admin login works properly
-- ============================================================

-- Step 1: Create get_admin_role function (bypasses RLS)
CREATE OR REPLACE FUNCTION get_admin_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM admin_profiles WHERE id = p_user_id;
$$;

-- Step 2: Drop old policies that might cause recursion
DROP POLICY IF EXISTS "Admins can read their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can manage all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can insert profiles" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can update profiles" ON admin_profiles;
DROP POLICY IF EXISTS "High admin can delete profiles" ON admin_profiles;

-- Step 3: Create new policies using the helper function (no recursion)

-- Any authenticated admin can read their own profile
CREATE POLICY "Admins can read their own profile" ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- High admin can read ALL profiles
CREATE POLICY "High admin can read all profiles" ON admin_profiles
  FOR SELECT
  USING (get_admin_role(auth.uid()) = 'high');

-- High admin can insert new profiles
CREATE POLICY "High admin can insert profiles" ON admin_profiles
  FOR INSERT
  WITH CHECK (get_admin_role(auth.uid()) = 'high');

-- High admin can update profiles (except their own role change)
CREATE POLICY "High admin can update profiles" ON admin_profiles
  FOR UPDATE
  USING (get_admin_role(auth.uid()) = 'high');

-- High admin can delete profiles (except themselves)
CREATE POLICY "High admin can delete profiles" ON admin_profiles
  FOR DELETE
  USING (
    get_admin_role(auth.uid()) = 'high' 
    AND id != auth.uid()
  );

-- Step 4: Ensure your admin users exist in admin_profiles
-- Replace these emails with your actual admin emails

-- For high admin
INSERT INTO admin_profiles (id, email, role)
SELECT id, email, 'high'
FROM auth.users
WHERE email = 'pradeepselvi126@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'high', updated_at = NOW();

-- For low admin (optional)
INSERT INTO admin_profiles (id, email, role)
SELECT id, email, 'low'
FROM auth.users
WHERE email = 'idnumberselect@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'low', updated_at = NOW();

-- Step 5: Verify everything is set up correctly
SELECT 'Policies created:' AS status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'admin_profiles';

SELECT 'Admin profiles:' AS status;
SELECT id, email, role, created_at FROM admin_profiles;

SELECT 'Function exists:' AS status;
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'get_admin_role';
