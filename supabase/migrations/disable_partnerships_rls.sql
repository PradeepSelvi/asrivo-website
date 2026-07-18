-- Completely disable RLS for partnerships table
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for anon" ON partnerships;
DROP POLICY IF EXISTS "Enable all for service role" ON partnerships;
DROP POLICY IF EXISTS "Enable read for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable update for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON partnerships;
DROP POLICY IF EXISTS "Allow public insert" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated read" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated update" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated delete" ON partnerships;
