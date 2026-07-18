-- FIXED: Partnership System Setup
-- Run this in Supabase SQL Editor

-- Step 1: Check if partnerships table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partnerships') THEN
    CREATE TABLE partnerships (
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
  END IF;
END $$;

-- Step 2: Add document columns (safe - won't fail if they exist)
ALTER TABLE partnerships ADD COLUMN IF NOT EXISTS agreement_document_url TEXT;
ALTER TABLE partnerships ADD COLUMN IF NOT EXISTS noc_document_url TEXT;
ALTER TABLE partnerships ADD COLUMN IF NOT EXISTS proposal_document_url TEXT;
ALTER TABLE partnerships ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
ALTER TABLE partnerships ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Step 3: Disable RLS
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Step 4: Create storage bucket (safe - won't fail if exists)
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

-- Step 5: Drop existing policies (safe - won't fail if they don't exist)
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;

-- Step 6: Create storage policies (now they won't conflict)
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partnership-documents');

CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partnership-documents');

-- Step 7: Verify everything
SELECT 
  'partnerships table' as item,
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'partnerships') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'agreement_document_url column' as item,
  CASE WHEN EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'partnerships' AND column_name = 'agreement_document_url') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'partnership-documents bucket' as item,
  CASE WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'partnership-documents') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
