-- Migration: Harden reorder_items RPC against anonymous authorization bypass (Finding F-034 / CWE-862)
-- Description: Enforces administrator authorization check (is_admin()), strictly allowlists
-- content tables ('projects', 'team_members', 'services', 'testimonials', 'page_content'),
-- sets secure search_path, and revokes PUBLIC/anon execution grants.

-- 1. Ensure is_admin() role helper is present and secure
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

-- 2. Define hardened reorder_items function
CREATE OR REPLACE FUNCTION public.reorder_items(
  p_table TEXT,
  p_id    BIGINT,
  p_new_order INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_order INTEGER;
BEGIN
  -- Authorization check: caller must be an authenticated administrator
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: administrator access required to reorder items';
  END IF;

  -- Input validation and table allowlist
  IF p_table NOT IN ('projects', 'team_members', 'services', 'testimonials', 'page_content') THEN
    RAISE EXCEPTION 'Invalid table: % is not a reorderable content table', p_table;
  END IF;

  IF p_id IS NULL OR p_new_order IS NULL OR p_new_order < 0 THEN
    RAISE EXCEPTION 'Invalid parameters: item ID and non-negative new order are required';
  END IF;

  -- Query existing display_order safely using parameterized query
  EXECUTE format('SELECT display_order FROM %I WHERE id = $1', p_table)
  INTO v_old_order
  USING p_id;

  IF v_old_order IS NULL THEN
    RETURN;
  END IF;

  -- Shift neighboring records to maintain sequence
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

  -- Set new order on target item
  EXECUTE format('UPDATE %I SET display_order = $1 WHERE id = $2', p_table)
  USING p_new_order, p_id;
END;
$$;

-- 3. Revoke anonymous RPC execution and grant only to authenticated users
REVOKE EXECUTE ON FUNCTION public.reorder_items(TEXT, BIGINT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reorder_items(TEXT, BIGINT, INTEGER) TO authenticated;
