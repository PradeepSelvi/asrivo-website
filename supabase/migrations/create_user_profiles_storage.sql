-- Storage Policies for user-profiles bucket
-- NOTE: Create the bucket first through Supabase Dashboard UI:
--   Storage → New Bucket → Name: "user-profiles" → Public: YES

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to profile images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-profiles' 
  AND (storage.foldername(name))[1] IN ('avatars', 'covers')
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 2: Allow users to update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 3: Allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 4: Allow public read access to all profile images
CREATE POLICY "Public read access to profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-profiles');
