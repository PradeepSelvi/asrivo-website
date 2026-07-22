-- Temporarily disable RLS to test
ALTER TABLE consultation_requests DISABLE ROW LEVEL SECURITY;

-- Test if it works now by trying the form
-- If it works, then the RLS policy is the issue

-- After testing, re-enable RLS with the correct policy
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Drop the old policy and create a simpler one
DROP POLICY IF EXISTS "Anyone can submit consultation request" ON consultation_requests;

-- Create new policy that allows all inserts
CREATE POLICY "Enable insert for all users"
ON consultation_requests
FOR INSERT
WITH CHECK (true);

-- This allows anyone (authenticated or anonymous) to insert
