ALTER TABLE audit_logs ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

CREATE TABLE IF NOT EXISTS admin_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own profile" ON admin_profiles;
CREATE POLICY "Admins can read their own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);
