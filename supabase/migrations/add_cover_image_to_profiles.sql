-- Add cover_image_url column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN user_profiles.cover_image_url IS 'URL to user profile cover/banner image';
