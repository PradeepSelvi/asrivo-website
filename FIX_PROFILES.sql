-- STEP 1: Delete the broken manually-inserted users
-- (they were created by raw SQL which skips auth triggers)

DELETE FROM auth.users 
WHERE email IN ('pradeepselvi126@gmail.com', 'idnumberselect@gmail.com');

-- Confirm they are gone
SELECT id, email FROM auth.users 
WHERE email IN ('pradeepselvi126@gmail.com', 'idnumberselect@gmail.com');
