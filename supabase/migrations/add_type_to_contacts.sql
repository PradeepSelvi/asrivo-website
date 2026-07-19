-- Add type column to contacts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contacts' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE contacts ADD COLUMN type TEXT;
    END IF;
END $$;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
