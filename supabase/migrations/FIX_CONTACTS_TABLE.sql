-- ============================================
-- FIX CONTACTS TABLE - ADD TYPE COLUMN
-- Only run this if contacts table already exists
-- ============================================

-- Check if contacts table exists, if yes add type column
DO $$ 
BEGIN
    -- Check if contacts table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'contacts'
    ) THEN
        -- Add type column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'contacts' 
            AND column_name = 'type'
        ) THEN
            ALTER TABLE contacts ADD COLUMN type TEXT;
            CREATE INDEX idx_contacts_type ON contacts(type);
            RAISE NOTICE 'Added type column to contacts table';
        ELSE
            RAISE NOTICE 'Type column already exists in contacts table';
        END IF;
    ELSE
        RAISE NOTICE 'Contacts table does not exist - skipping';
    END IF;
END $$;
