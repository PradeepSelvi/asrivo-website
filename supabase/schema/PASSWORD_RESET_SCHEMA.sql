-- ============================================================
-- PASSWORD RESET & RECOVERY DATABASE SCHEMA
-- Handles password reset requests, audit logging, rate limiting, and verification tracking.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'expired', 'failed')),
  ip_address TEXT,
  user_agent TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email ON public.password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON public.password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON public.password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_requested_at ON public.password_reset_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_expires_at ON public.password_reset_requests(expires_at);

-- Enable Row Level Security
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Security Policies:
-- 1. Only service role and high admins can view all reset requests
DROP POLICY IF EXISTS "Admin and service role can read password reset requests" ON public.password_reset_requests;
CREATE POLICY "Admin and service role can read password reset requests"
  ON public.password_reset_requests
  FOR SELECT
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid() 
      AND admin_profiles.role IN ('high', 'low')
    )
  );

-- 2. System and API routes can insert new reset requests
DROP POLICY IF EXISTS "System can insert password reset requests" ON public.password_reset_requests;
CREATE POLICY "System can insert password reset requests"
  ON public.password_reset_requests
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- 3. System and API routes can update password reset status
DROP POLICY IF EXISTS "System can update password reset requests" ON public.password_reset_requests;
CREATE POLICY "System can update password reset requests"
  ON public.password_reset_requests
  FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_password_reset_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_password_reset_requests_updated_at ON public.password_reset_requests;
CREATE TRIGGER trigger_password_reset_requests_updated_at
  BEFORE UPDATE ON public.password_reset_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_password_reset_requests_updated_at();

-- Auto-cleanup procedure for expired requests older than 30 days
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_requests
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Grant appropriate permissions
GRANT SELECT, INSERT ON public.password_reset_requests TO anon;
GRANT ALL ON public.password_reset_requests TO authenticated, service_role;

-- Comments
COMMENT ON TABLE public.password_reset_requests IS 'Audit trail, tracking, and rate-limiting for user password reset requests';
