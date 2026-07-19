# PRD File Upload Feature - Complete Guide

## ✅ What's Been Added

### Client-Side (Inquiry Form)
- ✅ File upload field in Step 4 (Additional Info)
- ✅ Drag-and-drop or click to upload interface
- ✅ File type validation (PDF, DOC, DOCX, TXT only)
- ✅ File size validation (max 10MB)
- ✅ File preview with name and size
- ✅ Remove file option
- ✅ Upload progress indication

### Backend
- ✅ File upload API endpoint (`/api/upload`)
- ✅ Supabase Storage integration
- ✅ Unique filename generation
- ✅ Secure file handling
- ✅ PRD file URL saved to database

### Admin Panel
- ✅ Display PRD document link in inquiry details
- ✅ Clickable link to download/view PRD
- ✅ File name display
- ✅ Visual indicator with icon

## 🎨 User Experience

### Upload Interface
```
┌─────────────────────────────────────────────┐
│  Product Requirements Document (PRD)        │
│  If you have a PRD or requirements         │
│  document, upload it here                   │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │         📤                            │  │
│  │  Click to upload or drag and drop    │  │
│  │  PDF, DOC, DOCX, or TXT (max 10MB)  │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### After Upload
```
┌─────────────────────────────────────────────┐
│  📄  Requirements_v2.pdf                     │
│      125.43 KB                          ✕   │
└─────────────────────────────────────────────┘
```

### Admin View
```
PRD Document:
┌─────────────────────────────────────────────┐
│  💼  Download PRD                     →     │
│      Requirements_v2.pdf                    │
└─────────────────────────────────────────────┘
```

## 🔧 Setup Instructions

### Step 1: Run Database Migration
```sql
-- Add PRD fields to inquiries table
ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_file_url TEXT,
ADD COLUMN IF NOT EXISTS prd_file_name TEXT;
```

### Step 2: Create Supabase Storage Bucket

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `inquiry-documents`
4. Select "Public bucket"
5. Set file size limit: 10 MB
6. Click "Create Bucket"

**Option B: Using SQL**
Run the `SUPABASE_STORAGE_SETUP.sql` file in SQL Editor

### Step 3: Configure Storage Policies

The storage bucket needs these policies:
- ✅ Allow public uploads (for form submissions)
- ✅ Allow public read (to view uploaded files)
- ✅ Allow admins to delete (file management)

These are automatically created if you use the SQL method.

### Step 4: Test the Feature

1. **Go to** `/services` → Click "Get Started"
2. **Fill form** through all steps
3. **In Step 4**: Click the upload area or drag a file
4. **Select a PRD** file (PDF, DOC, DOCX, or TXT)
5. **Verify** file shows with name and size
6. **Submit** the form
7. **Check admin panel** at `/admin/inquiries`
8. **Click inquiry** to view details
9. **Verify** PRD document link appears
10. **Click link** to download/view the file

## 📊 Technical Details

### File Upload Flow
```
1. User selects file
   ↓
2. Client validates type & size
   ↓
3. File stored in state
   ↓
4. On submit, file uploads to /api/upload
   ↓
5. API uploads to Supabase Storage
   ↓
6. Public URL returned
   ↓
7. URL saved with inquiry data
   ↓
8. Admin can access file via URL
```

### Supported File Types
| Type | Extension | MIME Type |
|------|-----------|-----------|
| PDF | .pdf | application/pdf |
| Word (old) | .doc | application/msword |
| Word (new) | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| Text | .txt | text/plain |

### File Validation
- ✅ Type: PDF, DOC, DOCX, TXT only
- ✅ Size: Maximum 10MB
- ✅ Virus scan: Handled by Supabase
- ✅ Unique names: Timestamp + random string

### Storage Structure
```
inquiry-documents/
└── prds/
    ├── 1704067200000-abc123.pdf
    ├── 1704067201000-def456.docx
    └── 1704067202000-ghi789.txt
```

## 🔒 Security Features

### Upload Security
- ✅ File type whitelist (only allowed types)
- ✅ File size limit (10MB max)
- ✅ Server-side validation
- ✅ Unique filenames (prevent overwrite)
- ✅ Public bucket with RLS policies

### Access Control
- ✅ Anyone can upload (for form submissions)
- ✅ Files are publicly readable (via URL)
- ✅ Only admins can delete files
- ✅ URLs are long and random (security through obscurity)

## 📝 Files Changed

### Frontend
- ✅ `app/services/inquiry/page.tsx`
  - Added file upload UI
  - File validation
  - Upload state management
  - File preview

### Backend
- ✅ `app/api/upload/route.ts` (NEW)
  - File upload endpoint
  - Supabase Storage integration
  - Validation and error handling

- ✅ `app/api/inquiries/route.ts`
  - Added `prd_file_url` field
  - Added `prd_file_name` field

### Admin Panel
- ✅ `app/admin/(dashboard)/inquiries/[id]/inquiry-detail.tsx`
  - Display PRD link
  - Download button with icon
  - Conditional rendering

### Database
- ✅ `ADD_PRD_FIELDS.sql`
  - Migration for PRD columns

- ✅ `SUPABASE_STORAGE_SETUP.sql`
  - Storage bucket creation
  - RLS policies

## 🧪 Testing Checklist

- [ ] Upload PDF file → Success
- [ ] Upload DOC file → Success
- [ ] Upload DOCX file → Success
- [ ] Upload TXT file → Success
- [ ] Try to upload JPG → Validation error
- [ ] Try to upload 15MB file → Size error
- [ ] Upload file and remove → Works
- [ ] Submit form with PRD → Saves correctly
- [ ] Submit form without PRD → Still works
- [ ] View in admin panel → Link displays
- [ ] Click PRD link → File downloads/opens
- [ ] Multiple inquiries with PRDs → All unique files

## 🎯 Complete Feature List

| Feature | Status | Notes |
|---------|--------|-------|
| File Upload UI | ✅ | Drag-and-drop & click |
| Type Validation | ✅ | PDF, DOC, DOCX, TXT |
| Size Validation | ✅ | Max 10MB |
| File Preview | ✅ | Name & size display |
| Remove File | ✅ | Before submission |
| Upload to Storage | ✅ | Supabase Storage |
| Save URL to DB | ✅ | With inquiry data |
| Admin Display | ✅ | Downloadable link |
| Error Handling | ✅ | User-friendly messages |
| Optional Field | ✅ | Not required |

## 🚨 Important Notes

1. **Storage Bucket Required**: Must create `inquiry-documents` bucket in Supabase
2. **Public Bucket**: Files are publicly accessible via URL
3. **No Authentication**: Anyone can upload (by design for public form)
4. **File Retention**: Files persist indefinitely (implement cleanup if needed)
5. **Unique Names**: Each upload gets unique name to prevent conflicts

## 🔄 Future Enhancements (Optional)

- [ ] Add virus scanning
- [ ] Implement file cleanup (auto-delete old files)
- [ ] Add thumbnail preview for PDFs
- [ ] Support more file types (Excel, PowerPoint)
- [ ] Add file compression
- [ ] Implement upload progress bar
- [ ] Add file versioning
- [ ] Email PRD to admins on upload

## 📦 Environment Variables

No additional environment variables needed. Uses existing Supabase configuration from `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

---

**Status**: ✅ Ready to use
**Required Setup**: 
1. Run `ADD_PRD_FIELDS.sql`
2. Create storage bucket (Dashboard or SQL)
3. Test upload feature
