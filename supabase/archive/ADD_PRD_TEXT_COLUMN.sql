-- Add prd_text column to client_inquiries table
-- Run this in Supabase SQL Editor

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_text TEXT;

COMMENT ON COLUMN client_inquiries.prd_text IS 'Manually written PRD text (alternative to file upload)';
