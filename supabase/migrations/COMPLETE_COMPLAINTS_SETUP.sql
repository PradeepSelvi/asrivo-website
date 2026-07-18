-- ============================================
-- COMPLETE COMPLAINTS SYSTEM SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE COMPLAINTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new',
  proof_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for public access (no login required)
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(email);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;

-- ============================================
-- 2. CREATE STORAGE BUCKET FOR PROOF DOCUMENTS
-- ============================================

-- Create storage bucket for complaint proof documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof of complain', 'proof of complain', true)
ON CONFLICT (id) DO NOTHING;

-- Set allowed MIME types for the bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'proof of complain';

-- Set file size limit (3MB = 3145728 bytes)
UPDATE storage.buckets
SET file_size_limit = 3145728
WHERE id = 'proof of complain';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;

-- Create policy for public uploads (INSERT)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proof of complain');

-- Create policy for public access (SELECT)
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proof of complain');

-- ============================================
-- 3. ADD TYPE COLUMN TO CONTACTS TABLE
-- ============================================

-- Add type column to contacts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE contacts ADD COLUMN type TEXT;
    END IF;
END $$;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);

-- ============================================
-- VERIFICATION QUERIES
-- Run these after the migration to verify
-- ============================================

-- Check complaints table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'complaints'
-- ORDER BY ordinal_position;

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'proof of complain';

-- Check contacts table has type column
-- SELECT column_name, data_type 
-- FROM information_schema.columns
-- WHERE table_name = 'contacts' AND column_name = 'type';
