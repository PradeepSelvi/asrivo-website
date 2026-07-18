-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated read" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated update" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated delete" ON partnerships;

-- Disable RLS temporarily to fix
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

-- Create new policy for anonymous (public) inserts with proper role
CREATE POLICY "Enable insert for anon"
ON partnerships
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Enable all for service role"
ON partnerships
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy for authenticated reads
CREATE POLICY "Enable read for authenticated"
ON partnerships
FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated updates
CREATE POLICY "Enable update for authenticated"
ON partnerships
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated deletes
CREATE POLICY "Enable delete for authenticated"
ON partnerships
FOR DELETE
TO authenticated
USING (true);
