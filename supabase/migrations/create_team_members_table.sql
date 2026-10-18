-- ============================================
-- CREATE TEAM MEMBERS TABLE
-- ============================================
-- This creates the team_members table with all necessary columns
-- Run this BEFORE insert_team_members.sql

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

-- Create policies for authenticated users to insert/update/delete
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

-- Add comments for documentation
COMMENT ON TABLE public.team_members IS 'Stores information about team members displayed on the website';
COMMENT ON COLUMN public.team_members.name IS 'Full name of the team member';
COMMENT ON COLUMN public.team_members.position IS 'Job title or role';
COMMENT ON COLUMN public.team_members.bio IS 'Short biography or description';
COMMENT ON COLUMN public.team_members.image_url IS 'URL or path to profile image';
COMMENT ON COLUMN public.team_members.email IS 'Contact email address';
COMMENT ON COLUMN public.team_members.social_links IS 'JSON object containing social media links (linkedin, github, twitter, etc)';
COMMENT ON COLUMN public.team_members.featured IS 'Whether to show on homepage';
COMMENT ON COLUMN public.team_members.active IS 'Whether the member is currently active/visible';
COMMENT ON COLUMN public.team_members.display_order IS 'Order in which members should be displayed (lower numbers first)';

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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ team_members table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Table structure:';
  RAISE NOTICE '  - id (BIGSERIAL PRIMARY KEY)';
  RAISE NOTICE '  - name (TEXT, required)';
  RAISE NOTICE '  - position (TEXT, required)';
  RAISE NOTICE '  - bio (TEXT)';
  RAISE NOTICE '  - image_url (TEXT)';
  RAISE NOTICE '  - email (TEXT)';
  RAISE NOTICE '  - social_links (JSONB)';
  RAISE NOTICE '  - featured (BOOLEAN, default: false)';
  RAISE NOTICE '  - active (BOOLEAN, default: true)';
  RAISE NOTICE '  - display_order (INTEGER, default: 0)';
  RAISE NOTICE '  - created_at (TIMESTAMPTZ)';
  RAISE NOTICE '  - updated_at (TIMESTAMPTZ)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run insert_team_members.sql to populate data';
END $$;
