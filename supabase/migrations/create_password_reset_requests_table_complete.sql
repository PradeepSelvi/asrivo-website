-- ==============================================================================
-- MIGRATION: Password Reset Requests Table & RLS Policies
-- File: supabase/migrations/create_password_reset_requests_table_complete.sql
-- Run this script in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create table if it doesn't already exist
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

-- 2. Add updated_at column safely if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'password_reset_requests' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.password_reset_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 3. Create performance and audit indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_email ON public.password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON public.password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON public.password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_requested_at ON public.password_reset_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_expires_at ON public.password_reset_requests(expires_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent naming conflicts
DROP POLICY IF EXISTS "Admin and service role can read password reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "System can insert password reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "System can update password reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Service role full access on password_reset_requests" ON public.password_reset_requests;

-- 6. Read Policy: Only service role and verified administrators can inspect logs
CREATE POLICY "Admin and service role can read password reset requests"
  ON public.password_reset_requests
  FOR SELECT
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- 7. Insert Policy: System API routes and public forgot-password forms can record requests
CREATE POLICY "System can insert password reset requests"
  ON public.password_reset_requests
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- 8. Update Policy: Verified users and service role can record completions
CREATE POLICY "System can update password reset requests"
  ON public.password_reset_requests
  FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 9. Trigger for updated_at maintenance
CREATE OR REPLACE FUNCTION public.update_password_reset_requests_updated_at()
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
  EXECUTE FUNCTION public.update_password_reset_requests_updated_at();

-- 10. Table permissions
GRANT SELECT, INSERT ON public.password_reset_requests TO anon;
GRANT ALL ON public.password_reset_requests TO authenticated, service_role;

COMMENT ON TABLE public.password_reset_requests IS 'Audit trail, tracking, and rate-limiting for user password reset requests';

