-- Client Inquiries Table for Service Inquiry Form
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS client_inquiries (
  id BIGSERIAL PRIMARY KEY,
  
  -- Contact Information
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT, -- WhatsApp number (optional, if different from phone)
  preferred_contact TEXT DEFAULT 'email', -- email, call, whatsapp
  
  -- Project Details
  project_types TEXT[] NOT NULL, -- ['Web Development', 'Mobile App Development', etc.]
  project_description TEXT NOT NULL,
  has_existing BOOLEAN DEFAULT false,
  existing_link TEXT,
  target_platform TEXT[], -- ['Web', 'iOS', 'Android', 'Both Mobile']
  key_features TEXT[], -- ['Authentication', 'Payment Gateway', etc.]
  
  -- Business Metrics
  budget_range TEXT NOT NULL, -- '<₹50k', '₹50k-2L', '₹2L-5L', '₹5L+', 'not-sure'
  timeline TEXT NOT NULL, -- 'asap', '1-month', '1-3-months', '3-6-months', 'flexible'
  target_audience TEXT,
  pain_points TEXT,
  
  -- Optional Information
  reference_links TEXT,
  hear_about_us TEXT, -- 'linkedin', 'instagram', 'google', 'referral', 'other'
  
  -- Status Tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'rejected'
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  converted_to_lead_id BIGINT, -- Reference to CRM lead if converted
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_inquiries_status ON client_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_email ON client_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_created_at ON client_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_assigned_to ON client_inquiries(assigned_to);

-- Enable Row Level Security (RLS)
ALTER TABLE client_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can insert (submit inquiries)
CREATE POLICY "Anyone can submit inquiries"
  ON client_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view inquiries
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

-- Only admins can update inquiries
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

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_client_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
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
