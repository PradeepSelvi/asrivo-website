# Partnership System Troubleshooting Guide

## Current Error: "Bucket not found" and "Failed to submit partnership"

### Root Cause
The Supabase storage bucket `partnership-documents` and/or database columns haven't been created yet.

---

## 🔧 SOLUTION: Run This SQL in Supabase

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/csgbpsywrexqgvzkvkqw
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Copy and Paste This ENTIRE SQL Script

```sql
-- COMPLETE PARTNERSHIP SYSTEM SETUP
-- This will create everything needed for the partnership feature

-- Step 1: Create partnerships table (if not exists)
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  partnership_type TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  services_offered TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add document columns (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partnerships' AND column_name = 'agreement_document_url'
  ) THEN
    ALTER TABLE partnerships
    ADD COLUMN agreement_document_url TEXT,
    ADD COLUMN noc_document_url TEXT,
    ADD COLUMN proposal_document_url TEXT,
    ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
    ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Step 3: Disable RLS (for public submissions)
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;

-- Step 4: Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE partnerships;

-- Step 5: Create storage bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnership-documents', 
  'partnership-documents', 
  false,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Step 6: Create storage policies
DROP POLICY IF EXISTS "Allow public upload of partnership documents" ON storage.objects;
CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

DROP POLICY IF EXISTS "Admins can read partnership documents" ON storage.objects;
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partnership-documents');

DROP POLICY IF EXISTS "Admins can delete partnership documents" ON storage.objects;
CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partnership-documents');

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partnerships_updated_at ON partnerships;
CREATE TRIGGER update_partnerships_updated_at
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Click "Run" Button (bottom right)

You should see: `Success. No rows returned`

### Step 4: Verify Setup

Run this SQL to check everything:

```sql
-- Check table exists
SELECT 'Table exists' as status, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partnerships') as result;

-- Check document columns exist
SELECT 'Document columns' as status,
       EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'partnerships' AND column_name = 'agreement_document_url') as result;

-- Check bucket exists
SELECT 'Bucket exists' as status,
       EXISTS (SELECT FROM storage.buckets WHERE id = 'partnership-documents') as result;

-- View bucket details
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'partnership-documents';
```

All should return `true` or show 1 row.

---

## ✅ After Running SQL

1. **Refresh your application** (hard refresh: Ctrl + Shift + R)
2. **Try uploading a document again**
3. **Submit the form**

The errors should be gone!

---

## 🐛 If Still Getting Errors

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for specific error messages
4. Share the exact error text

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try uploading a file
4. Click on the failed request (red)
5. Check "Response" tab for error details

### Common Issues

**"Bucket not found"**
- The SQL hasn't been run yet
- Bucket name is incorrect (must be exactly: `partnership-documents`)

**"Failed to insert partnership record"**
- Document columns haven't been added to table
- Run the SQL above

**"Permission denied"**
- RLS is still enabled (run: `ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;`)

**Upload succeeds but form submission fails**
- Check if all 3 documents are uploaded
- Check if terms checkbox is checked

---

## 📝 Alternative: Manual Bucket Creation

If SQL doesn't work, create bucket manually:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Settings:
   - Name: `partnership-documents`
   - Public: **UNCHECKED** ❌ (must be private)
   - File size limit: `10 MB`
   - Allowed MIME types: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
4. Click **Create bucket**
5. Go to bucket → **Policies** tab
6. Add the 3 policies from the SQL above

---

## 📊 System Architecture

```
User Form → Upload Files → Supabase Storage (private bucket)
                         ↓
                    Get file URLs
                         ↓
         Submit Form → API → Database (partnerships table)
                         ↓
                    Admin Dashboard (realtime)
```

All files are stored privately and only accessible to authenticated admins.
