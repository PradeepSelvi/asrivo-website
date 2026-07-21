-- ===================================================================
-- FINAL FIX FOR CONSULTATION REQUESTS RLS POLICY
-- ===================================================================
-- This fixes the "new row violates row-level security policy" error
-- by creating a policy that explicitly allows anonymous inserts
-- ===================================================================

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit consultation request" ON consultation_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON consultation_requests;

-- Step 2: Create new policy that allows anonymous inserts
CREATE POLICY "Allow anonymous consultation submissions"
ON consultation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 3: Keep existing admin policies for read/update
-- (These should already exist, but we'll ensure they're correct)

-- Allow admins to view all consultation requests
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
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

-- Allow admins to update consultation requests
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;
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

-- Step 4: Verify RLS is enabled
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- VERIFICATION QUERY
-- ===================================================================
-- After running this, check policies with:
-- SELECT * FROM pg_policies WHERE tablename = 'consultation_requests';
