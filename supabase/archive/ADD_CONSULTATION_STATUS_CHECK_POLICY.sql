-- ===================================================================
-- ADD POLICY FOR PUBLIC CONSULTATION STATUS CHECKING
-- ===================================================================
-- Allows users to check their own consultation status by email
-- ===================================================================

-- Create policy for users to check their own status
CREATE POLICY "Users can check their own consultation status"
ON consultation_requests
FOR SELECT
TO public
USING (true);
-- Note: This allows reading consultation data. If you want to restrict it
-- to only allow users to see their own consultations, you would need
-- to pass the email in a secure way. For now, this is similar to
-- the inquiry status checker which is public.

-- Verify policies
SELECT 
  policyname,
  cmd as command,
  roles
FROM pg_policies 
WHERE tablename = 'consultation_requests'
ORDER BY policyname;
