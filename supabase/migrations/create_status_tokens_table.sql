-- ============================================
-- SECURE STATUS LOOKUP TOKENS
-- Issue #15: Email OTP for inquiry/complaint status
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_tokens (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_tokens_token ON public.status_tokens(token);
CREATE INDEX idx_status_tokens_email ON public.status_tokens(email);
CREATE INDEX idx_status_tokens_expires ON public.status_tokens(expires_at);

-- Only service role can write; no public access
ALTER TABLE public.status_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.status_tokens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: delete expired tokens older than 1 hour
CREATE OR REPLACE FUNCTION cleanup_expired_status_tokens()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.status_tokens
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;
