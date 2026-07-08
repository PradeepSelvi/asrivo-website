DO $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'pradeepselvi126@gmail.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'pradeepselvi126@gmail.com', crypt('PRk@123456', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Pradeep Selvi"}'::jsonb,
      'authenticated', 'authenticated', NOW(), NOW()
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_uid::TEXT, v_uid,
      jsonb_build_object('sub', v_uid::TEXT, 'email', 'pradeepselvi126@gmail.com'),
      'email', NOW(), NOW(), NOW()
    );
  END IF;
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_uid, 'pradeepselvi126@gmail.com', 'high')
  ON CONFLICT (id) DO UPDATE SET role = 'high', updated_at = NOW();
END;
$$;

DO $$
DECLARE v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'idnumberselect@gmail.com';
  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
      v_uid, '00000000-0000-0000-0000-000000000000',
      'idnumberselect@gmail.com', crypt('IDn@123456', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"ID Number Select"}'::jsonb,
      'authenticated', 'authenticated', NOW(), NOW()
    );
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), v_uid::TEXT, v_uid,
      jsonb_build_object('sub', v_uid::TEXT, 'email', 'idnumberselect@gmail.com'),
      'email', NOW(), NOW(), NOW()
    );
  END IF;
  INSERT INTO admin_profiles (id, email, role)
  VALUES (v_uid, 'idnumberselect@gmail.com', 'low')
  ON CONFLICT (id) DO UPDATE SET role = 'low', updated_at = NOW();
END;
$$;

SELECT id, email, role FROM admin_profiles;
