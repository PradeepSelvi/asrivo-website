# 📋 Insert Team Members into Database

## Quick Start (2 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in left sidebar

### Step 2: Run the SQL Script
1. Click **New Query**
2. Open file: `supabase/migrations/insert_team_members.sql`
3. Copy all the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Step 3: Verify
You should see output showing:
- ✅ 10 team members inserted
- ✅ 5 Management team members
- ✅ 5 Development team members

---

## 👥 Team Members Being Added

### Management Team (5 members):
1. **Aswin K A** - Management Head & HR Manager
2. **Siranjeevi B.U** - Digital Marketing (SEO, SMO)
3. **M.Pradeep Kumar.DCSE** - Legal & Chief Technical Officer
4. **Sargunan J.S** - Chief Operating Officer
5. **Krishan Kumar B.K** - Project Manager

### Development Team (5 members):
1. **sivaganesh.J** - Team Lead, Database, Backend
2. **KARTHIK RAJALEE.S** - Cloud Service Developer, SOC
3. **YOGESHWARAN.R** - DevOps, A/B Testing, Database
4. **THAMARAI SELVAN** - Full Stack Developer
5. **HARI HARAN T.G** - Full Stack Developer

---

## 🎯 What Each Member Has

For each team member, we're adding:
- ✅ Full name
- ✅ Position/title
- ✅ Bio/description
- ✅ Profile photo path (from `/team/` folder)
- ✅ Email address
- ✅ LinkedIn profile URL
- ✅ GitHub profile URL
- ✅ Featured flag (shows on homepage)
- ✅ Active flag (visible on public site)
- ✅ Display order (for sorting)

---

## 📊 Database Table: `team_members`

```sql
team_members
├── id (auto-generated)
├── name
├── position
├── bio
├── image_url
├── email
├── social_links (JSON: { linkedin, github })
├── featured (boolean)
├── active (boolean)
├── display_order (integer)
├── created_at
└── updated_at
```

---

## ✅ After Running the Script

### Test on Website:
1. **Homepage** (`/`) - Should show 6 featured team members
2. **Full Team Page** (`/team`) - Should show all 10 members separated into:
   - Management Team section (5 members)
   - Development Team section (5 members)

### Test in Admin Panel:
1. Go to `/admin/team`
2. You should see all 10 team members
3. Click any member to edit
4. Drag to reorder
5. Toggle "Featured" checkbox to control homepage display
6. Toggle "Active" checkbox to hide/show on public site

---

## 🔧 Customizing After Insert

### To Add More Members:
1. Go to `/admin/team`
2. Click "Add Member"
3. Fill in details
4. Click "Save"

### To Edit Existing Members:
1. Go to `/admin/team`
2. Click on any member card
3. Update details
4. Click "Save"

### To Change Homepage Featured Members:
1. Go to `/admin/team`
2. Click member to edit
3. Toggle "Featured" checkbox
4. Save
5. Homepage will immediately show/hide that member

### To Hide a Member from Public Site:
1. Go to `/admin/team`
2. Click member to edit
3. Toggle "Active" checkbox to OFF
4. Save
5. Member won't appear on public site anymore

---

## 📝 Notes

### Featured Flag:
- `featured = true` → Shows on homepage preview (max 6 members)
- `featured = false` → Only shows on full team page

### Active Flag:
- `active = true` → Visible on public website
- `active = false` → Hidden from public (but visible in admin panel)

### Display Order:
- Management team: 1-9
- Development team: 10-19
- Lower numbers appear first
- Drag-and-drop in admin panel automatically updates this

---

## 🎨 Image Files Required

Make sure these image files exist in your `public/team/` folder:

**Management:**
- `aswin.jpeg`
- `siranjeevi.jpeg`
- `pradeepkumar.jpeg`
- `sargunan.jpeg`
- `KRISHNAKUMAR.jpeg`

**Development:**
- `sivaganesh j.jpeg`
- `karthik rajalee.jpeg`
- `yogeshwaran.jpeg`
- `thamaraiselvan.jpeg`
- `hariharan.jpeg`

If any images are missing, the component will show initials instead (e.g., "AK" for Aswin K A).

---

## 🚨 Troubleshooting

### Issue: "relation team_members does not exist"
**Solution:** The `team_members` table hasn't been created yet. Check your database migrations or create it manually.

### Issue: "duplicate key value violates unique constraint"
**Solution:** Members already exist. Either:
- Skip the insert (they're already there!)
- Or uncomment the `TRUNCATE` line at the top of the SQL file to clear and re-insert

### Issue: Images not showing
**Solution:** 
1. Check if image files exist in `public/team/` folder
2. Check image file names match exactly (case-sensitive)
3. If missing, component will show initials as fallback

### Issue: Members not appearing on homepage
**Solution:**
1. Check `featured = true` in database
2. Check `active = true` in database
3. Clear browser cache and refresh

---

## ✨ You're Done!

Once you run the SQL script:
- ✅ All 10 team members are in the database
- ✅ Homepage shows featured members
- ✅ Full team page shows all active members
- ✅ Admin panel can manage everything

**Your team section is now fully dynamic and manageable!** 🎉
