# Contact Form & Complaints Feature

## ✅ Features Implemented

### 1. Contact Form with Message Type
- Added **Message Type** dropdown in contact form
- Options: Feedback, Query, Contact, Other
- Stored in database `contacts` table with `type` column
- Visible in admin dashboard

### 2. Raise a Complaint Section
- Added **"Raise a Complaint"** box below send message button
- Requires user authentication (login)
- Redirects to login if not authenticated
- Links to dedicated complaint form at `/complaints/new`

### 3. Complaints System
- **Separate complaints table** in database
- User authentication required to submit complaints
- **Priority levels**: Low, Medium, High, Urgent
- **Status tracking**: New, In Progress, Resolved, Closed
- **Category field** for complaint classification
- Detailed description field for complaint details

### 4. Admin Complaints Dashboard
- New **"Complaints"** menu item in admin sidebar
- View all complaints at `/admin/complaints`
- **Stats cards** showing count by status (New, In Progress, Resolved, Closed)
- **Priority stats** showing count by priority level
- **Table view** with all complaint details
- **Color-coded** priority and status badges

---

## 📁 Files Created

### Database Migration:
- `supabase/migrations/add_contact_type_and_complaints.sql`
  - Adds `type` column to `contacts` table
  - Creates `complaints` table with full schema
  - Sets up RLS policies for user access
  - Enables realtime subscriptions

### API Routes:
- `app/api/complaints/route.ts`
  - GET: Fetch user's own complaints
  - POST: Create new complaint (requires auth)

### Frontend Pages:
- `app/complaints/new/page.tsx`
  - Complaint submission form
  - Auth check and redirect to login
  - Priority selection
  - Category input
  - Detailed description field

### Admin Dashboard:
- `app/admin/(dashboard)/complaints/page.tsx`
  - View all complaints
  - Status and priority statistics
  - Sortable table view
  - Color-coded badges

### Updated Files:
- `app/contact/page.tsx`
  - Added message type dropdown
  - Added "Raise a Complaint" section
  - Updated form submission to include type
- `app/api/contacts/route.ts`
  - Added `type` field handling
- `app/admin/(dashboard)/layout.tsx`
  - Added "Complaints" menu item

---

## 🗄️ Database Schema

### Contacts Table (Updated):
```sql
ALTER TABLE contacts
ADD COLUMN type TEXT DEFAULT 'contact' CHECK (type IN ('feedback', 'query', 'contact', 'other'));
```

### Complaints Table (New):
```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  category TEXT,
  attachments TEXT[],
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 Security & Permissions

### Contacts (No Authentication Required):
- ✅ Anyone can submit contact messages
- ✅ Public form submission
- ✅ Stored with message type

### Complaints (Authentication Required):
- ✅ Must be logged in to submit
- ✅ Users can only view their own complaints
- ✅ RLS policies enforced
- ✅ User ID tracked for all complaints

### Admin Access:
- ✅ Admins can view all complaints
- ✅ Admins can update status
- ✅ Admins can add notes

---

## 🎨 User Flow

### Contact Form Flow:
```
User visits /contact
  ↓
Fills contact form
  ↓
Selects Message Type (Feedback/Query/Contact/Other)
  ↓
Submits → Stored in contacts table with type
  ↓
Admin sees message in /admin/contacts
```

### Complaint Flow:
```
User clicks "Raise a Complaint"
  ↓
NOT logged in? → Redirect to /admin/login
  ↓
Logged in? → Show complaint form at /complaints/new
  ↓
User fills:
  - Subject
  - Category
  - Priority (Low/Medium/High/Urgent)
  - Detailed description
  ↓
Submit → Stored in complaints table
  ↓
Admin sees in /admin/complaints dashboard
```

---

## 🚀 How to Use

### Step 1: Run Database Migration
```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/add_contact_type_and_complaints.sql

-- This will:
-- 1. Add type column to contacts
-- 2. Create complaints table
-- 3. Set up RLS policies
-- 4. Enable realtime
```

### Step 2: Test Contact Form
1. Go to `/contact`
2. Fill out the form
3. Select a **Message Type** (Feedback, Query, Contact, Other)
4. Submit
5. Check `/admin/contacts` to see the type field

### Step 3: Test Complaint System
1. Go to `/contact`
2. Click **"Raise a Complaint (Login Required)"**
3. If not logged in → Redirects to login
4. After login → Shows complaint form
5. Fill out:
   - Subject
   - Category (optional)
   - Priority
   - Description
6. Submit
7. Check `/admin/complaints` to see the complaint

---

## 📊 Admin Dashboard Features

### Complaints Dashboard (`/admin/complaints`):

#### Status Stats:
- 🔴 **New** - Complaints just submitted
- 🟠 **In Progress** - Being investigated
- 🟢 **Resolved** - Issue fixed
- ⚪ **Closed** - Complaint finalized

#### Priority Stats:
- 🔴 **Urgent** - Critical issues
- 🟠 **High** - Important problems
- 🟡 **Medium** - Regular issues
- 🔵 **Low** - General inquiries

#### Table Columns:
1. **User** - Name and email
2. **Subject** - Complaint title
3. **Category** - Classification
4. **Priority** - Urgency level
5. **Status** - Current state
6. **Date** - When submitted
7. **Actions** - View details

---

## 🎯 Message Types in Contacts

| Type | Description | Use Case |
|------|-------------|----------|
| **Feedback** | User feedback about service/product | "Great service, but..." |
| **Query** | Questions or information requests | "How much does X cost?" |
| **Contact** | General contact/introduction | "I'd like to discuss..." |
| **Other** | Miscellaneous messages | Anything else |

---

## 🔄 Complaint Status Workflow

```
NEW
  ↓
IN PROGRESS (Admin investigating)
  ↓
RESOLVED (Issue fixed)
  ↓
CLOSED (Complaint finalized)
```

---

## ✨ Features Highlight

### Contact Form:
- ✅ Message type dropdown
- ✅ Stored in database
- ✅ Visible in admin dashboard
- ✅ No authentication required

### Complaints System:
- ✅ Separate from contact messages
- ✅ Requires user login
- ✅ Priority levels (4 levels)
- ✅ Status tracking (4 states)
- ✅ Category classification
- ✅ Admin dashboard with stats
- ✅ Color-coded UI
- ✅ RLS security

### UI/UX:
- ✅ Clear visual distinction between contact and complaint
- ✅ Auth requirement clearly communicated
- ✅ Smooth redirect flow for login
- ✅ Professional complaint form
- ✅ Comprehensive admin view

---

## 📝 Next Steps (Optional Enhancements)

1. **Complaint Detail Page** (`/admin/complaints/[id]`)
   - View full complaint details
   - Add admin notes
   - Update status
   - Upload attachments

2. **User Dashboard** (`/complaints`)
   - View own complaints
   - Track status
   - Add updates

3. **Email Notifications**
   - Notify admin when complaint submitted
   - Notify user when status changes

4. **Complaint Analytics**
   - Charts showing trends
   - Resolution time metrics
   - Category analysis

---

## 🐛 Troubleshooting

**Complaint form shows "Authentication Required"?**
- User needs to log in
- Use `/admin/login` route
- Or implement separate user registration

**Type not showing in admin contacts?**
- Run the migration SQL
- Check if `type` column exists in database

**Complaints table doesn't exist?**
- Run the migration: `add_contact_type_and_complaints.sql`
- Check Supabase SQL Editor for errors

**RLS blocking complaint submission?**
- Check if user is authenticated
- Verify RLS policies are created
- Check policy: "Users can insert own complaints"

---

## ✅ Testing Checklist

- [ ] Contact form submits with message type
- [ ] Message type visible in admin contacts dashboard
- [ ] Complaint link visible on contact page
- [ ] Clicking complaint link redirects to login (if not logged in)
- [ ] After login, complaint form loads
- [ ] Complaint form submits successfully
- [ ] Complaint appears in admin dashboard
- [ ] Status and priority badges show correct colors
- [ ] Admin can view all complaints
- [ ] Stats cards show correct counts

---

**Status:** ✅ READY TO TEST  
**Database Migration Required:** YES (Run `add_contact_type_and_complaints.sql`)
