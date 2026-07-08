-- Must return 2 rows, one high and one low
SELECT ap.id, ap.email, ap.role, au.email_confirmed_at
FROM admin_profiles ap
JOIN auth.users au ON ap.id = au.id;
