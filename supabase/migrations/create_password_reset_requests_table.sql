-- ============================================================
-- PASSWORD RESET REQUESTS AND AUDIT SCHEMA
-- Tracks password reset requests, rate limiting, and completion status
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying and lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email ON public.password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON public.password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON public.password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_requested_at ON public.password_reset_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_expires_at ON public.password_reset_requests(expires_at);

-- Row Level Security
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "Service role full access on password_reset_requests" ON public.password_reset_requests;
CREATE POLICY "Service role full access on password_reset_requests"
  ON public.password_reset_requests
  FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup procedure for requests older than 30 days
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

-- Table comment
COMMENT ON TABLE public.password_reset_requests IS 'Audit trail and tracking for password reset flows';
