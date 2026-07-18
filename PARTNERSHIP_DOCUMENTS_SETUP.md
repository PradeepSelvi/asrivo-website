# Partnership Document Upload System Setup

## Database Migration

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add document columns to partnerships table
ALTER TABLE partnerships
ADD COLUMN agreement_document_url TEXT,
ADD COLUMN noc_document_url TEXT,
ADD COLUMN proposal_document_url TEXT,
ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Create storage bucket for partnership documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('partnership-documents', 'partnership-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for partnership documents
CREATE POLICY "Admins can read partnership documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partnership-documents');

CREATE POLICY "Allow public upload of partnership documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

CREATE POLICY "Admins can delete partnership documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partnership-documents');
```

## Features Implemented

### 1. Document Upload System
- ✅ Partnership Agreement Document upload
- ✅ NOC (No Objection Certificate) upload
- ✅ Proposal Document upload
- ✅ File size validation (max 10MB per file)
- ✅ File type validation (PDF, DOC, DOCX only)
- ✅ Upload progress indicators
- ✅ File preview with remove option

### 2. Terms & Conditions
- ✅ Mandatory checkbox for terms acceptance
- ✅ Database storage of acceptance timestamp
- ✅ Cannot submit without accepting terms

### 3. Storage Security
- ✅ **Private S3 bucket** (Supabase Storage)
- ✅ Documents NOT publicly accessible
- ✅ Admin-only download links
- ✅ Authenticated API endpoint for downloads

### 4. Admin Dashboard Integration
- ✅ Document links in partnership details modal
- ✅ Color-coded document cards
- ✅ One-click download for admins
- ✅ Terms acceptance indicator with timestamp

## How It Works

### User Flow:
1. Fill out partnership form
2. Upload 3 required documents (Agreement, NOC, Proposal)
3. Accept terms and conditions checkbox
4. Submit form
5. Documents uploaded to private Supabase Storage bucket
6. URLs stored in database

### Admin Flow:
1. View partnership in dashboard
2. Click "View" to see details
3. Scroll to "Submitted Documents" section
4. Click any document to download
5. Only authenticated admins can access documents

## API Endpoints

- `POST /api/partnerships/upload` - Upload document (public)
- `GET /api/partnerships/download/[path]` - Download document (admin only)

## Security Features

✅ **Private Storage** - Documents stored in private bucket
✅ **Admin-Only Access** - Download endpoint requires authentication
✅ **File Validation** - Type and size validation
✅ **Terms Tracking** - Acceptance logged with timestamp
✅ **Secure URLs** - No public URLs generated

## Testing

1. Submit a partnership with all 3 documents
2. Login as admin
3. Go to `/admin/partnerships`
4. Click "View" on the partnership
5. Verify documents are shown with download links
6. Click to download - should work for admins only

## Document Storage Location

Supabase Storage Bucket: `partnership-documents`
Path Format: `temp/{documentType}_{timestamp}_{randomId}.{ext}`

Documents are organized by partnership ID once submitted.
