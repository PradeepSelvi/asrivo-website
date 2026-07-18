-- COMPLETE PARTNERSHIP SYSTEM SETUP
-- Run this entire SQL in Supabase SQL Editor

-- Step 1: Create partnerships table (if not exists)
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  partnership_type TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  services_offered TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add document columns (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partnerships' AND column_name = 'agreement_document_url'
  ) THEN
    ALTER TABLE partnerships
    ADD COLUMN agreement_document_url TEXT,
    ADD COLUMN noc_document_url TEXT,
    ADD COLUMN proposal_document_url TEXT,
    ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
    ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Step 3: Disable RLS (for public submissions)
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Step 4: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE partnerships;

-- Step 5: Create storage bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnership-documents', 
  'partnership-documents', 
  false,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Step 6: Create storage policies
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partnership-documents');

DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partnership-documents');

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partnerships_updated_at ON partnerships;
CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verify setup
SELECT 'Table exists' as check_type, EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'partnerships'
) as result
UNION ALL
SELECT 'Document columns exist' as check_type, EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'partnerships' AND column_name = 'agreement_document_url'
) as result
UNION ALL
SELECT 'Bucket exists' as check_type, EXISTS (
  SELECT FROM storage.buckets WHERE id = 'partnership-documents'
) as result
UNION ALL
SELECT 'RLS disabled' as check_type, NOT EXISTS (
  SELECT FROM pg_tables 
  WHERE tablename = 'partnerships' AND rowsecurity = true
) as result;
