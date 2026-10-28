-- ============================================================
-- BLOCK 3: Link Auth Users to admin_profiles (F-011 / CWE-798 Cleaned)
-- ============================================================
-- NOTE: Never seed raw auth.users passwords in SQL files.
-- Administrators should be created in Supabase Dashboard (Auth -> Users -> Add User)
-- with unique, secure credentials, then linked into admin_profiles below.

-- Assign High Admin Role
INSERT INTO public.admin_profiles (id, email, role)
SELECT id, email, 'high'
FROM auth.users
WHERE email = 'pradeepselvi126@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'high', updated_at = NOW();

-- Assign Low Admin Role
INSERT INTO public.admin_profiles (id, email, role)
SELECT id, email, 'low'
FROM auth.users
WHERE email = 'idnumberselect@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'low', updated_at = NOW();

-- Confirm verification
SELECT id, email, role FROM public.admin_profiles;
