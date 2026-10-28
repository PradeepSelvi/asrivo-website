-- ==============================================================================
-- Migration: Create Storage Bucket for Team Members
-- Description: Creates the 'team-members' storage bucket with a strict 2 MB limit
--              and configures RLS policies for public viewing and admin uploads.
-- ==============================================================================

-- 1. Create or update the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-members',
  'team-members',
  true,  -- Public bucket so profile images can be rendered on the website
  2097152, -- 2 MB limit (2 * 1024 * 1024 bytes)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Drop existing policies if they exist (prevents duplication conflicts)
DROP POLICY IF EXISTS "Public can view team member images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload team member images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update team member images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete team member images" ON storage.objects;

-- 3. Policy: Allow public read access to all team member photos
CREATE POLICY "Public can view team member images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-members');

-- 4. Policy: Allow authenticated users / admins to upload team member photos
CREATE POLICY "Admins can upload team member images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'team-members'
  AND (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
    OR auth.role() = 'authenticated'
  )
);

-- 5. Policy: Allow authenticated users / admins to update team member photos
CREATE POLICY "Admins can update team member images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-members')
WITH CHECK (bucket_id = 'team-members');

-- 6. Policy: Allow authenticated users / admins to delete team member photos
CREATE POLICY "Admins can delete team member images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'team-members'
  AND (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
    OR auth.role() = 'authenticated'
  )
);

-- 7. Verification Query
SELECT 
  id, 
  name, 
  public, 
  file_size_limit AS max_bytes,
  (file_size_limit / 1024 / 1024) || ' MB' AS max_size_mb,
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'team-members';
