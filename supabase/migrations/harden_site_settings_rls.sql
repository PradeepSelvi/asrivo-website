-- Migration: Harden site_settings RLS against low-admin unauthorized modification (Finding F-033 / CWE-863)
-- Description: Replaces permissive admin write policy with high-admin check implemented
-- through a non-recursive SECURITY DEFINER role helper.
-- Enforces high-admin role on INSERT, UPDATE, and DELETE, while maintaining public SELECT.
-- Works seamlessly whether site_settings uses (setting_key, setting_value) or (category, key, value).

-- 1. Enable Row Level Security (idempotent)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. Non-recursive, SECURITY DEFINER helper function to verify high-admin role
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

-- 3. Drop all previous permissive or conflicting policies
DROP POLICY IF EXISTS "Allow public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admins to manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow authenticated admins to modify settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to delete settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow high admins to manage settings" ON public.site_settings;

-- 4. Policy: Public read access for site settings (header, footer, metadata)
CREATE POLICY "Allow public read access to site settings"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- 5. Policy: High-admin only INSERT
CREATE POLICY "Allow high admins to insert settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_high_admin());

-- 6. Policy: High-admin only UPDATE
CREATE POLICY "Allow high admins to update settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_high_admin())
  WITH CHECK (public.is_high_admin());

-- 7. Policy: High-admin only DELETE
CREATE POLICY "Allow high admins to delete settings"
  ON public.site_settings
  FOR DELETE
  TO authenticated
  USING (public.is_high_admin());

-- 8. Least-privilege table grants
REVOKE ALL ON public.site_settings FROM anon;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
