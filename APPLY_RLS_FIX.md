# 🚀 Quick Guide: Apply RLS Security Fix

## ⚠️ IMPORTANT: Read Before Applying

This fix tightens Row Level Security policies for your Supabase database. Make sure you understand the changes before applying.

---

## 📋 Pre-Flight Checklist

- [ ] You have admin access to Supabase dashboard
- [ ] You have backed up your database (or can restore from snapshots)
- [ ] You understand the changes being made
- [ ] You are ready to test after applying

---

## 🎯 Step-by-Step Instructions

### **Step 1: Backup (CRITICAL)**
```bash
# In Supabase Dashboard:
# Settings > Database > Create Backup
# OR use pg_dump if you have direct access
```

### **Step 2: Open SQL Editor**
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### **Step 3: Copy & Paste SQL**
1. Open `DATABASE_SCHEMA_RLS_FIX.sql`
2. Copy ALL the contents
3. Paste into the SQL Editor
4. Click **Run** (or Ctrl+Enter)

### **Step 4: Verify Success**
You should see output like:
```
DROP POLICY
DROP POLICY
CREATE POLICY
CREATE POLICY
...
Success. No rows returned
```

### **Step 5: Test the Policies**

#### Test 1: Public Read Works
```sql
-- Should SUCCEED
SELECT * FROM projects LIMIT 5;
SELECT * FROM services LIMIT 5;
```

#### Test 2: Public Write Blocked
```sql
-- Should FAIL
INSERT INTO projects (title, slug, description, category) 
VALUES ('Hack', 'hack', 'test', 'test');

-- Should FAIL
UPDATE settings SET value = 'hacked' WHERE key = 'company_name';

-- Should FAIL
DELETE FROM services WHERE id = 1;
```

#### Test 3: Form Submissions Work
```sql
-- Should SUCCEED
INSERT INTO contacts (email, name, message) 
VALUES ('test@test.com', 'Test User', 'Test message');
```

#### Test 4: Check Policies Applied
```sql
-- Should return multiple rows for each table
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('audit_logs', 'settings', 'analytics', 'projects')
ORDER BY tablename, cmd;
```

---

## ✅ Expected Results

After applying, you should have:

### **Admin-Only Tables:**
- ✅ `audit_logs` - No client access, admin read-only
- ✅ `analytics` - No client access, admin read-only  
- ✅ `settings` - Public read, admin write

### **Public Tables:**
- ✅ `projects`, `services`, `testimonials` - Read-only for everyone
- ❌ No direct writes allowed from client

### **Form Tables:**
- ✅ `contacts`, `service_inquiries`, `job_applications` - Public can submit
- ✅ Admin can read and update

---

## 🐛 Troubleshooting

### **Error: "policy already exists"**
- **Solution:** Some policies might already exist. Run the DROP commands first, then re-run.

### **Error: "permission denied"**
- **Solution:** Make sure you're using the Supabase SQL Editor as admin, not the anon key.

### **Forms stopped working**
- **Check:** Make sure your API routes use the correct Supabase client (anon key for public, service_role for admin)

### **Can't update settings from admin**
- **Check:** Your middleware is checking `auth.role() = 'authenticated'`. Make sure you're logged in.

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can restore from backup:

```sql
-- In Supabase Dashboard: Settings > Database > Restore Backup
```

Or drop all policies and re-run original schema:

```sql
-- Drop all policies for a table (example)
DROP POLICY IF EXISTS "Admin read only" ON audit_logs;
DROP POLICY IF EXISTS "Block all writes from clients" ON audit_logs;
-- ... repeat for each policy

-- Then re-run original DATABASE_SCHEMA.sql
```

---

## 📞 Need Help?

- Check `RLS_AUDIT_REPORT.md` for detailed explanation
- Review `DATABASE_SCHEMA_RLS_FIX.sql` comments
- Test queries are included in the fix file

---

## ✨ After Applying

1. ✅ Test your website forms still work
2. ✅ Test admin routes require authentication
3. ✅ Verify public pages load correctly
4. ✅ Check that settings API is protected
5. ✅ Monitor for any unusual errors

---

**Ready?** Open `DATABASE_SCHEMA_RLS_FIX.sql` in Supabase SQL Editor and hit Run! 🚀
