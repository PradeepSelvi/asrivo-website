-- Add WhatsApp field to client_inquiries table
-- Run this in Supabase SQL Editor if you already have the client_inquiries table

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

COMMENT ON COLUMN client_inquiries.whatsapp IS 'WhatsApp number (optional, if different from phone)';
