-- Get the UUIDs first, then insert
INSERT INTO admin_profiles (id, email, role)
SELECT id, email, 'high'
FROM auth.users
WHERE email = 'pradeepselvi126@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'high', updated_at = NOW();

INSERT INTO admin_profiles (id, email, role)
SELECT id, email, 'low'
FROM auth.users
WHERE email = 'idnumberselect@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'low', updated_at = NOW();

-- Verify both are in
SELECT ap.id, ap.email, ap.role 
FROM admin_profiles ap;
