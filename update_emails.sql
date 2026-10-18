-- Replace Gmail addresses with @asrivotech.in addresses in team_members table

UPDATE team_members SET email = 'yogesh@asrivotech.in' WHERE email LIKE '%yogesh%@gmail.com';
UPDATE team_members SET email = 'karthick@asrivotech.in' WHERE email LIKE '%vel759894%@gmail.com';
UPDATE team_members SET email = 'sivaganesh@asrivotech.in' WHERE email LIKE '%sivaganesh%@gmail.com';
UPDATE team_members SET email = 'cto@asrivotech.in' WHERE name LIKE '%Sargunan%';
UPDATE team_members SET email = 'hr_team@asrivotech.in' WHERE name LIKE '%Aswin%';
UPDATE team_members SET email = 'noreplay@asrivotech.in' WHERE email = 'noreplay@asrivotech.in';
UPDATE team_members SET email = 'info@asrivotech.in' WHERE position LIKE '%CEO%' OR position LIKE '%Founder%';
UPDATE team_members SET email = 'media@asrivotech.in' WHERE name LIKE '%Siranjeevi%';

-- Verify changes
SELECT name, email, position FROM team_members ORDER BY display_order;
