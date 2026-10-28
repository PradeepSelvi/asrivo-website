-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated read" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated update" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated delete" ON partnerships;
DROP POLICY IF EXISTS "Enable insert for anon" ON partnerships;
DROP POLICY IF EXISTS "Enable all for service role" ON partnerships;
DROP POLICY IF EXISTS "Enable read for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable update for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Allow admins and owners to read partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow admins to update partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow admins to delete partnerships" ON partnerships;

-- Ensure RLS is enabled
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

-- Allow public and anonymous submissions (INSERT only)
CREATE POLICY "Enable insert for anon"
ON partnerships
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated"
ON partnerships
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Enable all for service role"
ON partnerships
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy for authenticated reads (verified admins and submission owners)
CREATE POLICY "Allow admins and owners to read partnerships"
ON partnerships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
  OR (
    email = (auth.jwt() ->> 'email')
  )
);

-- Create policy for authenticated updates (verified admins only)
CREATE POLICY "Allow admins to update partnerships"
ON partnerships
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Create policy for authenticated deletes (verified admins only)
CREATE POLICY "Allow admins to delete partnerships"
ON partnerships
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
