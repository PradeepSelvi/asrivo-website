-- Create Supabase Storage Bucket for Inquiry Documents
-- Run this in Supabase SQL Editor

-- Create the storage bucket (Private bucket to prevent sensitive document exposure)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-documents',
  'inquiry-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Create RLS policies for the bucket
-- Allow anyone to upload (for public form submissions)
DROP POLICY IF EXISTS "Allow public uploads to inquiry-documents" ON storage.objects;
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'inquiry-documents');

-- Drop public read access policy
DROP POLICY IF EXISTS "Allow public read access to inquiry-documents" ON storage.objects;

-- Allow admins to read all files
DROP POLICY IF EXISTS "Allow admins to read inquiry-documents" ON storage.objects;
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

-- Allow admins to delete files
DROP POLICY IF EXISTS "Allow admins to delete inquiry-documents" ON storage.objects;
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
