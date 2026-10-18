-- ============================================
-- CREATE JOB POSTINGS TABLE
-- ============================================
-- This creates the job_postings table for managing career opportunities
-- Job postings created in admin will appear on the careers page

-- Drop table if exists (be careful in production!)
DROP TABLE IF EXISTS public.job_postings CASCADE;

-- Create job_postings table
CREATE TABLE public.job_postings (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  requirements TEXT[], -- Array of requirement strings
  responsibilities TEXT[], -- Array of responsibility strings
  salary_range TEXT,
  location TEXT,
  employment_type TEXT, -- full-time, part-time, contract, freelance, internship
  experience_level TEXT, -- entry, mid, senior, lead
  department TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_job_postings_active ON public.job_postings(active);
CREATE INDEX idx_job_postings_slug ON public.job_postings(slug);
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (only active jobs)
CREATE POLICY "Active job postings are viewable by everyone"
  ON public.job_postings
  FOR SELECT
  USING (active = true);

-- Create policies for authenticated users to manage all jobs
CREATE POLICY "Authenticated users can view all job postings"
  ON public.job_postings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job postings"
  ON public.job_postings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job postings"
  ON public.job_postings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job postings"
  ON public.job_postings
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.job_postings IS 'Job postings and career opportunities';
COMMENT ON COLUMN public.job_postings.title IS 'Job title (e.g., Senior Full Stack Developer)';
COMMENT ON COLUMN public.job_postings.slug IS 'URL-friendly slug for the job posting';
COMMENT ON COLUMN public.job_postings.description IS 'Detailed job description';
COMMENT ON COLUMN public.job_postings.requirements IS 'Array of job requirements';
COMMENT ON COLUMN public.job_postings.responsibilities IS 'Array of job responsibilities';
COMMENT ON COLUMN public.job_postings.salary_range IS 'Salary range (e.g., $80k-$120k, ₹10L-₹15L)';
COMMENT ON COLUMN public.job_postings.location IS 'Job location (e.g., Remote, Bangalore, Hybrid)';
COMMENT ON COLUMN public.job_postings.employment_type IS 'Type of employment (full-time, part-time, contract, etc.)';
COMMENT ON COLUMN public.job_postings.experience_level IS 'Experience level required (entry, mid, senior, lead)';
COMMENT ON COLUMN public.job_postings.active IS 'Whether the job posting is currently active/visible';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample job postings (only if table is empty)
DO $$
BEGIN
  -- Check if table is empty before inserting samples
  IF NOT EXISTS (SELECT 1 FROM public.job_postings LIMIT 1) THEN
    INSERT INTO public.job_postings (
      title,
      slug,
      description,
      requirements,
      responsibilities,
      salary_range,
      location,
      employment_type,
      experience_level,
      department,
      active
    ) VALUES
      (
        'Senior Full Stack Developer',
        'senior-full-stack-developer',
        'We are looking for an experienced Full Stack Developer to join our growing team. You will work on cutting-edge web applications using modern technologies like React, Node.js, and cloud platforms.',
        ARRAY[
          '5+ years of experience in full-stack web development',
          'Strong proficiency in React, Next.js, and TypeScript',
          'Experience with Node.js, Express, and RESTful APIs',
          'Familiarity with databases (PostgreSQL, MongoDB)',
          'Experience with cloud platforms (AWS, Azure, or GCP)',
          'Strong problem-solving and communication skills'
        ],
        ARRAY[
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Write clean, maintainable code',
          'Participate in code reviews',
          'Mentor junior developers'
        ],
        '₹12L - ₹18L per year',
        'Remote / Bangalore',
        'Full-Time',
        'Senior',
        'Engineering',
        true
      ),
      (
        'UI/UX Designer',
        'ui-ux-designer',
        'Join our design team to create beautiful and intuitive user experiences. You will work closely with developers and product managers to bring ideas to life.',
        ARRAY[
          '3+ years of experience in UI/UX design',
          'Proficiency in Figma, Adobe XD, or Sketch',
          'Strong portfolio demonstrating design skills',
          'Understanding of user-centered design principles',
          'Experience with prototyping and wireframing',
          'Good communication and collaboration skills'
        ],
        ARRAY[
          'Design user interfaces for web and mobile applications',
          'Create wireframes, prototypes, and mockups',
          'Conduct user research and usability testing',
          'Collaborate with developers to implement designs',
          'Maintain design systems and style guides'
        ],
        '₹6L - ₹12L per year',
        'Hybrid - Bangalore',
        'Full-Time',
        'Mid',
        'Design',
        true
      ),
      (
        'DevOps Engineer',
        'devops-engineer',
        'We need a skilled DevOps Engineer to help us build and maintain our cloud infrastructure, CI/CD pipelines, and deployment processes.',
        ARRAY[
          '4+ years of experience in DevOps or Site Reliability Engineering',
          'Strong knowledge of AWS or Azure',
          'Experience with Docker, Kubernetes, and containerization',
          'Proficiency in Infrastructure as Code (Terraform, CloudFormation)',
          'Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
          'Strong scripting skills (Bash, Python)'
        ],
        ARRAY[
          'Design and maintain cloud infrastructure',
          'Build and optimize CI/CD pipelines',
          'Monitor system performance and reliability',
          'Automate deployment and scaling processes',
          'Implement security best practices'
        ],
        '₹10L - ₹16L per year',
        'Remote',
        'Full-Time',
        'Senior',
        'Engineering',
        true
      );
    
    RAISE NOTICE '✓ Sample job postings inserted: 3';
  ELSE
    RAISE NOTICE '✓ Table already contains data, skipping sample inserts';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ JOB POSTINGS TABLE CREATED SUCCESSFULLY!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Database Summary:';
  RAISE NOTICE '  ✓ Table created: job_postings';
  RAISE NOTICE '  ✓ Sample jobs added: 3';
  RAISE NOTICE '  ✓ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '  ✓ Public can view active jobs only';
  RAISE NOTICE '  ✓ Authenticated users can manage all jobs';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '  1. Visit /careers to see job postings';
  RAISE NOTICE '  2. Go to /admin/jobs to manage postings';
  RAISE NOTICE '  3. Create new jobs or edit existing ones';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;
