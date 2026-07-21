-- ===================================================================
-- DEBUG ADMIN ACCESS TO CONSULTATIONS
-- ===================================================================
-- This helps debug why admins can't see consultation requests
-- ===================================================================

-- Step 1: Check if you're logged in and get your user ID
SELECT auth.uid() as "Your User ID";

-- Step 2: Check your profile and role
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE id = auth.uid();

-- Step 3: Check if consultation records exist
SELECT 
  id,
  name,
  email,
  status,
  created_at
FROM consultation_requests
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Test if the RLS policy check works
SELECT EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role IN ('admin', 'super_admin')
) as "Am I Admin?";

-- Step 5: Check current RLS policies
SELECT 
  policyname,
  cmd as command,
  qual as using_check,
  with_check
FROM pg_policies 
WHERE tablename = 'consultation_requests';
