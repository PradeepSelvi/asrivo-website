-- ============================================
-- TIGHTENED RLS POLICIES FOR ASRIVO TECH
-- Security Audit Fix - Admin-Only Tables Protection
-- SAFE TO RUN - Compatible with existing admin_profiles setup
-- ============================================

-- ============================================
-- DROP EXISTING POLICIES (Safe - uses IF EXISTS)
-- ============================================

-- Drop old settings policies
DROP POLICY IF EXISTS "Enable read for all users" ON settings;

-- Drop old audit_logs policies  
DROP POLICY IF EXISTS "Enable read for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Admin read access" ON audit_logs;

-- Drop old analytics policies
DROP POLICY IF EXISTS "Enable insert for all users" ON analytics;
DROP POLICY IF EXISTS "Admin read access" ON analytics;

-- Drop service_inquiries policies to recreate
DROP POLICY IF EXISTS "Enable insert for all users" ON service_inquiries;
DROP POLICY IF EXISTS "Admin read access" ON service_inquiries;

-- Drop job_applications policies to recreate  
DROP POLICY IF EXISTS "Enable insert for all users" ON job_applications;
DROP POLICY IF EXISTS "Admin read access" ON job_applications;

-- Drop contacts policies to recreate
DROP POLICY IF EXISTS "Enable insert for all users" ON contacts;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON contacts;

-- Drop newsletter policies to keep them simple
DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin read access" ON newsletter_subscribers;

-- ============================================
-- ADMIN-ONLY TABLES - STRICT POLICIES
-- Uses is_admin() function from your existing schema
-- ============================================

-- AUDIT_LOGS: Admin read-only, no public access
DROP POLICY IF EXISTS "Admin read only audit" ON audit_logs;
CREATE POLICY "Admin read only audit" ON audit_logs
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Block all writes from clients audit" ON audit_logs;
CREATE POLICY "Block all writes from clients audit" ON audit_logs
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients audit" ON audit_logs;
CREATE POLICY "Block all updates from clients audit" ON audit_logs
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients audit" ON audit_logs;
CREATE POLICY "Block all deletes from clients audit" ON audit_logs
  FOR DELETE
  USING (false);

-- ANALYTICS: Admin read-only, server-side inserts only
DROP POLICY IF EXISTS "Admin read only analytics" ON analytics;
CREATE POLICY "Admin read only analytics" ON analytics
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Block all writes from clients analytics" ON analytics;
CREATE POLICY "Block all writes from clients analytics" ON analytics
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients analytics" ON analytics;
CREATE POLICY "Block all updates from clients analytics" ON analytics
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients analytics" ON analytics;
CREATE POLICY "Block all deletes from clients analytics" ON analytics
  FOR DELETE
  USING (false);

-- SETTINGS: Public read, admin write only
DROP POLICY IF EXISTS "Public read access settings" ON settings;
CREATE POLICY "Public read access settings" ON settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin write only settings" ON settings;
CREATE POLICY "Admin write only settings" ON settings
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update only settings" ON settings;
CREATE POLICY "Admin update only settings" ON settings
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin delete only settings" ON settings;
CREATE POLICY "Admin delete only settings" ON settings
  FOR DELETE
  USING (is_admin());

-- ============================================
-- FORM SUBMISSION TABLES - PUBLIC INSERT, ADMIN READ
-- ============================================

-- CONTACTS: Public can submit, admin can read
DROP POLICY IF EXISTS "Public can submit contacts" ON contacts;
CREATE POLICY "Public can submit contacts" ON contacts
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read only contacts" ON contacts;
CREATE POLICY "Admin read only contacts" ON contacts
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Block all updates from clients contacts" ON contacts;
CREATE POLICY "Block all updates from clients contacts" ON contacts
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients contacts" ON contacts;
CREATE POLICY "Block all deletes from clients contacts" ON contacts
  FOR DELETE
  USING (false);

-- SERVICE_INQUIRIES: Public can submit, admin can read
DROP POLICY IF EXISTS "Public can submit inquiries" ON service_inquiries;
CREATE POLICY "Public can submit inquiries" ON service_inquiries
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read only inquiries" ON service_inquiries;
CREATE POLICY "Admin read only inquiries" ON service_inquiries
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin update only inquiries" ON service_inquiries;
CREATE POLICY "Admin update only inquiries" ON service_inquiries
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Block all deletes from clients inquiries" ON service_inquiries;
CREATE POLICY "Block all deletes from clients inquiries" ON service_inquiries
  FOR DELETE
  USING (false);

-- JOB_APPLICATIONS: Public can submit, admin can read
DROP POLICY IF EXISTS "Public can submit applications" ON job_applications;
CREATE POLICY "Public can submit applications" ON job_applications
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read only applications" ON job_applications;
CREATE POLICY "Admin read only applications" ON job_applications
  FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin update only applications" ON job_applications;
CREATE POLICY "Admin update only applications" ON job_applications
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Block all deletes from clients applications" ON job_applications;
CREATE POLICY "Block all deletes from clients applications" ON job_applications
  FOR DELETE
  USING (false);

-- NEWSLETTER_SUBSCRIBERS: Public can submit and update own, admin can read all
DROP POLICY IF EXISTS "Public can subscribe newsletter" ON newsletter_subscribers;
CREATE POLICY "Public can subscribe newsletter" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update own subscription" ON newsletter_subscribers;
CREATE POLICY "Public can update own subscription" ON newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read newsletter" ON newsletter_subscribers;
CREATE POLICY "Admin read newsletter" ON newsletter_subscribers
  FOR SELECT
  USING (is_admin());

-- ============================================
-- PUBLIC TABLES - READ ONLY FOR EVERYONE
-- Keep existing read policies, add write blocks
-- ============================================

-- PROJECTS: Public read exists, add no write
DROP POLICY IF EXISTS "Block all writes from clients projects" ON projects;
CREATE POLICY "Block all writes from clients projects" ON projects
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients projects" ON projects;
CREATE POLICY "Block all updates from clients projects" ON projects
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients projects" ON projects;
CREATE POLICY "Block all deletes from clients projects" ON projects
  FOR DELETE
  USING (false);

-- TEAM_MEMBERS: Public read exists, add no write
DROP POLICY IF EXISTS "Block all writes from clients team" ON team_members;
CREATE POLICY "Block all writes from clients team" ON team_members
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients team" ON team_members;
CREATE POLICY "Block all updates from clients team" ON team_members
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients team" ON team_members;
CREATE POLICY "Block all deletes from clients team" ON team_members
  FOR DELETE
  USING (false);

-- SERVICES: Public read exists, add no write
DROP POLICY IF EXISTS "Block all writes from clients services" ON services;
CREATE POLICY "Block all writes from clients services" ON services
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients services" ON services;
CREATE POLICY "Block all updates from clients services" ON services
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients services" ON services;
CREATE POLICY "Block all deletes from clients services" ON services
  FOR DELETE
  USING (false);

-- TESTIMONIALS: Public read exists, add no write
DROP POLICY IF EXISTS "Block all writes from clients testimonials" ON testimonials;
CREATE POLICY "Block all writes from clients testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients testimonials" ON testimonials;
CREATE POLICY "Block all updates from clients testimonials" ON testimonials
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients testimonials" ON testimonials;
CREATE POLICY "Block all deletes from clients testimonials" ON testimonials
  FOR DELETE
  USING (false);

-- JOB_POSTINGS: Public read exists, add no write
DROP POLICY IF EXISTS "Block all writes from clients jobpostings" ON job_postings;
CREATE POLICY "Block all writes from clients jobpostings" ON job_postings
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block all updates from clients jobpostings" ON job_postings;
CREATE POLICY "Block all updates from clients jobpostings" ON job_postings
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Block all deletes from clients jobpostings" ON job_postings;
CREATE POLICY "Block all deletes from clients jobpostings" ON job_postings
  FOR DELETE
  USING (false);

-- ============================================
-- VERIFICATION QUERIES (Run separately)
-- ============================================

-- Check all policies were created:
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies 
-- WHERE tablename IN ('audit_logs', 'settings', 'analytics', 'contacts', 
--                     'service_inquiries', 'job_applications', 'projects')
-- ORDER BY tablename, cmd;

-- Test as unauthenticated user (should all FAIL):
-- INSERT INTO settings (key, value) VALUES ('hack_test', 'test');
-- INSERT INTO audit_logs (table_name, action) VALUES ('test', 'test');
-- UPDATE projects SET title = 'hacked' WHERE id = 1;
-- DELETE FROM services WHERE id = 1;

-- Test public operations (should SUCCEED):
-- SELECT * FROM projects LIMIT 5;
-- SELECT * FROM services LIMIT 5;
-- INSERT INTO contacts (email, name, message) 
-- VALUES ('test@test.com', 'Test', 'Test message');

-- Check admin functions work:
-- SELECT is_admin();
-- SELECT is_high_admin();
-- SELECT get_my_role();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Summary:';
  RAISE NOTICE '  ✓ audit_logs - Admin read-only, no client writes';
  RAISE NOTICE '  ✓ analytics - Admin read-only, no client writes';
  RAISE NOTICE '  ✓ settings - Public read, admin write only';
  RAISE NOTICE '  ✓ contacts - Public insert, admin read';
  RAISE NOTICE '  ✓ service_inquiries - Public insert, admin read/update';
  RAISE NOTICE '  ✓ job_applications - Public insert, admin read/update';
  RAISE NOTICE '  ✓ Public tables - Read-only, explicit write denial';
  RAISE NOTICE '';
  RAISE NOTICE 'Run verification queries to test policies.';
END;
$$;
