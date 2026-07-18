-- Update partnership-documents bucket to only accept PDF files
-- Run this in Supabase SQL Editor

UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY['application/pdf'],
  file_size_limit = 10485760
WHERE id = 'partnership-documents';

-- Verify the update
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'partnership-documents';
