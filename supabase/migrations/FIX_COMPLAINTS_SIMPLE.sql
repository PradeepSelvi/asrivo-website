-- ============================================
-- SIMPLE FIX FOR COMPLAINTS SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. DROP AND RECREATE COMPLAINTS TABLE
-- ============================================

-- Drop table if exists
DROP TABLE IF EXISTS complaints CASCADE;

-- Create complaints table with ALL columns
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'new',
  proof_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for public access
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_email ON complaints(email);

-- Enable realtime (if not already enabled)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- ============================================
-- 2. VERIFY SETUP
-- ============================================

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'complaints'
ORDER BY ordinal_position;
