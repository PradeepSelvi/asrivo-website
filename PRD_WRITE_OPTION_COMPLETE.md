# PRD Write Option - Implementation Complete

## Summary
Added the ability for clients to either **upload a PRD file** OR **write their PRD manually** in a textarea field.

## Changes Made

### 1. Frontend Form (`app/services/inquiry/page.tsx`)
✅ Already implemented in previous context:
- Added toggle buttons: "📤 Upload File" and "✍️ Write Here"
- Added `prdInputMethod` state to track selected method
- Added `prdText` field to formData
- Shows file upload UI when "Upload File" is selected
- Shows textarea (8 rows) when "Write Here" is selected
- Character counter for manual text entry
- Toggling clears the other method's data

### 2. Database Schema (`ADD_PRD_TEXT_COLUMN.sql`)
✅ Created SQL migration file:
```sql
ALTER TABLE client_inquiries 
ADD COLUMN IF NOT EXISTS prd_text TEXT;
```

**ACTION REQUIRED**: Run this SQL in Supabase SQL Editor

### 3. API Endpoint (`app/api/inquiries/route.ts`)
✅ Updated to save prdText field:
- Added `prd_text: body.prdText || null` to database insert

### 4. Admin Detail View (`app/admin/(dashboard)/inquiries/[id]/inquiry-detail.tsx`)
✅ Updated to display manual PRD:
- Shows "PRD Document (Uploaded)" section with download link when file exists
- Shows "PRD (Written)" section with formatted text when manual text exists
- Uses `whitespace-pre-wrap` to preserve line breaks
- Styled consistently with other text fields

## User Experience

### Client Submitting Inquiry:
1. On Step 4, sees two toggle buttons for PRD input method
2. Can choose to upload a file (PDF, DOC, DOCX, TXT up to 10MB)
3. OR can choose to write PRD manually in textarea
4. Toggling between methods clears the other option
5. Character counter shows length of manual text
6. Both methods are optional

### Admin Viewing Inquiry:
- If file uploaded: Shows download link with file name
- If text written: Shows formatted text box with manual PRD
- Both labeled clearly to distinguish the method used
- Line breaks preserved for readability

## Database Structure
```typescript
client_inquiries {
  prd_file_url: TEXT,      // URL of uploaded file
  prd_file_name: TEXT,     // Name of uploaded file
  prd_text: TEXT,          // Manually written PRD
}
```

## Next Steps
1. Run `ADD_PRD_TEXT_COLUMN.sql` in Supabase SQL Editor
2. Test form submission with file upload
3. Test form submission with manual text entry
4. Verify admin panel displays both methods correctly

## Files Modified
- ✅ `app/services/inquiry/page.tsx` (already done in previous context)
- ✅ `app/api/inquiries/route.ts`
- ✅ `app/admin/(dashboard)/inquiries/[id]/inquiry-detail.tsx`
- ✅ `ADD_PRD_TEXT_COLUMN.sql` (new file)

## Testing Checklist
- [ ] Run SQL migration
- [ ] Submit inquiry with file upload
- [ ] Submit inquiry with manual text
- [ ] View uploaded file in admin panel
- [ ] View manual text in admin panel
- [ ] Verify toggle clears opposite field
- [ ] Check form persistence saves both methods
