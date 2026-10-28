-- Migration: Harden testimonials RLS against low-admin unauthorized creation and deletion (Finding F-035 / CWE-863)
-- Description: Replaces broad low-admin FOR ALL policy with an UPDATE-only policy for permitted editor
-- changes (editing content, toggling verification, reordering).
-- Enforces is_high_admin() for INSERT and DELETE operations.

-- 1. Enable Row Level Security (idempotent)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 2. Ensure non-recursive role helpers are present with search_path secured
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

-- 3. Drop all previous permissive or conflicting policies on testimonials
DROP POLICY IF EXISTS "Low admin write access" ON public.testimonials;
DROP POLICY IF EXISTS "Low admin update access" ON public.testimonials;
DROP POLICY IF EXISTS "High admin full access" ON public.testimonials;
DROP POLICY IF EXISTS "High admin insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "High admin delete testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Enable read for all users" ON public.testimonials;
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
DROP POLICY IF EXISTS "Block all writes from clients" ON public.testimonials;
DROP POLICY IF EXISTS "Block all updates from clients" ON public.testimonials;
DROP POLICY IF EXISTS "Block all deletes from clients" ON public.testimonials;
DROP POLICY IF EXISTS "Block all writes from clients testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Block all updates from clients testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Block all deletes from clients testimonials" ON public.testimonials;

-- 4. Policy: Public read access for testimonials
CREATE POLICY "Enable read for all users"
  ON public.testimonials
  FOR SELECT
  TO public
  USING (true);

-- 5. Policy: High-admin full access (INSERT, UPDATE, DELETE)
CREATE POLICY "High admin full access"
  ON public.testimonials
  FOR ALL
  TO authenticated
  USING (public.is_high_admin())
  WITH CHECK (public.is_high_admin());

-- 6. Policy: Low-admin UPDATE only (allows editors to edit content, verify, and reorder)
CREATE POLICY "Low admin update access"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Grant least-privilege table permissions
REVOKE ALL ON public.testimonials FROM anon;
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
