-- Migration: Harden content tables RLS against low-admin unauthorized creation and deletion (Finding F-036 / CWE-863)
-- Description: Replaces broad low-admin FOR ALL policy with UPDATE-only policies across all content
-- tables ('projects', 'team_members', 'services', 'testimonials', 'job_postings').
-- Restricts INSERT and DELETE strictly to is_high_admin().

-- 1. Ensure non-recursive role helpers are present with search_path secured
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid()
  );
$$;

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

-- 2. Apply hardened RLS policies across all content tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'projects', 'team_members', 'services', 'testimonials', 'job_postings'
  ]
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Drop broad or conflicting policies
    EXECUTE format('DROP POLICY IF EXISTS "Low admin write access" ON public.%I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Low admin update access" ON public.%I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "High admin full access" ON public.%I;', tbl);

    -- Policy: High admins have full access (INSERT, UPDATE, DELETE)
    EXECUTE format('
      CREATE POLICY "High admin full access" ON public.%I
        FOR ALL
        TO authenticated
        USING (public.is_high_admin())
        WITH CHECK (public.is_high_admin());
    ', tbl);

    -- Policy: Low admins (editors) have UPDATE access only (edit existing content, toggle status, reorder)
    EXECUTE format('
      CREATE POLICY "Low admin update access" ON public.%I
        FOR UPDATE
        TO authenticated
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    ', tbl);
  END LOOP;
END;
$$;
