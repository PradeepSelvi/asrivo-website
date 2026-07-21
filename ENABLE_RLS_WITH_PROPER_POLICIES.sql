-- ===================================================================
-- RE-ENABLE RLS WITH PROPER SECURITY POLICIES
-- ===================================================================
-- This adds back security while keeping the form functional
-- Based on the working client_inquiries setup
-- ===================================================================

-- Step 1: Enable RLS on the table
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policy for public submissions (INSERT only)
CREATE POLICY "Public can submit consultation requests"
ON consultation_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Step 3: Create policy for admins to view all consultations (SELECT)
CREATE POLICY "Admins can view all consultation requests"
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

-- Step 4: Create policy for admins to update consultations (UPDATE)
CREATE POLICY "Admins can update consultation requests"
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

-- Step 5: Verify RLS is enabled and policies are correct
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'consultation_requests';

-- Expected: "RLS Enabled" should show "t" (true)

-- Check policies
SELECT 
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename = 'consultation_requests'
ORDER BY policyname;

-- ===================================================================
-- DONE! Your form will continue to work with proper security
-- ===================================================================
