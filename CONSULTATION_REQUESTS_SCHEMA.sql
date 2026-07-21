-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  availability TEXT NOT NULL,
  preferred_modes TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ,
  scheduled_time TEXT,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(email);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit consultation request" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;

-- Policy: Allow anyone to insert consultation requests
CREATE POLICY "Anyone can submit consultation request"
  ON consultation_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow admins to view all consultation requests
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

-- Policy: Allow admins to update consultation requests
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_consultation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_consultation_requests_updated_at ON consultation_requests;

CREATE TRIGGER trigger_consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_requests_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON consultation_requests TO anon;
GRANT ALL ON consultation_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE consultation_requests_id_seq TO anon, authenticated;
