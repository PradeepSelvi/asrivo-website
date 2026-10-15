-- ============================================
-- SITE SETTINGS TABLE MIGRATION
-- ============================================
-- This creates the site_settings table that stores all CMS content
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (optional - remove if you want to preserve data)
-- DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Add helpful comment
COMMENT ON TABLE public.site_settings IS 'Stores CMS content for website (homepage, theme, email, security settings)';

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admins to manage settings" ON public.site_settings;

-- Policy 1: Allow anyone to read settings (public website needs this)
CREATE POLICY "Allow public read access" 
  ON public.site_settings
  FOR SELECT 
  USING (true);

-- Policy 2: Only admins can insert/update/delete settings
CREATE POLICY "Allow admins to manage settings" 
  ON public.site_settings
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_site_settings_category_key 
  ON public.site_settings(category, key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS site_settings_updated_at_trigger ON public.site_settings;
CREATE TRIGGER site_settings_updated_at_trigger
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- ============================================
-- INSERT DEFAULT HOMEPAGE SETTINGS
-- ============================================

INSERT INTO public.site_settings (category, key, value, description) VALUES
  -- Hero Section
  (
    'homepage', 
    'hero_title', 
    '"Innovation Meets Excellence"',
    'Main headline on homepage hero section'
  ),
  (
    'homepage', 
    'hero_subtitle', 
    '"Transform your digital presence with cutting-edge solutions that drive real business results"',
    'Subheadline on homepage hero section'
  ),
  (
    'homepage', 
    'hero_cta_primary', 
    '"Get Started"',
    'Primary call-to-action button text'
  ),
  (
    'homepage', 
    'hero_cta_secondary', 
    '"Learn More"',
    'Secondary call-to-action button text'
  ),
  
  -- Featured Projects Section
  (
    'homepage', 
    'featured_projects_title', 
    '"Featured Projects"',
    'Title for featured projects section'
  ),
  (
    'homepage', 
    'featured_projects_description', 
    '"Explore our portfolio of successful projects that showcase our expertise and innovation"',
    'Description for featured projects section'
  ),
  
  -- About Section
  (
    'homepage', 
    'about_title', 
    '"Why Choose Asrivo Tech"',
    'Title for about preview section'
  ),
  (
    'homepage', 
    'about_description', 
    '"We are a team of passionate developers and designers committed to delivering exceptional digital solutions that transform businesses"',
    'Description for about preview section'
  ),
  
  -- CTA Section
  (
    'homepage', 
    'cta_title', 
    '"Let''s Build Your Next Product Together"',
    'Title for bottom call-to-action section'
  ),
  (
    'homepage', 
    'cta_description', 
    '"Ready to transform your ideas into reality? Our team is here to help you build innovative solutions that drive your business forward."',
    'Description for call-to-action section'
  ),
  (
    'homepage', 
    'cta_button', 
    '"Start a Project"',
    'Button text for call-to-action'
  )
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- VERIFY DATA
-- ============================================

-- Show all homepage settings
SELECT 
  category,
  key,
  value,
  description,
  created_at
FROM public.site_settings
WHERE category = 'homepage'
ORDER BY key;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Site settings table created successfully!';
  RAISE NOTICE '✅ Default homepage settings inserted!';
  RAISE NOTICE '✅ RLS policies configured!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to /admin/settings/homepage';
  RAISE NOTICE '2. Edit any text you want';
  RAISE NOTICE '3. Click "Save Changes"';
  RAISE NOTICE '4. Visit your homepage to see changes!';
END $$;
