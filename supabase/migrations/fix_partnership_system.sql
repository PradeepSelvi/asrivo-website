-- ============================================
-- FIX PARTNERSHIP SYSTEM - SAFE CLEANUP
-- Run this in Supabase SQL Editor
-- This script fixes existing policies and sets up storage correctly
-- ============================================

-- Step 1: Fix partnerships table RLS policies
DROP POLICY IF EXISTS "Public can submit partnership applications" ON partnerships;
DROP POLICY IF EXISTS "Admins can view all partnerships" ON partnerships;
DROP POLICY IF EXISTS "Admins can update partnerships" ON partnerships;
DROP POLICY IF EXISTS "Admins can delete partnerships" ON partnerships;

-- Create table policies
CREATE POLICY "Public can submit partnership applications"
ON partnerships FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can view all partnerships"
ON partnerships FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  )
);

CREATE POLICY "Admins can update partnerships"
ON partnerships FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  )
);

CREATE POLICY "Admins can delete partnerships"
ON partnerships FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE admin_profiles.id = auth.uid()
  )
);

-- Step 2: Ensure partnership-documents bucket exists and is private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnership-documents', 
  'partnership-documents', 
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Step 3: Drop existing storage policies
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;

-- Step 4: Create secure storage policies
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

-- Restrict read access strictly to verified administrators (Finding f72d2a11 / CWE-862)
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

-- Restrict delete access strictly to verified administrators
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

-- Step 5: Verify everything
SELECT 
  'partnerships table' as item,
  CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'partnerships') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'partnership-documents bucket' as item,
  CASE WHEN EXISTS (SELECT FROM storage.buckets WHERE id = 'partnership-documents') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
