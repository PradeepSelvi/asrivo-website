-- Update email addresses for team members
-- Sivaganesh J
UPDATE team_members 
SET email = 'sivaganesh@asrivotech.in' 
WHERE name LIKE '%Sivaganesh%';

-- Karthik Rajalee
UPDATE team_members 
SET email = 'karthick@asrivotech.in' 
WHERE name LIKE '%Karthik%';

-- Yogeshwaran
UPDATE team_members 
SET email = 'yogesh@asrivotech.in' 
WHERE name LIKE '%Yogesh%';

-- Verify the updates
SELECT name, email FROM team_members 
WHERE name LIKE '%Sivaganesh%' 
   OR name LIKE '%Karthik%' 
   OR name LIKE '%Yogesh%';
