-- ============================================
-- COMPLETE PROJECTS SETUP WITH SAMPLE DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to projects table
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='frontend_tech') THEN
        ALTER TABLE projects ADD COLUMN frontend_tech TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='backend_tech') THEN
        ALTER TABLE projects ADD COLUMN backend_tech TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='database_tech') THEN
        ALTER TABLE projects ADD COLUMN database_tech TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='infrastructure') THEN
        ALTER TABLE projects ADD COLUMN infrastructure TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='key_features') THEN
        ALTER TABLE projects ADD COLUMN key_features TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='challenge') THEN
        ALTER TABLE projects ADD COLUMN challenge TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='solution') THEN
        ALTER TABLE projects ADD COLUMN solution TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='results') THEN
        ALTER TABLE projects ADD COLUMN results TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='team_size') THEN
        ALTER TABLE projects ADD COLUMN team_size INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='duration') THEN
        ALTER TABLE projects ADD COLUMN duration TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='prd_file_url') THEN
        ALTER TABLE projects ADD COLUMN prd_file_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='prd_file_name') THEN
        ALTER TABLE projects ADD COLUMN prd_file_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='gallery_images') THEN
        ALTER TABLE projects ADD COLUMN gallery_images TEXT[];
    END IF;
END $$;

-- Disable RLS
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Enable realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'projects already in realtime';
END $$;

-- Insert sample project data
INSERT INTO projects (
  title, 
  slug, 
  description, 
  long_description,
  category,
  status,
  client_name,
  frontend_tech,
  backend_tech,
  database_tech,
  infrastructure,
  challenge,
  solution,
  key_features,
  results,
  team_size,
  duration,
  technologies,
  image_url,
  featured_image_url,
  live_url,
  github_url,
  featured,
  display_order
) VALUES (
  'FinTech Analytics Dashboard',
  'fintech-analytics-dashboard',
  'A comprehensive financial analytics platform with real-time data visualization, AI-powered insights, and automated reporting for investment firms.',
  'This project was built for a leading investment firm that needed to consolidate financial data from multiple sources and provide their analysts with real-time insights. The platform handles millions of data points per day and provides predictive analytics using machine learning algorithms.

The dashboard features custom interactive charts, real-time data streaming, and collaborative features that allow teams to share insights and make data-driven decisions faster.',
  'web-app',
  'completed',
  'TechCorp Financial Services',
  'React 18, Next.js 15, TypeScript, Tailwind CSS, Recharts, React Query',
  'Node.js 20, Express, WebSocket API, REST API, JWT Authentication',
  'PostgreSQL 16, Redis 7, TimescaleDB for time-series data',
  'AWS EC2, S3, CloudFront CDN, Docker, Kubernetes, GitHub Actions CI/CD',
  'The client needed to consolidate data from multiple sources (Bloomberg, Reuters, internal systems) and provide actionable insights to their analysts in real-time. The existing system was slow, required manual data entry, and couldn''t handle the volume of data being generated.',
  'We built a scalable dashboard using React and Node.js with real-time data streaming capabilities. The system uses WebSockets for live updates, custom visualization components for financial data, and ML-powered predictions for trend analysis. We implemented a microservices architecture to handle high data volumes and ensure 99.9% uptime.',
  ARRAY[
    'Real-time data streaming with WebSocket connections',
    'Custom interactive charts and data visualizations',
    'ML-powered trend predictions and anomaly detection',
    'Multi-user collaboration with shared dashboards',
    'Export reports in PDF, Excel, and CSV formats',
    'Role-based access control and audit logging',
    'Mobile-responsive design for tablets and phones',
    'Dark mode support for reduced eye strain'
  ],
  ARRAY[
    '40% faster decision-making process',
    '60% reduction in manual reporting time',
    '95.9% uptime achieved in production',
    '10,000+ concurrent users supported',
    'Processing 5M+ data points daily'
  ],
  5,
  '6 months',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS', 'Machine Learning', 'WebSocket', 'TypeScript'],
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'https://demo.fintech-analytics.example.com',
  'https://github.com/example/fintech-analytics',
  true,
  1
) ON CONFLICT (slug) DO NOTHING;

-- Insert another sample project
INSERT INTO projects (
  title,
  slug,
  description,
  long_description,
  category,
  status,
  client_name,
  frontend_tech,
  backend_tech,
  database_tech,
  infrastructure,
  challenge,
  solution,
  key_features,
  results,
  team_size,
  duration,
  technologies,
  image_url,
  featured_image_url,
  featured,
  display_order
) VALUES (
  'E-Commerce Platform Redesign',
  'ecommerce-platform-redesign',
  'Complete redesign and rebuild of a major e-commerce platform serving 100K+ daily users with improved performance and UX.',
  'A major retail client approached us to modernize their aging e-commerce platform. The goal was to improve site performance, enhance the user experience, and implement modern features like personalized recommendations and one-click checkout.',
  'ecommerce',
  'completed',
  'RetailCo Inc.',
  'Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion',
  'Node.js, GraphQL, Stripe API, Algolia Search',
  'PostgreSQL, MongoDB for product catalog',
  'Vercel, Cloudflare CDN, AWS S3',
  'The legacy platform had slow page load times (5-8 seconds), high cart abandonment rates (78%), and a dated mobile experience. The system couldn''t handle Black Friday traffic spikes.',
  'We rebuilt the platform from scratch using Next.js for optimal performance and SEO. Implemented edge caching, image optimization, and lazy loading. Added personalized product recommendations using collaborative filtering.',
  ARRAY[
    'Sub-second page loads with edge caching',
    'One-click checkout with saved payment methods',
    'Personalized product recommendations',
    'Advanced search with filters and facets',
    'Real-time inventory tracking',
    'Mobile-first responsive design',
    'A/B testing framework built-in'
  ],
  ARRAY[
    '70% improvement in page load times',
    '45% reduction in cart abandonment',
    '120% increase in mobile conversions',
    'Handled 50K concurrent Black Friday users'
  ],
  8,
  '9 months',
  ARRAY['Next.js', 'React', 'Node.js', 'PostgreSQL', 'GraphQL', 'Stripe', 'Vercel'],
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
  true,
  2
) ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Projects setup complete! Visit /projects/fintech-analytics-dashboard to see the detail page.' as message;
