-- Run this query to check if the table exists and view its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'consultation_requests'
ORDER BY 
    ordinal_position;

-- Check if there are any rows
SELECT COUNT(*) as total_rows FROM consultation_requests;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'consultation_requests';
