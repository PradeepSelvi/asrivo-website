-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  website VARCHAR(255),
  partnership_type VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  services_offered TEXT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnerships_email ON partnerships(email);

-- Enable Row Level Security
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Allow public insert" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated read" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated update" ON partnerships;
DROP POLICY IF EXISTS "Allow authenticated delete" ON partnerships;
DROP POLICY IF EXISTS "Allow admins and owners to read partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow admins to update partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow admins to delete partnerships" ON partnerships;

-- Policy for public inserts (anyone can submit a partnership request)
CREATE POLICY "Allow public insert" ON partnerships
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for reads: verified admins can read all, applicants can read their own
CREATE POLICY "Allow admins and owners to read partnerships" ON partnerships
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

-- Policy for updates: verified admins only
CREATE POLICY "Allow admins to update partnerships" ON partnerships
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

-- Policy for deletes: verified admins only
CREATE POLICY "Allow admins to delete partnerships" ON partnerships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Create trigger to update updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_partnerships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partnerships_updated_at ON partnerships;
CREATE TRIGGER partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_partnerships_updated_at();
