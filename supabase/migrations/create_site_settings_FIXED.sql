-- ============================================
-- SITE SETTINGS TABLE - FIXED VERSION
-- ============================================
-- Run this in Supabase SQL Editor

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

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to verify high-admin role (non-recursive, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_high_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
      AND role = 'high'
  );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admins to manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated admins to modify settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to delete settings" ON public.site_settings;

-- Policy 1: Public read access
CREATE POLICY "Allow public read access" 
  ON public.site_settings
  FOR SELECT 
  TO public
  USING (true);

-- Policy 2: High admin INSERT
CREATE POLICY "Allow high admins to insert settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_high_admin());

-- Policy 3: High admin UPDATE
CREATE POLICY "Allow high admins to update settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_high_admin())
  WITH CHECK (public.is_high_admin());

-- Policy 4: High admin DELETE
CREATE POLICY "Allow high admins to delete settings"
  ON public.site_settings
  FOR DELETE
  TO authenticated
  USING (public.is_high_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_category_key 
  ON public.site_settings(category, key);

-- Insert default homepage settings
INSERT INTO public.site_settings (category, key, value, description) VALUES
  ('homepage', 'hero_title', '"Innovation Meets Excellence"', 'Main headline'),
  ('homepage', 'hero_subtitle', '"Transform your digital presence with cutting-edge solutions"', 'Subheadline'),
  ('homepage', 'hero_cta_primary', '"Get Started"', 'Primary button'),
  ('homepage', 'hero_cta_secondary', '"Learn More"', 'Secondary button'),
  ('homepage', 'featured_projects_title', '"Featured Projects"', 'Projects section title'),
  ('homepage', 'featured_projects_description', '"Explore our portfolio of successful projects"', 'Projects description'),
  ('homepage', 'about_title', '"Why Choose Asrivo Tech"', 'About section title'),
  ('homepage', 'about_description', '"We are a team of passionate developers"', 'About description'),
  ('homepage', 'cta_title', '"Let''s Build Your Next Product Together"', 'CTA title'),
  ('homepage', 'cta_description', '"Ready to transform your ideas into reality?"', 'CTA description'),
  ('homepage', 'cta_button', '"Start a Project"', 'CTA button text')
ON CONFLICT (category, key) DO NOTHING;

-- Show results
SELECT category, key, value FROM public.site_settings WHERE category = 'homepage';
