-- ===================================================================
-- NUCLEAR OPTION: COMPLETELY DISABLE RLS
-- ===================================================================
-- This will allow the form to work immediately while we debug
-- Run this FIRST, test the form, then we'll add proper policies
-- ===================================================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can submit consultation request" ON consultation_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON consultation_requests;
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultation_requests;
DROP POLICY IF EXISTS "Anyone can submit consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can view all consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultations" ON consultation_requests;

-- Step 2: Completely disable RLS (temporary - for testing only)
ALTER TABLE consultation_requests DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify it's disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'consultation_requests';

-- Expected output: "RLS Enabled" should show "f" (false)

-- ===================================================================
-- AFTER THIS RUNS, TEST YOUR FORM IMMEDIATELY
-- ===================================================================
-- If the form works, the issue is definitely the RLS policy
-- Then we'll re-enable RLS with the correct policy
-- ===================================================================
