-- ============================================
-- ENABLE REALTIME FOR CONTACTS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if contacts is already in realtime publication
SELECT 
    tablename,
    'Already enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'contacts'
UNION ALL
SELECT 
    'contacts' as tablename,
    'Not enabled yet' as status
WHERE NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'contacts'
);

-- If result shows "Not enabled yet", run this:
-- ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
