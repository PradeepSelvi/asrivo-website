-- ============================================================
-- SUPABASE FUNCTIONS, TRIGGERS & ADMIN SETUP
-- High Admin : pradeepselvi126@gmail.com / PRk@123456
-- Low Admin  : idnumberselect@gmail.com  / IDn@123456
-- Safe to re-run (idempotent)
-- ============================================================


-- ============================================================
-- 0. PRE-FLIGHT: ensure audit_logs.record_id accepts UUIDs
-- Safe no-op if already TEXT
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs'
      AND column_name = 'record_id'
      AND data_type = 'bigint'
  ) THEN
    ALTER TABLE audit_logs ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;
  END IF;
END;
$$;


-- ============================================================
-- 1. ADMIN PROFILES TABLE
-- Matches what admin-actions.ts expects:
--   - primary key is the auth.users UUID (id)
--   - role values: 'high' | 'low'
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'low',  -- 'high' | 'low'
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own profile" ON admin_profiles;
CREATE POLICY "Admins can read their own profile" ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "High admin can manage all profiles" ON admin_profiles;
CREATE POLICY "High admin can manage all profiles" ON admin_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role = 'high'
    )
  );


-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

-- Returns the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM admin_profiles WHERE id = auth.uid();
$$;

-- Returns TRUE if the current user is a high admin
CREATE OR REPLACE FUNCTION is_high_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
      AND role = 'high'
  );
$$;

-- Returns TRUE if the current user is any kind of admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
  );
$$;


-- ============================================================
-- 3. UPDATED_AT TRIGGER FUNCTION
-- Auto-updates updated_at column on any row change
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to every table that has updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'contacts', 'service_inquiries', 'projects', 'team_members',
    'services', 'testimonials', 'job_applications', 'job_postings',
    'newsletter_subscribers', 'settings', 'admin_profiles'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;
      CREATE TRIGGER trg_set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', tbl, tbl);
  END LOOP;
END;
$$;


-- ============================================================
-- 4. AUDIT LOG TRIGGER FUNCTION
-- Automatically logs INSERT / UPDATE / DELETE for key tables
-- ============================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'delete', auth.uid()::TEXT, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values, new_values)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'update', auth.uid()::TEXT, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, user_id, new_values)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'create', auth.uid()::TEXT, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit trigger to admin-managed tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'contacts', 'service_inquiries', 'projects', 'team_members',
    'services', 'testimonials', 'job_applications', 'job_postings',
    'newsletter_subscribers', 'settings', 'admin_profiles'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_audit ON %I;
      CREATE TRIGGER trg_audit
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    ', tbl, tbl);
  END LOOP;
END;
$$;


-- ============================================================
-- 5. SLUG GENERATION FUNCTION
-- Generates a URL-safe slug from a text string
-- ============================================================

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(trim(input_text));
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  RETURN result;
END;
$$;


-- ============================================================
-- 6. NEWSLETTER SUBSCRIPTION FUNCTION
-- Handles subscribe / unsubscribe safely
-- ============================================================

CREATE OR REPLACE FUNCTION subscribe_newsletter(
  p_email TEXT,
  p_name  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_result JSONB;
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');

  INSERT INTO newsletter_subscribers (email, name, verification_token, subscribed, verified)
  VALUES (p_email, p_name, v_token, TRUE, FALSE)
  ON CONFLICT (email) DO UPDATE
    SET subscribed        = TRUE,
        name              = COALESCE(EXCLUDED.name, newsletter_subscribers.name),
        verification_token = v_token,
        updated_at        = NOW();

  SELECT jsonb_build_object(
    'success', TRUE,
    'email',   p_email,
    'token',   v_token
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION unsubscribe_newsletter(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET subscribed = FALSE, updated_at = NOW()
  WHERE email = p_email;

  RETURN jsonb_build_object('success', TRUE, 'email', p_email);
END;
$$;

CREATE OR REPLACE FUNCTION verify_newsletter_email(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT;
BEGIN
  UPDATE newsletter_subscribers
  SET verified = TRUE, updated_at = NOW()
  WHERE verification_token = p_token
    AND verified = FALSE
  RETURNING email INTO v_email;

  IF v_email IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid or already verified token');
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'email', v_email);
END;
$$;


-- ============================================================
-- 7. DISPLAY ORDER MANAGEMENT FUNCTIONS
-- Reorder items by swapping display_order values
-- ============================================================

CREATE OR REPLACE FUNCTION reorder_items(
  p_table TEXT,
  p_id    BIGINT,
  p_new_order INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_order INTEGER;
BEGIN
  EXECUTE format('SELECT display_order FROM %I WHERE id = $1', p_table)
  INTO v_old_order
  USING p_id;

  IF v_old_order IS NULL THEN RETURN; END IF;

  IF p_new_order < v_old_order THEN
    EXECUTE format('
      UPDATE %I SET display_order = display_order + 1
      WHERE display_order >= $1 AND display_order < $2
    ', p_table) USING p_new_order, v_old_order;
  ELSIF p_new_order > v_old_order THEN
    EXECUTE format('
      UPDATE %I SET display_order = display_order - 1
      WHERE display_order > $1 AND display_order <= $2
    ', p_table) USING v_old_order, p_new_order;
  END IF;

  EXECUTE format('UPDATE %I SET display_order = $1 WHERE id = $2', p_table)
  USING p_new_order, p_id;
END;
$$;


-- ============================================================
-- 8. CONTACT / INQUIRY STATUS UPDATE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_contact_status(
  p_id     BIGINT,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE contacts
  SET status = p_status, updated_at = NOW()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_inquiry_status(
  p_id     BIGINT,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE service_inquiries
  SET status = p_status, updated_at = NOW()
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_application_status(
  p_id     BIGINT,
  p_status TEXT,
  p_notes  TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE job_applications
  SET status     = p_status,
      notes      = COALESCE(p_notes, notes),
      updated_at = NOW()
  WHERE id = p_id;
END;
$$;


-- ============================================================
-- 9. ANALYTICS HELPER FUNCTIONS
-- ============================================================

-- Returns page-view counts grouped by path for a date range
CREATE OR REPLACE FUNCTION get_page_views(
  p_from TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_to   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (page_path TEXT, view_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT page_path, COUNT(*) AS view_count
  FROM analytics
  WHERE event_type = 'page_view'
    AND created_at BETWEEN p_from AND p_to
  GROUP BY page_path
  ORDER BY view_count DESC;
$$;

-- Returns total counts per event type
CREATE OR REPLACE FUNCTION get_event_summary(
  p_from TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_to   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (event_type TEXT, total BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT event_type, COUNT(*) AS total
  FROM analytics
  WHERE created_at BETWEEN p_from AND p_to
  GROUP BY event_type
  ORDER BY total DESC;
$$;


-- ============================================================
-- 10. DASHBOARD STATS FUNCTION
-- Single call to get all admin dashboard counts
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT jsonb_build_object(
    'contacts',             (SELECT COUNT(*) FROM contacts),
    'unread_contacts',      (SELECT COUNT(*) FROM contacts WHERE status = 'unread'),
    'service_inquiries',    (SELECT COUNT(*) FROM service_inquiries),
    'new_inquiries',        (SELECT COUNT(*) FROM service_inquiries WHERE status = 'new'),
    'job_applications',     (SELECT COUNT(*) FROM job_applications),
    'new_applications',     (SELECT COUNT(*) FROM job_applications WHERE status = 'new'),
    'projects',             (SELECT COUNT(*) FROM projects),
    'active_services',      (SELECT COUNT(*) FROM services WHERE active = TRUE),
    'active_team_members',  (SELECT COUNT(*) FROM team_members WHERE active = TRUE),
    'newsletter_subscribers',(SELECT COUNT(*) FROM newsletter_subscribers WHERE subscribed = TRUE),
    'job_postings',         (SELECT COUNT(*) FROM job_postings WHERE active = TRUE),
    'testimonials',         (SELECT COUNT(*) FROM testimonials)
  ) INTO v_result;

  RETURN v_result;
END;
$$;


-- ============================================================
-- 11. RLS POLICIES — ADMIN FULL ACCESS
-- High & low admins can SELECT/INSERT/UPDATE/DELETE
-- on all managed tables (high_admin also gets DELETE on
-- sensitive tables; low_admin is read + status updates only)
-- ============================================================

-- Helper: allow authenticated admin read on sensitive tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'service_inquiries', 'job_applications',
    'newsletter_subscribers', 'audit_logs', 'analytics'
  ]
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Admin read access" ON %I;
      CREATE POLICY "Admin read access" ON %I
        FOR SELECT
        USING (is_admin());
    ', tbl, tbl);
  END LOOP;
END;
$$;

-- High admin full write access on all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'contacts', 'service_inquiries', 'projects', 'team_members',
    'services', 'testimonials', 'job_applications', 'job_postings',
    'newsletter_subscribers', 'settings', 'analytics'
  ]  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "High admin full access" ON %I;
      CREATE POLICY "High admin full access" ON %I
        FOR ALL
        USING (is_high_admin())
        WITH CHECK (is_high_admin());
    ', tbl, tbl);
  END LOOP;
END;
$$;

-- Low admin: write access limited to projects, services, team, testimonials, job_postings
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'projects', 'team_members', 'services', 'testimonials', 'job_postings'
  ]
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Low admin write access" ON %I;
      CREATE POLICY "Low admin write access" ON %I
        FOR ALL
        USING (is_admin())
        WITH CHECK (is_admin());
    ', tbl, tbl);
  END LOOP;
END;
$$;


-- ============================================================
-- 12. CREATE ADMIN USERS & ASSIGN ROLES
--
-- NOTE: Supabase does NOT allow inserting directly into
-- auth.users in production via SQL safely. The standard
-- approach is to call supabase.auth.admin.createUser()
-- via the Admin API / dashboard. The block below uses
-- the internal Supabase helper available in the SQL editor
-- when executed as the postgres superuser (service_role).
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================

DO $$
DECLARE
  v_high_admin_id UUID;
  v_low_admin_id  UUID;
BEGIN

  -- ── High Admin ──────────────────────────────────────────
  -- Check if the user already exists
  SELECT id INTO v_high_admin_id
  FROM auth.users
  WHERE email = 'pradeepselvi126@gmail.com';

  IF v_high_admin_id IS NULL THEN
    -- Create user via Supabase internal helper
    v_high_admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      v_high_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'pradeepselvi126@gmail.com',
      crypt('PRk@123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Pradeep Selvi","role":"high_admin"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );

    -- Create identity record (required for email login)
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_high_admin_id::TEXT,
      v_high_admin_id,
      jsonb_build_object('sub', v_high_admin_id::TEXT, 'email', 'pradeepselvi126@gmail.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Assign high admin role
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_high_admin_id, 'pradeepselvi126@gmail.com', 'high')
  ON CONFLICT (id) DO UPDATE
    SET role = 'high', updated_at = NOW();


  -- ── Low Admin ───────────────────────────────────────────
  SELECT id INTO v_low_admin_id
  FROM auth.users
  WHERE email = 'idnumberselect@gmail.com';

  IF v_low_admin_id IS NULL THEN
    v_low_admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      v_low_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'idnumberselect@gmail.com',
      crypt('IDn@123456', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"ID Number Select","role":"low_admin"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_low_admin_id::TEXT,
      v_low_admin_id,
      jsonb_build_object('sub', v_low_admin_id::TEXT, 'email', 'idnumberselect@gmail.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- Assign low admin role
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_low_admin_id, 'idnumberselect@gmail.com', 'low')
  ON CONFLICT (id) DO UPDATE
    SET role = 'low', updated_at = NOW();

END;
$$;


-- ============================================================
-- VERIFICATION QUERIES (run separately to confirm setup)
-- ============================================================

-- Check both admins exist
-- SELECT id, email, created_at FROM auth.users
-- WHERE email IN ('pradeepselvi126@gmail.com', 'idnumberselect@gmail.com');

-- Check role assignments
-- SELECT ap.email, ap.role
-- FROM admin_profiles ap
-- JOIN auth.users au ON ap.id = au.id;

-- Check your current role (run when logged in)
-- SELECT get_my_role();
-- SELECT is_high_admin();
-- SELECT is_admin();

-- Dashboard stats (run when logged in as any admin)
-- SELECT get_dashboard_stats();
