-- Create audit_logs table to track admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only verified administrators can view audit logs (F-031 / CWE-863)
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Enable read for admins only" ON audit_logs;
CREATE POLICY "Enable read for admins only"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Restrict audit insertion to trusted server operations (service_role); drop public/authenticated INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

REVOKE ALL ON audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Add comment
COMMENT ON TABLE audit_logs IS 'Tracks all administrative actions for security and compliance';
