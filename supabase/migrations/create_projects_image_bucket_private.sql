-- ==============================================================================
-- Migration: Create/Update Storage Bucket for Projects (Private & Secure)
-- Description: Sets the 'project-images' bucket to PRIVATE (public = false)
--              Strictly restricts allowed MIME types to JPG, JPEG, and PNG.
--              Enforces production RLS policies for admin uploads and management.
-- ==============================================================================

-- 1. Create or update the storage bucket as PRIVATE
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  false,  -- PRIVATE bucket
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png'] -- Strictly JPG, JPEG, PNG
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

-- 2. Drop existing policies if they exist (prevents duplication conflicts)
DROP POLICY IF EXISTS "Allow public image access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view project images" ON storage.objects;

-- 3. Policy: Only admins can read project photos (F-013 / CWE-863)
CREATE POLICY "Admins can view project images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 4. Policy: Only admins can upload project photos (F-013 / CWE-863)
CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

-- 5. Policy: Only admins can update project photos (F-013 / CWE-863)
CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
)
WITH CHECK (bucket_id = 'project-images');

-- 6. Policy: Only admins can delete project photos (F-013 / CWE-863)
CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
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
WHERE id = 'project-images';
