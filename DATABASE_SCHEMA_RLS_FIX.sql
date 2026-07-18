-- ============================================
-- TIGHTENED RLS POLICIES FOR ASRIVO TECH
-- Security Audit Fix - Admin-Only Tables Protection
-- ============================================

-- ============================================
-- DROP EXISTING POLICIES THAT NEED FIXES
-- ============================================

-- Drop old settings policies
DROP POLICY IF EXISTS "Enable read for all users" ON settings;

-- Drop old audit_logs policies  
DROP POLICY IF EXISTS "Enable read for authenticated users" ON audit_logs;

-- Drop old analytics policies
DROP POLICY IF EXISTS "Enable insert for all users" ON analytics;

-- Drop service_inquiries policies to recreate
DROP POLICY IF EXISTS "Enable insert for all users" ON service_inquiries;

-- Drop job_applications policies to recreate  
DROP POLICY IF EXISTS "Enable insert for all users" ON job_applications;

-- Drop contacts policies to recreate
DROP POLICY IF EXISTS "Enable insert for all users" ON contacts;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON contacts;

-- ============================================
-- ADMIN-ONLY TABLES - STRICT POLICIES
-- ============================================

-- AUDIT_LOGS: Admin read-only, no public access
CREATE POLICY "Admin read only" ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Block all writes from clients" ON audit_logs
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON audit_logs
  FOR DELETE
  USING (false);

-- ANALYTICS: Admin read-only, server-side inserts only
CREATE POLICY "Admin read only" ON analytics
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Block all writes from clients" ON analytics
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON analytics
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON analytics
  FOR DELETE
  USING (false);

-- SETTINGS: Public read, admin write only
CREATE POLICY "Public read access" ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admin write only" ON settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update only" ON settings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin delete only" ON settings
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- FORM SUBMISSION TABLES - PUBLIC INSERT, ADMIN READ
-- ============================================

-- CONTACTS: Public can submit, admin can read
CREATE POLICY "Public can submit contacts" ON contacts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read only" ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Block all updates from clients" ON contacts
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON contacts
  FOR DELETE
  USING (false);

-- SERVICE_INQUIRIES: Public can submit, admin can read
CREATE POLICY "Public can submit inquiries" ON service_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read only" ON service_inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update only" ON service_inquiries
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Block all deletes from clients" ON service_inquiries
  FOR DELETE
  USING (false);

-- JOB_APPLICATIONS: Public can submit, admin can read
CREATE POLICY "Public can submit applications" ON job_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read only" ON job_applications
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update only" ON job_applications
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Block all deletes from clients" ON job_applications
  FOR DELETE
  USING (false);

-- ============================================
-- PUBLIC TABLES - READ ONLY FOR EVERYONE
-- ============================================

-- PROJECTS: Public read, no write
CREATE POLICY "Block all writes from clients" ON projects
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON projects
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON projects
  FOR DELETE
  USING (false);

-- TEAM_MEMBERS: Public read, no write
CREATE POLICY "Block all writes from clients" ON team_members
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON team_members
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON team_members
  FOR DELETE
  USING (false);

-- SERVICES: Public read, no write
CREATE POLICY "Block all writes from clients" ON services
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON services
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON services
  FOR DELETE
  USING (false);

-- TESTIMONIALS: Public read, no write
CREATE POLICY "Block all writes from clients" ON testimonials
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON testimonials
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON testimonials
  FOR DELETE
  USING (false);

-- JOB_POSTINGS: Public read, no write
CREATE POLICY "Block all writes from clients" ON job_postings
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block all updates from clients" ON job_postings
  FOR UPDATE
  USING (false);

CREATE POLICY "Block all deletes from clients" ON job_postings
  FOR DELETE
  USING (false);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify policies are working:

-- Should return all policies for audit_logs:
-- SELECT * FROM pg_policies WHERE tablename = 'audit_logs';

-- Should return all policies for settings:
-- SELECT * FROM pg_policies WHERE tablename = 'settings';

-- Should return all policies for analytics:
-- SELECT * FROM pg_policies WHERE tablename = 'analytics';

-- Test as unauthenticated user (should fail):
-- INSERT INTO settings (key, value) VALUES ('test', 'test');
-- INSERT INTO audit_logs (table_name, action) VALUES ('test', 'test');
-- UPDATE projects SET title = 'hacked' WHERE id = 1;

-- ============================================
-- NOTES
-- ============================================
-- * All "false" policies explicitly deny operations from client side
-- * Admin operations should be done via service_role key (server-side)
-- * Form submissions (contacts, service_inquiries, job_applications) allow public INSERT only
-- * Public tables (projects, services, etc.) are completely read-only from client
-- * Analytics and audit_logs require server-side operations only
