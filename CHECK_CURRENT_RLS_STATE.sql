-- ===================================================================
-- CHECK CURRENT RLS STATE
-- ===================================================================
-- Run this to see what's actually configured right now
-- ===================================================================

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'consultation_requests';

-- Check all current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'consultation_requests'
ORDER BY policyname;

-- Check table permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'consultation_requests'
ORDER BY grantee, privilege_type;
