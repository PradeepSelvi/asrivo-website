-- Add type field to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'contact' CHECK (type IN ('feedback', 'query', 'contact', 'other'));

-- Create complaints table (NO LOGIN REQUIRED)
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  category TEXT,
  attachments TEXT[], -- Array of file URLs
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for complaints (PUBLIC ACCESS - no authentication required)
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- Enable realtime for complaints
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;

-- Create updated_at trigger for complaints
CREATE OR REPLACE FUNCTION update_complaints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_complaints_updated_at();

-- Verify setup
SELECT 
  'contacts type column' as check_type, 
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'type') as result
UNION ALL
SELECT 
  'complaints table' as check_type,
  EXISTS (SELECT FROM pg_tables WHERE tablename = 'complaints') as result;
