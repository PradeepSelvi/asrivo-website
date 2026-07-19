-- Create Supabase Storage Bucket for Inquiry Documents
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-documents',
  'inquiry-documents',
  true, -- Public bucket for easy access
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
-- Allow anyone to upload (for form submissions)
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'inquiry-documents');

-- Allow admins to read all files
CREATE POLICY "Allow admins to read inquiry-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'inquiry-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Allow public read access (since it's a public bucket)
CREATE POLICY "Allow public read access to inquiry-documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'inquiry-documents');

-- Allow admins to delete files
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

COMMENT ON TABLE storage.buckets IS 'Storage bucket for inquiry PRD documents';
