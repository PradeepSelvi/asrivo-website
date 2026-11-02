-- ============================================
-- CREATE STORAGE BUCKETS FOR PROJECTS
-- ============================================

-- Create storage bucket for project PRD files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-prds', 'project-prds', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for project images/gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set allowed MIME types for PRD bucket (Markdown files)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['text/markdown', 'text/plain', 'application/octet-stream']
WHERE id = 'project-prds';

-- Set file size limit for PRD files (5MB)
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'project-prds';

-- Set allowed MIME types for images bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'project-images';

-- Set file size limit for images (10MB)
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'project-images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public PRD uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin PRD uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public PRD access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image access" ON storage.objects;

-- Create policies for PRD bucket (restricted to verified admins)
CREATE POLICY "Allow admin PRD uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-prds'
  AND EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

CREATE POLICY "Allow public PRD access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-prds');

-- Create policies for images bucket (restricted to verified admins)
CREATE POLICY "Allow admin image uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);

CREATE POLICY "Allow public image access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');
