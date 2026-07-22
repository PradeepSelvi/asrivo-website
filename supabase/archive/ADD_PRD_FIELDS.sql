-- Add PRD file fields to client_inquiries table
-- Run this in Supabase SQL Editor

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_url TEXT,
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;

COMMENT ON COLUMN client_inquiries.prd_file_url IS 'URL of uploaded PRD document';
COMMENT ON COLUMN client_inquiries.prd_file_name IS 'Original filename of uploaded PRD document';
