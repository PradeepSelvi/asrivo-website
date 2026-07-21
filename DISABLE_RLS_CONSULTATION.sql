-- ===================================================================
-- TEMPORARY FIX: DISABLE RLS FOR consultation_requests
-- ===================================================================
-- This completely removes RLS protection to allow form submissions
-- You can re-enable RLS later after testing
-- ===================================================================

-- Disable RLS on the table
ALTER TABLE consultation_requests DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'consultation_requests';

-- Expected result: rowsecurity should be 'false'
