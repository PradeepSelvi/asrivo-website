-- Create job_applications table (drop and recreate for clean slate)
DROP TABLE IF EXISTS public.job_applications CASCADE;

CREATE TABLE public.job_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position_id BIGINT REFERENCES public.job_postings(id) ON DELETE SET NULL,
  job_title TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_position_id ON public.job_applications(position_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can view all applications" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON public.job_applications;

-- RLS Policies
-- Anyone can insert (submit application)
CREATE POLICY "Anyone can submit job applications"
  ON public.job_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users (admins) can view all applications
CREATE POLICY "Authenticated users can view all applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can update applications
CREATE POLICY "Authenticated users can update applications"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can delete applications
CREATE POLICY "Authenticated users can delete applications"
  ON public.job_applications
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_updated_at();

-- Grant permissions
GRANT ALL ON public.job_applications TO authenticated;
GRANT INSERT ON public.job_applications TO anon;
GRANT SELECT ON public.job_applications TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.job_applications_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.job_applications_id_seq TO anon;
