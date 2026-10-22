-- Verify team_type column exists and check data
-- Run this in Supabase SQL Editor to debug

-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'team_members' 
  AND column_name = 'team_type';

-- If column exists, check current values
SELECT 
  id,
  name,
  position,
  team_type,
  active
FROM public.team_members
ORDER BY team_type, name;

-- Count by type
SELECT 
  team_type,
  COUNT(*) as count
FROM public.team_members
WHERE active = true
GROUP BY team_type;
