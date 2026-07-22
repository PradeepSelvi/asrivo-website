-- ===================================================================
-- CORRECT FIX FOR CONSULTATION REQUESTS RLS POLICY
-- ===================================================================
-- Based on the working client_inquiries table setup
-- Uses "TO public" which works for both anon and authenticated users
-- ===================================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can submit consultation request" ON consultation_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON consultation_requests;
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;

-- Step 2: Create INSERT policy for public (anyone can submit)
CREATE POLICY "Anyone can submit consultations"
ON consultation_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Step 3: Create SELECT policy for admins only
CREATE POLICY "Admins can view all consultations"
ON consultation_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 4: Create UPDATE policy for admins only
CREATE POLICY "Admins can update consultations"
ON consultation_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON consultation_requests TO authenticated;
GRANT SELECT, INSERT ON consultation_requests TO anon;

-- Step 6: Ensure RLS is enabled
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- VERIFICATION QUERY
-- ===================================================================
-- Run this to verify policies are correct:
-- SELECT * FROM pg_policies WHERE tablename = 'consultation_requests';
