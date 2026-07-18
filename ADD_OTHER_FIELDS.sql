-- Add custom fields for "Other" selections to client_inquiries table
-- Run this in Supabase SQL Editor

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS other_project_type TEXT,
ADD COLUMN IF NOT EXISTS other_key_feature TEXT;

COMMENT ON COLUMN client_inquiries.other_project_type IS 'Custom project type when user selects "Other"';
COMMENT ON COLUMN client_inquiries.other_key_feature IS 'Custom key feature when user selects "Other"';
