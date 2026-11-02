-- ============================================================
-- F-029 Remediation: Strict Admin RLS on CRM Tables & Audit Logs (CWE-863)
-- Finding ID: 195b1a49-57f1-42c1-a19a-689d764904b2
-- ============================================================
-- Context
-- -------
-- Previously, CRM tables and audit_logs permitted the shared
-- 'authenticated' database role, allowing any customer who registered
-- via public signup to directly read and mutate sensitive CRM records
-- (leads, deals, activities, tasks, notes, templates, settings) and
-- read audit log row snapshots via the Supabase Data API.
--
-- This migration guarantees that:
-- 1. All permissive 'authenticated' policies are dropped.
-- 2. RLS is enabled on all CRM tables and audit_logs.
-- 3. Only verified members of public.admin_profiles can read/write CRM records and audit logs.
-- 4. All privileges are revoked from the anon role.
-- ============================================================

-- 1. CRM LEADS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_leads') THEN
    ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.crm_leads;
    DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.crm_leads;
    DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.crm_leads;
    DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.crm_leads;
    DROP POLICY IF EXISTS "Admins can manage crm_leads" ON public.crm_leads;

    CREATE POLICY "Admins can manage crm_leads" ON public.crm_leads
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_leads FROM anon;
  END IF;
END $$;

-- 2. CRM DEALS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_deals') THEN
    ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.crm_deals;
    DROP POLICY IF EXISTS "Admins can manage crm_deals" ON public.crm_deals;

    CREATE POLICY "Admins can manage crm_deals" ON public.crm_deals
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_deals FROM anon;
  END IF;
END $$;

-- 3. CRM ACTIVITIES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_activities') THEN
    ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage activities" ON public.crm_activities;
    DROP POLICY IF EXISTS "Admins can manage crm_activities" ON public.crm_activities;

    CREATE POLICY "Admins can manage crm_activities" ON public.crm_activities
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_activities FROM anon;
  END IF;
END $$;

-- 4. CRM TASKS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_tasks') THEN
    ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.crm_tasks;
    DROP POLICY IF EXISTS "Admins can manage crm_tasks" ON public.crm_tasks;

    CREATE POLICY "Admins can manage crm_tasks" ON public.crm_tasks
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_tasks FROM anon;
  END IF;
END $$;

-- 5. CRM TAGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_tags') THEN
    ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.crm_tags;
    DROP POLICY IF EXISTS "Admins can manage crm_tags" ON public.crm_tags;

    CREATE POLICY "Admins can manage crm_tags" ON public.crm_tags
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_tags FROM anon;
  END IF;
END $$;

-- 6. CRM NOTES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_notes') THEN
    ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage notes" ON public.crm_notes;
    DROP POLICY IF EXISTS "Admins can manage crm_notes" ON public.crm_notes;

    CREATE POLICY "Admins can manage crm_notes" ON public.crm_notes
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_notes FROM anon;
  END IF;
END $$;

-- 7. CRM EMAIL TEMPLATES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_email_templates') THEN
    ALTER TABLE public.crm_email_templates ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage templates" ON public.crm_email_templates;
    DROP POLICY IF EXISTS "Admins can manage crm_email_templates" ON public.crm_email_templates;

    CREATE POLICY "Admins can manage crm_email_templates" ON public.crm_email_templates
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_email_templates FROM anon;
  END IF;
END $$;

-- 8. CRM PIPELINE STAGES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_pipeline_stages') THEN
    ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage pipeline stages" ON public.crm_pipeline_stages;
    DROP POLICY IF EXISTS "Admins can manage crm_pipeline_stages" ON public.crm_pipeline_stages;

    CREATE POLICY "Admins can manage crm_pipeline_stages" ON public.crm_pipeline_stages
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_pipeline_stages FROM anon;
  END IF;
END $$;

-- 9. CRM SETTINGS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_settings') THEN
    ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can manage CRM settings" ON public.crm_settings;
    DROP POLICY IF EXISTS "Admins can manage crm_settings" ON public.crm_settings;

    CREATE POLICY "Admins can manage crm_settings" ON public.crm_settings
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.crm_settings FROM anon;
  END IF;
END $$;

-- 10. AUDIT LOGS (Lock down row snapshots to admins only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.audit_logs;
    DROP POLICY IF EXISTS "Enable read for admins only" ON public.audit_logs;
    DROP POLICY IF EXISTS "Admin read access" ON public.audit_logs;

    CREATE POLICY "Enable read for admins only" ON public.audit_logs
      FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE admin_profiles.id = auth.uid()));

    REVOKE ALL ON public.audit_logs FROM anon;
  END IF;
END $$;

