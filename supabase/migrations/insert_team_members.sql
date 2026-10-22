-- ============================================
-- INSERT ALL TEAM MEMBERS INTO DATABASE
-- ============================================
-- This populates the team_members table with all management and development team members
-- Run this in your Supabase SQL Editor

-- Clear existing data (optional - remove this if you want to keep existing members)
-- TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;

-- ============================================
-- MANAGEMENT TEAM
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
-- DEVELOPMENT TEAM
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
-- VERIFY DATA
-- ============================================

-- Show all team members ordered by display_order
SELECT 
  id,
  name,
  position,
  email,
  featured,
  active,
  display_order,
  created_at
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Team members inserted successfully!';
  RAISE NOTICE '✅ Management team: 5 members';
  RAISE NOTICE '✅ Development team: 5 members';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Visit your homepage (/) to see featured members';
  RAISE NOTICE '2. Visit /team to see all team members';
  RAISE NOTICE '3. Go to /admin/team to manage members';
  RAISE NOTICE '4. Toggle "featured" to control homepage display';
  RAISE NOTICE '5. Toggle "active" to show/hide members publicly';
END $$;
