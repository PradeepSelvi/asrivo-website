-- Add PRD file columns to client_inquiries table
-- Run this ONLY if you haven't added these columns yet
-- Simple version with no dependencies

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_url TEXT;

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;

-- Add comments
COMMENT ON COLUMN client_inquiries.prd_file_url IS 'URL of uploaded PRD document from Supabase Storage';
COMMENT ON COLUMN client_inquiries.prd_file_name IS 'Original filename of uploaded PRD document';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'client_inquiries'
AND column_name IN ('prd_file_url', 'prd_file_name');
