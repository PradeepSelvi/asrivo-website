-- Migration: Restrict project-prds and project-images storage upload policies to verified admins
-- Fixes CWE-79 / CodeRabbit finding: arbitrary public PRD upload vector

DROP POLICY IF EXISTS "Allow public PRD uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin PRD uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin image uploads" ON storage.objects;

-- Admin-only INSERT policy for project-prds
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

-- Admin-only INSERT policy for project-images
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
