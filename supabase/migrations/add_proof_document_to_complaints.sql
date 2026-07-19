-- Add proof_document_url column to complaints table
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS proof_document_url TEXT;

-- Verify
SELECT 
  'proof_document_url column' as check_type, 
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'complaints' AND column_name = 'proof_document_url') as result;
