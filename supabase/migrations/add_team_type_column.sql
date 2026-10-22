-- Add team_type column to team_members table
-- This allows admins to explicitly categorize team members as Management or Developers

-- Add the column with a default value
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS team_type TEXT DEFAULT 'developer' 
CHECK (team_type IN ('management', 'developer'));

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_team_members_team_type ON public.team_members(team_type);

-- Update existing team members based on their position keywords
-- Management: CEO, CTO, CFO, COO, Director, Manager, Head, Chief, VP, President, Founder
UPDATE public.team_members
SET team_type = 'management'
WHERE team_type = 'developer' -- Only update if not already set
  AND (
    LOWER(position) LIKE '%ceo%' OR
    LOWER(position) LIKE '%cto%' OR
    LOWER(position) LIKE '%cfo%' OR
    LOWER(position) LIKE '%coo%' OR
    LOWER(position) LIKE '%chief%' OR
    LOWER(position) LIKE '%director%' OR
    LOWER(position) LIKE '%manager%' OR
    LOWER(position) LIKE '%head%' OR
    LOWER(position) LIKE '%president%' OR
    LOWER(position) LIKE '%vp%' OR
    LOWER(position) LIKE '%vice president%' OR
    LOWER(position) LIKE '%founder%' OR
    LOWER(position) LIKE '%officer%' OR
    LOWER(position) LIKE '%lead%' AND LOWER(position) NOT LIKE '%developer%' OR
    LOWER(position) LIKE '%legal%' OR
    LOWER(position) LIKE '%hr%' OR
    LOWER(position) LIKE '%human resource%' OR
    LOWER(position) LIKE '%marketing%' AND LOWER(position) NOT LIKE '%specialist%'
  );

-- Comment explaining the column
COMMENT ON COLUMN public.team_members.team_type IS 'Categorizes team member as management or developer for display organization';
