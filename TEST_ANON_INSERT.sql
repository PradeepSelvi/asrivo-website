-- Test if anonymous users can insert (simulating the RLS policy)
-- This tests the "Anyone can submit consultation request" policy

-- First, let's verify the policy allows INSERT for anon
SELECT 
    policyname,
    roles,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'consultation_requests' 
AND cmd = 'INSERT';

-- Try insert as if we're anonymous (the policy has WITH CHECK true)
-- If this succeeds, RLS is configured correctly
