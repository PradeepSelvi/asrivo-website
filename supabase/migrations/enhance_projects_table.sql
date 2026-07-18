-- ============================================
-- ENHANCE PROJECTS TABLE
-- Add detailed technical information and PRD support
-- ============================================

-- Add new columns for detailed project information
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS frontend_tech TEXT,
ADD COLUMN IF NOT EXISTS backend_tech TEXT,
ADD COLUMN IF NOT EXISTS database_tech TEXT,
ADD COLUMN IF NOT EXISTS infrastructure TEXT,
ADD COLUMN IF NOT EXISTS key_features TEXT[],
ADD COLUMN IF NOT EXISTS challenge TEXT,
ADD COLUMN IF NOT EXISTS solution TEXT,
ADD COLUMN IF NOT EXISTS results TEXT[],
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS prd_file_url TEXT,
ADD COLUMN IF NOT EXISTS prd_file_name TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Disable RLS for public access
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Enable realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'projects table already in realtime publication';
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_frontend ON projects(frontend_tech);
CREATE INDEX IF NOT EXISTS idx_projects_backend ON projects(backend_tech);
CREATE INDEX IF NOT EXISTS idx_projects_database ON projects(database_tech);
