-- Complete Update for Client Inquiries Form
-- Run this in Supabase SQL Editor
-- Adds: WhatsApp, Other fields, and PRD upload support

-- Add all new columns to client_inquiries table
ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS other_project_type TEXT,
ADD COLUMN IF NOT EXISTS other_key_feature TEXT,
ADD COLUMN IF NOT EXISTS prd_file_url TEXT,
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN client_inquiries.whatsapp IS 'WhatsApp number (optional, if different from phone)';
COMMENT ON COLUMN client_inquiries.other_project_type IS 'Custom project type when user selects "Other"';
COMMENT ON COLUMN client_inquiries.other_key_feature IS 'Custom key feature when user selects "Other"';
COMMENT ON COLUMN client_inquiries.prd_file_url IS 'URL of uploaded PRD document';
COMMENT ON COLUMN client_inquiries.prd_file_name IS 'Original filename of uploaded PRD document';

-- Create storage bucket for inquiry documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-documents',
  'inquiry-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete inquiry-documents" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'inquiry-documents');

CREATE POLICY "Allow public read access to inquiry-documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'inquiry-documents');

CREATE POLICY "Allow admins to delete inquiry-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'inquiry-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
