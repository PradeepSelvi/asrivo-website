-- ===================================================================
-- FIX CONSULTATION UPDATE POLICY
-- ===================================================================
-- Ensures admins can update consultation requests
-- ===================================================================

-- Check current UPDATE policy
SELECT 
  policyname,
  cmd as command,
  roles,
  qual as using_check,
  with_check
FROM pg_policies 
WHERE tablename = 'consultation_requests' AND cmd = 'UPDATE';

-- Drop and recreate the UPDATE policy
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Authenticated users can update consultations" ON consultation_requests;

-- Create new UPDATE policy for authenticated users (admins)
CREATE POLICY "Authenticated users can update consultations"
ON consultation_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT 
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename = 'consultation_requests' AND cmd = 'UPDATE';

-- Test if current user can update (run this while logged in as admin)
-- SELECT current_user, auth.uid();
