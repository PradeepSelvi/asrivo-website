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

-- Create policy for public inserts (anyone can submit)
CREATE POLICY "Allow public insert" ON partnerships
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for authenticated reads (admins only)
CREATE POLICY "Allow authenticated read" ON partnerships
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated updates (admins only)
CREATE POLICY "Allow authenticated update" ON partnerships
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy for authenticated deletes (admins only)
CREATE POLICY "Allow authenticated delete" ON partnerships
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_partnerships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_partnerships_updated_at();
