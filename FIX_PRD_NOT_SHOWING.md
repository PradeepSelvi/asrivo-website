# Fix: PRD File Not Showing in Admin Panel

## 🐛 Problem
After uploading a PRD file in the inquiry form, it doesn't appear in the admin panel inquiry detail page.

## 🔍 Root Causes (Most Common)

### 1. Database Columns Missing
The `prd_file_url` and `prd_file_name` columns might not exist in your `client_inquiries` table.

### 2. Storage Bucket Not Created
The `inquiry-documents` Supabase Storage bucket might not exist.

### 3. Storage Policies Missing
The bucket might exist but lack proper RLS policies for uploads.

## ✅ Step-by-Step Fix

### Step 1: Add Database Columns

Run this in **Supabase SQL Editor**:

```sql
-- File: ADD_PRD_COLUMNS_ONLY.sql

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_url TEXT;

ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;

COMMENT ON COLUMN client_inquiries.prd_file_url IS 'URL of uploaded PRD document';
COMMENT ON COLUMN client_inquiries.prd_file_name IS 'Original filename of PRD document';
```

### Step 2: Verify Columns Were Added

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'client_inquiries'
AND column_name IN ('prd_file_url', 'prd_file_name');
```

**Expected Result**: Should show 2 rows

### Step 3: Create Storage Bucket

**Option A: Using Supabase Dashboard** (Recommended)
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Bucket name: `inquiry-documents`
4. Make it **Public**
5. File size limit: **10 MB**
6. Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`
7. Click **Create**

**Option B: Using SQL**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-documents',
  'inquiry-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Add Storage Policies

```sql
-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public uploads to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete inquiry-documents" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'inquiry-documents');

CREATE POLICY "Allow public read access to inquiry-documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'inquiry-documents');

CREATE POLICY "Allow admins to delete inquiry-documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'inquiry-documents' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
  )
);
```

### Step 5: Verify Setup

Run this to check everything:

```sql
-- File: VERIFY_PRD_SETUP.sql

-- 1. Check columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'client_inquiries'
AND column_name IN ('prd_file_url', 'prd_file_name');
-- Should return 2 rows

-- 2. Check bucket
SELECT id, name, public FROM storage.buckets
WHERE id = 'inquiry-documents';
-- Should return 1 row

-- 3. Check policies
SELECT policyname FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%inquiry-documents%';
-- Should return 3 rows
```

### Step 6: Test File Upload

1. Go to inquiry form: `/services/inquiry`
2. Fill out all required steps
3. In Step 4, upload a PDF file
4. Open browser DevTools → Network tab
5. Submit the form
6. Look for POST request to `/api/upload`
7. Check response - should show `success: true` and a URL

### Step 7: Check Admin Panel

1. Go to `/admin/inquiries`
2. Find the submitted inquiry
3. Click to view details
4. Scroll to "PRD Document" section
5. Should see download link with filename

## 🧪 Quick Test

### Test Upload API Directly

Open browser console on your site and run:

```javascript
// Test file upload
const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
const formData = new FormData()
formData.append('file', testFile)
formData.append('bucket', 'inquiry-documents')
formData.append('folder', 'prds')

fetch('/api/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json()).then(console.log)

// Expected response:
// {
//   success: true,
//   url: "https://...supabase.co/storage/v1/object/public/inquiry-documents/prds/...",
//   path: "prds/1234567890-abc123.pdf",
//   fileName: "test.pdf",
//   fileSize: 12
// }
```

## 🔍 Common Issues & Solutions

### Issue 1: "Bucket does not exist"
**Solution**: Create the bucket using Step 3 above

### Issue 2: "Permission denied for bucket inquiry-documents"
**Solution**: Add storage policies using Step 4 above

### Issue 3: File uploads but doesn't save to database
**Solution**: Check that API endpoint is saving both fields:
- `prd_file_url`
- `prd_file_name`

### Issue 4: Admin panel shows nothing
**Solution**: 
1. Verify columns exist (Step 1)
2. Check inquiry actually has data:
```sql
SELECT id, name, prd_file_url, prd_file_name 
FROM client_inquiries 
WHERE prd_file_url IS NOT NULL
LIMIT 5;
```

### Issue 5: "File too large" error
**Solution**: Check file is under 10MB

### Issue 6: "Invalid file type" error
**Solution**: Only these types allowed:
- PDF (`.pdf`)
- Word Doc (`.doc`)
- Word Docx (`.docx`)
- Text (`.txt`)

## 📊 Verification Checklist

Run through this checklist:

- [ ] Database columns exist (`prd_file_url`, `prd_file_name`)
- [ ] Storage bucket `inquiry-documents` exists
- [ ] Bucket is set to **Public**
- [ ] Storage policies are created (3 policies)
- [ ] File upload UI appears in Step 4
- [ ] Can select file (click or drag-drop)
- [ ] File preview shows after selection
- [ ] Can remove file before submit
- [ ] Form submits successfully
- [ ] POST to `/api/upload` succeeds (check Network tab)
- [ ] POST to `/api/inquiries` includes PRD data
- [ ] Inquiry appears in admin panel
- [ ] PRD link visible in inquiry detail
- [ ] Clicking link downloads/opens file

## 🎯 Expected Flow

1. **User uploads file** → File stored in React state (`prdFile`)
2. **User submits form** → POST to `/api/upload`
3. **Upload API** → Saves to Supabase Storage
4. **Upload API returns** → Public URL
5. **Form submit** → POST to `/api/inquiries` with URL
6. **Inquiries API** → Saves `prd_file_url` and `prd_file_name` to database
7. **Admin views inquiry** → Fetches from database with `SELECT *`
8. **Admin panel** → Shows PRD link if `inquiry.prd_file_url` exists

## 🐛 Debug Mode

Add console logs to track the flow:

### In Form (`app/services/inquiry/page.tsx`):
```javascript
// After file upload succeeds
console.log('✅ File uploaded:', prdFileUrl, prdFileName)

// In form submit
console.log('📤 Submitting with PRD:', {
  prdFileUrl,
  prdFileName
})
```

### Check Network Tab:
1. **POST `/api/upload`** → Should return URL
2. **POST `/api/inquiries`** → Should include `prdFileUrl` and `prdFileName` in body

### Check Database:
```sql
-- See actual data
SELECT id, name, email, 
       prd_file_url, 
       prd_file_name,
       created_at
FROM client_inquiries
ORDER BY created_at DESC
LIMIT 5;
```

## 💡 Quick Fix

If nothing works, run this complete setup:

```sql
-- Complete PRD setup in one go
BEGIN;

-- 1. Add columns
ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_url TEXT,
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;

-- 2. Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('inquiry-documents', 'inquiry-documents', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop old policies
DROP POLICY IF EXISTS "Allow public uploads to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to inquiry-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete inquiry-documents" ON storage.objects;

-- 4. Create policies
CREATE POLICY "Allow public uploads to inquiry-documents"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'inquiry-documents');

CREATE POLICY "Allow public read access to inquiry-documents"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'inquiry-documents');

COMMIT;
```

---

**Status**: Follow steps in order
**Time**: 5-10 minutes to complete setup
**Support**: Check each step's "Expected Result"
