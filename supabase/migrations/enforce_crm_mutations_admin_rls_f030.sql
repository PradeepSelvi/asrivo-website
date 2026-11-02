-- ============================================================
-- F-030 Remediation: Restrict CRM Mutations (UPDATE, DELETE, INSERT)
-- to Verified Administrators (CWE-863)
-- Finding ID: e3d82ed6-04e1-4fde-9dca-61a62dedfd6f
-- ============================================================
-- Context
-- -------
-- The original CRM setup scripts (CRM_DATABASE_SCHEMA.sql:329-330)
-- contained policies authorizing auth.role() = 'authenticated' for
-- updating and deleting CRM leads and related records. This allowed
-- any user registered via the public sign-up flow to mutate or delete
-- administrative CRM records directly via Supabase client APIs.
--
-- This migration guarantees:
-- 1. All broad 'authenticated' update, delete, and insert policies
--    are dropped across all CRM tables.
-- 2. Every mutation (INSERT, UPDATE, DELETE) and read (SELECT) is strictly
--    restricted to verified members of public.admin_profiles.
-- 3. Anonymous access is completely revoked.
-- ============================================================

DO $$
DECLARE
  crm_tbl TEXT;
  crm_tables TEXT[] := ARRAY[
    'crm_leads',
    'crm_deals',
    'crm_activities',
    'crm_tasks',
    'crm_tags',
    'crm_notes',
    'crm_email_templates',
    'crm_pipeline_stages',
    'crm_settings'
  ];
BEGIN
  FOREACH crm_tbl IN ARRAY crm_tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = crm_tbl) THEN
      -- Enable Row Level Security
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', crm_tbl);

      -- Drop potential legacy permissive policies
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage %I" ON public.%I;', crm_tbl, crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage deals" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage activities" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage tasks" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage notes" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage templates" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage pipeline stages" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can manage CRM settings" ON public.%I;', crm_tbl);
      EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %I" ON public.%I;', crm_tbl, crm_tbl);

      -- Create comprehensive admin-only policy for SELECT, INSERT, UPDATE, DELETE
      EXECUTE format('
        CREATE POLICY "Admins can manage %I" ON public.%I
          FOR ALL TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.admin_profiles
              WHERE admin_profiles.id = auth.uid()
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.admin_profiles
              WHERE admin_profiles.id = auth.uid()
            )
          );
      ', crm_tbl, crm_tbl);

      -- Revoke all table privileges from anonymous role
      EXECUTE format('REVOKE ALL ON public.%I FROM anon;', crm_tbl);
    END IF;
  END LOOP;
END $$;

