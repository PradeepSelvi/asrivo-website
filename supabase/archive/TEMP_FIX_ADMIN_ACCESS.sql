-- ===================================================================
-- TEMPORARY FIX: SIMPLIFY RLS FOR TESTING
-- ===================================================================
-- This removes the profiles check temporarily to test if that's the issue
-- ===================================================================

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;

-- Create a simpler policy that allows all authenticated users to view
-- (Temporary - just for testing)
CREATE POLICY "Authenticated users can view consultations"
ON consultation_requests
FOR SELECT
TO authenticated
USING (true);

-- Verify the policy
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'consultation_requests'
AND cmd = 'SELECT';
