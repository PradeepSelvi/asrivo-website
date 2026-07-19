-- Verify PRD Upload Setup
-- Run this to check if everything is configured correctly

-- 1. Check if PRD columns exist in client_inquiries table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'client_inquiries'
AND column_name IN ('prd_file_url', 'prd_file_name')
ORDER BY column_name;

-- Expected result: 2 rows showing both columns exist

-- 2. Check if storage bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'inquiry-documents';

-- Expected result: 1 row showing the bucket exists

-- 3. Check storage policies
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%inquiry-documents%';

-- Expected result: 3 policies (upload, read, delete)

-- 4. Test query - Get recent inquiry with PRD fields
SELECT id, name, email, prd_file_url, prd_file_name, created_at
FROM client_inquiries
ORDER BY created_at DESC
LIMIT 5;

-- This shows if PRD data is being saved
