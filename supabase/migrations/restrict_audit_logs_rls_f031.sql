-- ============================================================
-- F-031 Remediation: Restrict audit_logs Access & Prevent CSV Injection (CWE-863 / CWE-1236)
-- Finding ID: 76085305-7ec1-4da8-9e80-13e9c3fbe836
-- ============================================================
-- Context
-- -------
-- Previously, create_audit_logs_table.sql granted authenticated users
-- permission to insert and view all audit log records. This allowed
-- non-administrator authenticated callers to forge audit logs or insert
-- malicious formula elements (e.g., =CMD|' /c calc'!A0, +SUM(...))
-- into audit log fields (user_email, action, resource_type, ip_address),
-- which would be executed when an administrator exports logs to CSV.
--
-- This migration guarantees:
-- 1. RLS is enabled on audit_logs.
-- 2. Client-side INSERT permissions for authenticated/anon are revoked.
--    Audit logging is restricted to trusted server-side operations (service_role).
-- 3. SELECT access is strictly restricted to verified administrators (admin_profiles).
-- 4. All privileges are revoked from anon.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    -- 1. Enable RLS
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    -- 2. Drop obsolete and permissive policies
    DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.audit_logs;
    DROP POLICY IF EXISTS "Enable read for admins only" ON public.audit_logs;
    DROP POLICY IF EXISTS "Admin read access" ON public.audit_logs;

    -- 3. Restrict SELECT strictly to verified administrators
    CREATE POLICY "Enable read for admins only" ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_profiles
          WHERE admin_profiles.id = auth.uid()
        )
      );

    -- 4. Revoke client-side mutations (service_role key bypasses RLS for server-side logging)
    REVOKE ALL ON public.audit_logs FROM anon;
    REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated;
    GRANT SELECT ON public.audit_logs TO authenticated;
  END IF;
END $$;

