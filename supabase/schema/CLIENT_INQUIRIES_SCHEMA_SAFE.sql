-- Client Inquiries Table for Service Inquiry Form
-- SAFE VERSION - Handles existing objects gracefully
-- Run this in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS client_inquiries (
  id BIGSERIAL PRIMARY KEY,
  
  -- Contact Information
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  preferred_contact TEXT DEFAULT 'email',
  
  -- Project Details
  project_types TEXT[] NOT NULL,
  project_description TEXT NOT NULL,
  has_existing BOOLEAN DEFAULT false,
  existing_link TEXT,
  target_platform TEXT[],
  key_features TEXT[],
  
  -- Business Metrics
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  target_audience TEXT,
  pain_points TEXT,
  
  -- Optional Information
  reference_links TEXT,
  hear_about_us TEXT,
  
  -- Status Tracking
  status TEXT DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  converted_to_lead_id BIGINT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected'))
);

-- Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_client_inquiries_status ON client_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_email ON client_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_created_at ON client_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_assigned_to ON client_inquiries(assigned_to);

-- Enable RLS
ALTER TABLE client_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON client_inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON client_inquiries;

-- Create RLS Policies
CREATE POLICY "Anyone can submit inquiries"
  ON client_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON client_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update inquiries"
  ON client_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_client_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS client_inquiries_updated_at_trigger ON client_inquiries;
CREATE TRIGGER client_inquiries_updated_at_trigger
  BEFORE UPDATE ON client_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_client_inquiries_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON client_inquiries TO authenticated;
GRANT SELECT, INSERT ON client_inquiries TO anon;

-- Add comment
COMMENT ON TABLE client_inquiries IS 'Stores client project inquiries submitted through the Get Started form';
COMMENT ON COLUMN client_inquiries.whatsapp IS 'WhatsApp number (optional, if different from phone)';
