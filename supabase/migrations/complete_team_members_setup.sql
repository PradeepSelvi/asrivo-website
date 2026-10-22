-- ============================================
-- COMPLETE TEAM MEMBERS SETUP
-- ============================================
-- This file creates the table AND inserts all data
-- Run this single file in Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE TABLE
-- ============================================

-- Drop table if exists (be careful in production!)
DROP TABLE IF EXISTS public.team_members CASCADE;

-- Create team_members table
CREATE TABLE public.team_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_team_members_active ON public.team_members(active);
CREATE INDEX idx_team_members_featured ON public.team_members(featured);
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Team members are viewable by everyone"
  ON public.team_members
  FOR SELECT
  USING (true);

-- Create policies for authenticated users to manage
CREATE POLICY "Authenticated users can insert team members"
  ON public.team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
  ON public.team_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete team members"
  ON public.team_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STEP 2: INSERT MANAGEMENT TEAM
-- ============================================

INSERT INTO public.team_members (
  name, 
  position, 
  bio, 
  image_url, 
  email, 
  social_links, 
  featured, 
  active, 
  display_order
) VALUES
  -- Aswin K A
  (
    'Aswin K A',
    'Management Head & HR Manager',
    'Founder managing HR, administration, finance, and operations with strategic leadership and precision',
    '/team/aswin.jpeg',
    'kaaswin4503@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/aswin-k-a-77581a249", "github": "https://github.com/Aswin4532003"}'::jsonb,
    true,
    true,
    1
  ),
  
  -- Siranjeevi B.U
  (
    'Siranjeevi B.U',
    'Digital Marketing (SEO, SMO)',
    'Leading brand growth through expert SEO, SMO strategies, and organizational excellence in talent and HR management.',
    '/team/siranjeevi.jpeg',
    'siranjeevi.uthaman@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/siranjeevi-bu/", "github": "https://github.com/siranjj"}'::jsonb,
    true,
    true,
    2
  ),
  
  -- M.Pradeep Kumar
  (
    'M.Pradeep Kumar.DCSE',
    'Legal & Chief Technical Officer',
    'Ensuring regulatory compliance, managing legal risks, protecting company integrity and ethical standards.',
    '/team/pradeepkumar.jpeg',
    'pradeepselvi126@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/pradeep-kumar-3650982a9", "github": "https://github.com/Selvipr"}'::jsonb,
    true,
    true,
    3
  ),
  
  -- Sargunan J.S
  (
    'Sargunan J.S',
    'Chief Operating Officer',
    'Strategic operations leader driving efficiency, growth, performance, and scalable business transformation globally.',
    '/team/sargunan.jpeg',
    'sargunanitl01@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/sargunan-j-s-28915b2a9/", "github": "https://github.com/Sargunan-js"}'::jsonb,
    true,
    true,
    4
  ),
  
  -- Krishan Kumar B.K
  (
    'Krishan Kumar B.K',
    'Project Manager',
    'Frontend Developer & Project Manager driving seamless delivery and team coordination.',
    '/team/KRISHNAKUMAR.jpeg',
    'Krishnakumarbkcse@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/krishan-kumar-b-k/", "github": "https://github.com/krishankumar"}'::jsonb,
    true,
    true,
    5
  );

-- ============================================
-- STEP 3: INSERT DEVELOPMENT TEAM
-- ============================================

INSERT INTO public.team_members (
  name, 
  position, 
  bio, 
  image_url, 
  email, 
  social_links, 
  featured, 
  active, 
  display_order
) VALUES
  -- Sivaganesh.J
  (
    'SIVAGANESH.J',
    'Team Lead, Database, Backend',
    'Leading the team, backend and database optimization initiatives for robust, scalable application infrastructure.',
    '/team/sivaganesh j.jpeg',
    'sivaganesh73acm@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/sivaganesh-j", "github": "https://github.com/sivaganeshj"}'::jsonb,
    true,
    true,
    10
  ),
  
  -- Karthik Rajalee.S
  (
    'KARTHIK RAJALEE.S',
    'Cloud Service Developer, SOC',
    'Designing secure, scalable cloud solutions and implementing advanced Security Operations Center protocols.',
    '/team/karthik rajalee.jpeg',
    'vel759894@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/karthik-saravanavel-18852035a/", "github": "https://github.com/Karthik-03901"}'::jsonb,
    true,
    true,
    11
  ),
  
  -- Yogeshwaran.R
  (
    'YOGESHWARAN.R',
    'DevOps, A/B Testing, Database',
    'Driving CI/CD pipelines, data-driven AB testing experimentation, and reliable database operations.',
    '/team/yogeshwaran.jpeg',
    'yogesh27124@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/yogeshwaran-ramesh", "github": "https://github.com/Yoge486"}'::jsonb,
    true,
    true,
    12
  ),
  
  -- Thamarai Selvan
  (
    'THAMARAI SELVAN',
    'Full Stack Developer',
    'Building end-to-end web applications with modern technologies and best practices for optimal performance.',
    '/team/thamaraiselvan.jpeg',
    'thamaraiselvan232007@gmail.com',
    '{"linkedin": "https://www.linkedin.com/in/thamarai-selvan", "github": "https://github.com/thamaraiselvan"}'::jsonb,
    false,
    true,
    13
  ),
  
  -- Hari Haran T.G
  (
    'HARI HARAN T.G',
    'Full Stack Developer',
    'Creating intuitive user experiences with modern frontend technologies and seamless backend integration.',
    '/team/hariharan.jpeg',
    'Hariharan@gmail.com',
    '{"linkedin": "https://www.linkedin.com", "github": "https://github.com"}'::jsonb,
    false,
    true,
    14
  );

-- ============================================
-- STEP 4: VERIFY DATA
-- ============================================

-- Show all team members
SELECT 
  id,
  name,
  position,
  email,
  featured,
  active,
  display_order
FROM public.team_members
ORDER BY display_order;

-- Count by category
SELECT 
  CASE 
    WHEN position ILIKE '%manager%' OR position ILIKE '%officer%' 
         OR position ILIKE '%head%' OR position ILIKE '%chief%' 
         OR position ILIKE '%legal%' OR position ILIKE '%marketing%' 
    THEN 'Management'
    ELSE 'Development'
  END as category,
  COUNT(*) as count
FROM public.team_members
WHERE active = true
GROUP BY category;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '✅ TEAM MEMBERS SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Database Summary:';
  RAISE NOTICE '  ✓ Table created: team_members';
  RAISE NOTICE '  ✓ Management team: 5 members';
  RAISE NOTICE '  ✓ Development team: 5 members';
  RAISE NOTICE '  ✓ Total members: 10';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '  ✓ Row Level Security enabled';
  RAISE NOTICE '  ✓ Public read access granted';
  RAISE NOTICE '  ✓ Authenticated users can manage';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '  1. Visit homepage (/) to see featured members';
  RAISE NOTICE '  2. Visit /team to see all team members';
  RAISE NOTICE '  3. Go to /admin/team to manage members';
  RAISE NOTICE '  4. Add team member images to /public/team/';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════';
END $$;
