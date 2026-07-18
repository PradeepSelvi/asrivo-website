# Complaint Proof Document Upload Feature

## ✅ Features Implemented

### 1. **File Upload in Complaint Form**
- Added "Proof Document" upload field (optional)
- Accepts: JPEG, PNG, WebP, PDF
- Max file size: 3MB
- Shows upload progress indicator
- Preview uploaded file name and type
- Remove button to delete uploaded file

### 2. **Storage Bucket**
- Bucket name: `proof of complain` (created by you in Supabase)
- Public bucket for easy access
- Stores complaint evidence/proof documents

### 3. **Database Column**
- Added `proof_document_url` column to `complaints` table
- Stores the file path/URL from Supabase Storage
- Optional field (can be NULL)

### 4. **Upload API**
- Endpoint: `/api/complaints/upload`
- Validates file size (max 3MB)
- Validates file type (images + PDF)
- Uploads to `proof of complain` bucket
- Returns file URL

### 5. **Admin Dashboard**
- Added "Proof" column in complaints table
- Shows "View" link if proof document exists
- Opens document in new tab
- Shows "—" if no proof uploaded

---

## 📁 Files Created/Modified

### New Files:
1. `app/api/complaints/upload/route.ts` - File upload API
2. `supabase/migrations/add_proof_document_to_complaints.sql` - Add column migration

### Modified Files:
1. `app/complaints/new/page.tsx` - Added file upload UI and logic
2. `app/api/complaints/route.ts` - Added `proofDocumentUrl` field handling
3. `app/admin/(dashboard)/complaints/page.tsx` - Added "Proof" column with view link

---

## 🗄️ Database Schema Update

```sql
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS proof_document_url TEXT;
```

**Column Details:**
- **Name:** `proof_document_url`
- **Type:** TEXT
- **Nullable:** YES (optional)
- **Purpose:** Stores file path from Supabase Storage

---

## 📤 File Upload Flow

```
User fills complaint form
  ↓
Clicks "Choose File" for proof document
  ↓
Selects file (image or PDF, < 3MB)
  ↓
File uploads to /api/complaints/upload
  ↓
API validates:
  - File size (max 3MB)
  - File type (JPEG, PNG, WebP, PDF)
  ↓
Uploads to Supabase Storage bucket: "proof of complain"
  ↓
Returns file URL
  ↓
Form stores URL in state
  ↓
On submit → URL saved to database
  ↓
Admin can view document in dashboard
```

---

## 🎨 UI Components

### Complaint Form - File Upload Section:

```
Proof Document (Optional)
Upload supporting evidence (images or PDF, max 3MB)

┌─────────────────────────────────────┐
│ Choose File                         │
└─────────────────────────────────────┘

OR (after upload):

┌─────────────────────────────────────┐
│ 📄 screenshot.png (Image)      ✖    │
└─────────────────────────────────────┘
```

**Features:**
- File input with accept filter
- Loading spinner during upload
- Preview with file name and type
- Remove button (X)
- Error messages (red text)

### Admin Dashboard - Proof Column:

```
| Proof        |
|--------------|
| 📄 View      |  (clickable link)
| —            |  (no proof)
```

---

## 🔐 File Validation

### Client-Side:
- ✅ File size check (< 3MB)
- ✅ File type check (images, PDF)
- ✅ Clear error messages

### Server-Side (API):
- ✅ File size validation
- ✅ MIME type validation
- ✅ Secure file naming (timestamp + random ID)
- ✅ Buffer conversion for upload

### Allowed File Types:
- ✅ `image/jpeg`
- ✅ `image/jpg`
- ✅ `image/png`
- ✅ `image/webp`
- ✅ `application/pdf`

---

## 🚀 To Apply Changes

### Step 1: Run Migration SQL
```sql
-- Run in Supabase SQL Editor
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS proof_document_url TEXT;
```

### Step 2: Verify Bucket Exists
- Go to Supabase Dashboard → Storage
- Check if `proof of complain` bucket exists
- If not, create it:
  - Name: `proof of complain`
  - Public: **CHECKED** ✅ (for easy access)
  - File size limit: 3MB

### Step 3: Test
1. Go to `/complaints/new`
2. Fill out form
3. Click "Choose File" under Proof Document
4. Upload an image or PDF (< 3MB)
5. See file name appear
6. Submit complaint
7. Check `/admin/complaints` dashboard
8. Click "View" link in Proof column
9. Document should open in new tab

---

## 📊 API Endpoints

### Upload Endpoint
**POST** `/api/complaints/upload`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `file` field

**Response (Success):**
```json
{
  "success": true,
  "fileUrl": "proof_1234567890_abc123.jpg",
  "fileName": "screenshot.jpg",
  "fileSize": 245678,
  "fileType": "image/jpeg"
}
```

**Response (Error):**
```json
{
  "error": "File size exceeds 3MB limit"
}
```

### Complaint Submission
**POST** `/api/complaints`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Billing issue",
  "description": "Detailed description...",
  "category": "Billing",
  "priority": "high",
  "proofDocumentUrl": "proof_1234567890_abc123.jpg"
}
```

---

## 🔗 File Access URL

**Public URL Format:**
```
https://{PROJECT_ID}.supabase.co/storage/v1/object/public/proof%20of%20complain/{file_path}
```

**Example:**
```
https://csgbpsywrexqgvzkvkqw.supabase.co/storage/v1/object/public/proof%20of%20complain/proof_1234567890_abc123.jpg
```

**Note:** URL-encoded bucket name: `proof%20of%20complain` (space becomes `%20`)

---

## ✨ User Experience

### Before Upload:
- Shows file input
- User clicks "Choose File"
- Selects file from computer

### During Upload:
- Loading spinner appears
- File input disabled
- "Uploading..." state

### After Upload (Success):
- File name displayed with icon
- File type indicator (Image/PDF)
- Remove button (X) available
- Can remove and re-upload

### After Upload (Error):
- Red error message appears
- File input remains active
- User can try again

---

## 🎯 Form Validation

| Field | Required | Validation |
|-------|----------|------------|
| **Proof Document** | ❌ No | Optional |
| **File Size** | - | Max 3MB |
| **File Type** | - | Images, PDF only |

**Error Messages:**
- ❌ "File size exceeds 3MB limit"
- ❌ "Only JPEG, PNG, WebP, and PDF files are allowed"
- ❌ "Failed to upload file. Please try again."

---

## 📋 Admin Dashboard Updates

### New Column: "Proof"

**Location:** Between "Category" and "Priority"

**Display Logic:**
```typescript
if (complaint.proof_document_url) {
  // Show clickable "View" link
  <a href="...">📄 View</a>
} else {
  // Show dash
  <span>—</span>
}
```

**Link Behavior:**
- Opens in new tab (`target="_blank"`)
- Secure (`rel="noopener noreferrer"`)
- Points to public Supabase Storage URL

---

## 🐛 Troubleshooting

**Upload fails with "Bucket not found"?**
- Check bucket name: must be exactly `proof of complain`
- Verify bucket exists in Supabase Storage
- Check bucket is public

**File doesn't appear in admin dashboard?**
- Run migration to add `proof_document_url` column
- Check if URL was saved in database
- Verify `proof_document_url` is not NULL

**"View" link shows 404?**
- Check bucket is public
- Verify file was actually uploaded to bucket
- Check URL encoding (space = `%20`)

**Upload is slow?**
- File might be close to 3MB limit
- Check internet connection
- Consider reducing image size

**Admin can't view document?**
- Ensure bucket is PUBLIC (not private)
- Check storage policies allow SELECT
- Verify file still exists in bucket

---

## ✅ Testing Checklist

- [ ] Can upload JPEG image (< 3MB)
- [ ] Can upload PNG image (< 3MB)
- [ ] Can upload WebP image (< 3MB)
- [ ] Can upload PDF document (< 3MB)
- [ ] Error shown for > 3MB file
- [ ] Error shown for unsupported file type
- [ ] File name displays after upload
- [ ] Can remove uploaded file
- [ ] Can re-upload after removing
- [ ] Form submits with proof document
- [ ] Form submits WITHOUT proof document (optional)
- [ ] Proof column appears in admin dashboard
- [ ] "View" link works and opens document
- [ ] Shows "—" when no proof uploaded

---

## 🔄 Comparison

| Feature | Before | After |
|---------|--------|-------|
| **Proof upload** | ❌ Not available | ✅ Optional upload |
| **File types** | - | Images + PDF |
| **Max size** | - | 3MB |
| **Admin view** | ❌ No proof column | ✅ "Proof" column with link |
| **Storage** | - | Supabase Storage bucket |

---

## 📸 Expected Behavior

**Complaint Form:**
1. Scroll to "Proof Document" section
2. Click "Choose File"
3. Select image/PDF
4. See loading spinner
5. See file name appear: "📄 screenshot.png (Image)"
6. Can click X to remove
7. Submit form
8. Success message appears

**Admin Dashboard:**
1. Go to `/admin/complaints`
2. See "Proof" column in table
3. If complaint has proof → "📄 View" link
4. Click "View"
5. Document opens in new tab
6. Can download or view proof

---

**Status:** ✅ READY TO TEST  
**Migration Required:** YES (run `add_proof_document_to_complaints.sql`)  
**Bucket Required:** YES (`proof of complain` - already created)  
**Breaking Changes:** NO (new optional feature)
