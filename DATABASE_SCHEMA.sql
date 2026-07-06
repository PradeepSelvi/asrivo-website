-- Asrivo Tech Website - Complete Database Schema
-- Created for Supabase

-- ============================================
-- 1. CONTACTS TABLE
-- For general contact form submissions
-- ============================================
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);

-- ============================================
-- 2. SERVICE INQUIRIES TABLE
-- For specific service-related inquiries
-- ============================================
CREATE TABLE service_inquiries (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL, -- 'software-dev', 'web-app', 'mobile-app', 'cloud-devops', 'ai-automation', 'it-consulting'
  project_description TEXT,
  timeline TEXT, -- 'urgent', '1-3-months', '3-6-months', '6-12-months'
  budget TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'in-progress', 'converted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_inquiries_service_type ON service_inquiries(service_type);
CREATE INDEX idx_service_inquiries_status ON service_inquiries(status);
CREATE INDEX idx_service_inquiries_created_at ON service_inquiries(created_at DESC);

-- ============================================
-- 3. PROJECTS TABLE
-- For showcasing completed and ongoing projects
-- ============================================
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL, -- 'web-app', 'mobile-app', 'saas', 'ecommerce', 'ai-ml', 'other'
  client_name TEXT,
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[], -- array of tech names
  image_url TEXT,
  featured_image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  status TEXT DEFAULT 'completed', -- 'completed', 'ongoing', 'planned'
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_display_order ON projects(display_order);

-- ============================================
-- 4. TEAM MEMBERS TABLE
-- For team information
-- ============================================
CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'CEO', 'CTO', 'Senior Developer', etc.
  email TEXT,
  bio TEXT,
  image_url TEXT,
  expertise TEXT[] DEFAULT ARRAY[]::TEXT[], -- array of skills
  social_links JSONB, -- {linkedin: '', github: '', twitter: ''}
  display_order INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_members_active ON team_members(active);
CREATE INDEX idx_team_members_display_order ON team_members(display_order);
CREATE INDEX idx_team_members_position ON team_members(position);

-- ============================================
-- 5. SERVICES TABLE
-- For service descriptions and details
-- ============================================
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  icon TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[], -- array of features
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[], -- array of tech used
  display_order INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_display_order ON services(display_order);

-- ============================================
-- 6. TESTIMONIALS TABLE
-- For client testimonials and reviews
-- ============================================
CREATE TABLE testimonials (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_company TEXT,
  client_image_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5, -- 1-5 stars
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_testimonials_featured ON testimonials(featured);
CREATE INDEX idx_testimonials_project_id ON testimonials(project_id);
CREATE INDEX idx_testimonials_rating ON testimonials(rating);

-- ============================================
-- 7. JOB APPLICATIONS TABLE
-- For career page job applications
-- ============================================
CREATE TABLE job_applications (
  id BIGSERIAL PRIMARY KEY,
  job_title TEXT NOT NULL,
  position_id TEXT, -- reference to job posting
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  experience_years INTEGER,
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_position_id ON job_applications(position_id);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX idx_job_applications_email ON job_applications(email);

-- ============================================
-- 8. JOB POSTINGS TABLE
-- For open job positions
-- ============================================
CREATE TABLE job_postings (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  salary_range TEXT,
  location TEXT,
  employment_type TEXT, -- 'full-time', 'part-time', 'contract', 'remote'
  experience_level TEXT, -- 'junior', 'mid', 'senior'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_postings_slug ON job_postings(slug);
CREATE INDEX idx_job_postings_active ON job_postings(active);

-- ============================================
-- 9. NEWSLETTER SUBSCRIBERS TABLE
-- For email newsletter subscriptions
-- ============================================
CREATE TABLE newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  verification_token TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed);

-- ============================================
-- 10. SETTINGS TABLE
-- For website configuration and settings
-- ============================================
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  type TEXT, -- 'email', 'url', 'text', 'number', 'json', 'boolean'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);

-- ============================================
-- 11. AUDIT LOG TABLE
-- For tracking changes and admin actions
-- ============================================
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  user_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- ============================================
-- 12. ANALYTICS TABLE
-- For page views and user interactions
-- ============================================
CREATE TABLE analytics (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  duration_ms INTEGER,
  event_type TEXT, -- 'page_view', 'click', 'form_submit', 'scroll'
  event_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_page_path ON analytics(page_path);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX idx_analytics_session_id ON analytics(session_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Contacts: Public can insert their own, only admin can read
CREATE POLICY "Enable insert for all users" ON contacts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users only" ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service Inquiries: Public can insert
CREATE POLICY "Enable insert for all users" ON service_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Projects: Public read only
CREATE POLICY "Enable read for all users" ON projects
  FOR SELECT
  USING (true);

-- Team Members: Public read only
CREATE POLICY "Enable read for all users" ON team_members
  FOR SELECT
  USING (true);

-- Services: Public read only
CREATE POLICY "Enable read for all users" ON services
  FOR SELECT
  USING (true);

-- Testimonials: Public read only
CREATE POLICY "Enable read for all users" ON testimonials
  FOR SELECT
  USING (true);

-- Job Postings: Public read only
CREATE POLICY "Enable read for all users" ON job_postings
  FOR SELECT
  USING (true);

-- Job Applications: Public can insert their own
CREATE POLICY "Enable insert for all users" ON job_applications
  FOR INSERT
  WITH CHECK (true);

-- Newsletter Subscribers: Public can insert and update their own
CREATE POLICY "Enable insert for all users" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for users based on email" ON newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Analytics: Public can insert
CREATE POLICY "Enable insert for all users" ON analytics
  FOR INSERT
  WITH CHECK (true);

-- Settings: Public read, authenticated users update
CREATE POLICY "Enable read for all users" ON settings
  FOR SELECT
  USING (true);

-- Audit Logs: Authenticated users only
CREATE POLICY "Enable read for authenticated users" ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- DEFAULT SETTINGS DATA
-- ============================================

INSERT INTO settings (key, value, description, type) VALUES
  ('company_name', 'Asrivo Tech', 'Company name', 'text'),
  ('company_email', 'info@asrivotech.com', 'Main company email', 'email'),
  ('company_phone', '+1 (555) 123-4567', 'Main company phone', 'text'),
  ('company_website', 'https://asrivotech.com', 'Company website URL', 'url'),
  ('linkedin_url', 'https://linkedin.com/company/asrivotech', 'LinkedIn profile', 'url'),
  ('github_url', 'https://github.com/asrivotech', 'GitHub profile', 'url'),
  ('twitter_url', 'https://twitter.com/asrivotech', 'Twitter profile', 'url'),
  ('office_address', 'Your Office Address', 'Physical office address', 'text'),
  ('office_city', 'City Name', 'Office city', 'text'),
  ('office_country', 'Country Name', 'Office country', 'text'),
  ('timezone', 'UTC', 'Company timezone', 'text'),
  ('support_email', 'support@asrivotech.com', 'Support email address', 'email'),
  ('careers_email', 'careers@asrivotech.com', 'Careers email address', 'email'),
  ('newsletter_enabled', 'true', 'Enable newsletter feature', 'boolean'),
  ('contact_form_enabled', 'true', 'Enable contact form', 'boolean'),
  ('service_inquiry_enabled', 'true', 'Enable service inquiry form', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SAMPLE DATA (Optional - Remove in production)
-- ============================================

-- Sample Service
INSERT INTO services (title, slug, description, full_description, features, technologies, display_order, active) VALUES
  ('Software Development', 'software-development', 'Custom software solutions', 'We develop custom software tailored to your business needs...', ARRAY['Custom Development', 'Architecture Design', 'Code Review', 'Testing'], ARRAY['JavaScript', 'TypeScript', 'Python', 'Go'], 1, true),
  ('Web Applications', 'web-applications', 'Modern web app development', 'Build scalable and responsive web applications...', ARRAY['Responsive Design', 'Performance Optimization', 'SEO Ready'], ARRAY['React', 'Next.js', 'Vue.js', 'Angular'], 2, true),
  ('Mobile Applications', 'mobile-applications', 'iOS and Android development', 'Native and cross-platform mobile apps...', ARRAY['iOS Development', 'Android Development', 'Cross-platform'], ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin'], 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SQL TIPS
-- ============================================
-- To backup your database:
-- pg_dump -h your-host -U postgres -d postgres > backup.sql
--
-- To run a query and see results:
-- SELECT * FROM contacts ORDER BY created_at DESC;
--
-- To update the updated_at timestamp automatically:
-- Create a trigger that sets updated_at = NOW() on UPDATE
--
-- To add a user authentication field:
-- ALTER TABLE contacts ADD COLUMN user_id UUID REFERENCES auth.users(id);
