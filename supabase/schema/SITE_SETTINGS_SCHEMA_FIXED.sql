-- =============================================
-- SITE SETTINGS TABLE (FIXED VERSION)
-- Stores all website configuration and settings
-- =============================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'site', 'homepage', 'theme', 'email', 'security'
  key VARCHAR(100) NOT NULL,
  value JSONB, -- Store any type of value (string, number, object, array)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated admins to modify settings" ON site_settings;
DROP POLICY IF EXISTS "Allow admins to manage settings" ON site_settings;
DROP POLICY IF EXISTS "Allow high admins to insert settings" ON site_settings;
DROP POLICY IF EXISTS "Allow high admins to update settings" ON site_settings;
DROP POLICY IF EXISTS "Allow high admins to delete settings" ON site_settings;

-- Policy 1: Public read access for site settings
CREATE POLICY "Allow public read access to site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Only high-level admins can insert settings
CREATE POLICY "Allow high admins to insert settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_high_admin());

-- Policy 3: Only high-level admins can update settings
CREATE POLICY "Allow high admins to update settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_high_admin())
  WITH CHECK (public.is_high_admin());

-- Policy 4: Only high-level admins can delete settings
CREATE POLICY "Allow high admins to delete settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (public.is_high_admin());

-- Insert default site settings
INSERT INTO site_settings (category, key, value, description) VALUES
-- Site Information
('site', 'site_name', '"Asrivo Tech"', 'Website name displayed in browser tabs'),
('site', 'site_tagline', '"Building Tomorrow''s Digital Solutions"', 'Company tagline'),
('site', 'site_description', '"Innovative software development and digital transformation services"', 'Meta description for SEO'),
('site', 'site_keywords', '"software development, web design, mobile apps, digital transformation"', 'SEO keywords'),
('site', 'contact_email', '"contact@asrivotech.com"', 'Primary contact email'),
('site', 'contact_phone', '"+1 (555) 123-4567"', 'Contact phone number'),
('site', 'contact_address', '"123 Tech Street\nSan Francisco, CA 94105"', 'Business address'),
('site', 'business_hours', '"Mon-Fri: 9AM-6PM"', 'Operating hours'),
('site', 'support_email', '"support@asrivotech.com"', 'Support email'),

-- Social Media
('site', 'social_linkedin', '"https://linkedin.com/company/asrivotech"', 'LinkedIn profile URL'),
('site', 'social_instagram', '"https://instagram.com/asrivotech"', 'Instagram profile URL'),
('site', 'social_twitter', '"https://twitter.com/asrivotech"', 'Twitter/X profile URL'),
('site', 'social_github', '"https://github.com/asrivotech"', 'GitHub profile URL'),

-- SEO & Analytics
('site', 'google_analytics_id', '""', 'Google Analytics tracking ID'),
('site', 'google_tag_manager_id', '""', 'Google Tag Manager ID'),
('site', 'facebook_pixel_id', '""', 'Facebook Pixel ID'),

-- Homepage Content
('homepage', 'hero_title', '"Building Tomorrow''s Digital Solutions"', 'Hero section main headline'),
('homepage', 'hero_subtitle', '"We transform ideas into powerful digital experiences through innovative software solutions."', 'Hero section subheadline'),
('homepage', 'hero_cta_primary', '"Start Your Project"', 'Primary CTA button text'),
('homepage', 'hero_cta_secondary', '"View Our Work"', 'Secondary CTA button text'),
('homepage', 'featured_projects_title', '"Featured Projects"', 'Featured projects section title'),
('homepage', 'featured_projects_description', '"Explore some of our recent projects that showcase our expertise and innovation."', 'Featured projects section description'),
('homepage', 'about_title', '"Why Choose Asrivo Tech"', 'About section title'),
('homepage', 'about_description', '"We are a team of passionate developers and designers committed to delivering exceptional digital solutions."', 'About section description'),
('homepage', 'cta_title', '"Ready to Build Something Amazing?"', 'CTA section headline'),
('homepage', 'cta_description', '"Let''s discuss your project and turn your vision into reality."', 'CTA section description'),
('homepage', 'cta_button', '"Get Started Today"', 'CTA button text'),

-- Theme Settings
('theme', 'primary_color', '"#3b82f6"', 'Primary brand color'),
('theme', 'secondary_color', '"#8b5cf6"', 'Secondary brand color'),
('theme', 'accent_color', '"#10b981"', 'Accent color'),
('theme', 'font_heading', '"Inter"', 'Heading font family'),
('theme', 'font_body', '"Inter"', 'Body font family'),
('theme', 'dark_mode_enabled', 'true', 'Enable dark mode support'),

-- Email Settings
('email', 'smtp_host', '""', 'SMTP server host'),
('email', 'smtp_port', '"587"', 'SMTP server port'),
('email', 'smtp_user', '""', 'SMTP username'),
('email', 'smtp_from_name', '"Asrivo Tech"', 'Email sender name'),
('email', 'smtp_from_email', '"noreply@asrivotech.com"', 'Email sender address'),

-- Security Settings
('security', 'captcha_enabled', 'true', 'Enable CAPTCHA on forms'),
('security', 'rate_limit_enabled', 'true', 'Enable rate limiting'),
('security', 'max_requests_per_minute', '60', 'Maximum requests per minute per IP'),
('security', 'session_timeout', '3600', 'Session timeout in seconds'),
('security', 'password_min_length', '8', 'Minimum password length')

ON CONFLICT (category, key) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Create helper function to get setting value
CREATE OR REPLACE FUNCTION get_site_setting(p_category VARCHAR, p_key VARCHAR)
RETURNS JSONB AS $$
  SELECT value FROM site_settings WHERE category = p_category AND key = p_key LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Create helper function to update setting value (high-admin only)
CREATE OR REPLACE FUNCTION update_site_setting(p_category VARCHAR, p_key VARCHAR, p_value JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT public.is_high_admin() THEN
    RAISE EXCEPTION 'Access denied: only high-level administrators can modify site settings.';
  END IF;

  UPDATE site_settings
  SET value = p_value, updated_at = NOW()
  WHERE category = p_category AND key = p_key;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions (least-privilege)
REVOKE ALL ON site_settings FROM anon;
GRANT SELECT ON site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON site_settings TO authenticated;

COMMENT ON TABLE site_settings IS 'Stores all website configuration settings that can be edited by high-level admins';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'category') THEN
    EXECUTE 'COMMENT ON COLUMN site_settings.category IS ''Setting category: site, homepage, theme, email, security''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'key') THEN
    EXECUTE 'COMMENT ON COLUMN site_settings.key IS ''Unique setting identifier within category''';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'value') THEN
    EXECUTE 'COMMENT ON COLUMN site_settings.value IS ''JSON value - can be string, number, boolean, object, or array''';
  END IF;
END $$;
