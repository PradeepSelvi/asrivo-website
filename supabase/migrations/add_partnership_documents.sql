-- Add document columns to partnerships table
ALTER TABLE partnerships
ADD COLUMN agreement_document_url TEXT,
ADD COLUMN noc_document_url TEXT,
ADD COLUMN proposal_document_url TEXT,
ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Create storage bucket for partnership documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('partnership-documents', 'partnership-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for partnership documents
-- Restrict read access strictly to verified administrators (Finding f72d2a11 / CWE-862)
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Allow public to upload (secured by API validation)
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

-- Restrict delete access strictly to verified administrators
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'partnership-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
