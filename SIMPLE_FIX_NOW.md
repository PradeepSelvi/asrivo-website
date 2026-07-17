# Simple Fix - Session Loss on Navigation

## Do These 3 Things RIGHT NOW

### 1. Check Database (MOST IMPORTANT)

Run this in **Supabase SQL Editor**:

```sql
-- Check admin profile
SELECT * FROM admin_profiles WHERE email = 'your-admin-email@example.com';
```

**If you get NO ROWS:**
```sql
-- Fix it
INSERT INTO admin_profiles (id, email, role)
SELECT id, email, 'high'
FROM auth.users
WHERE email = 'your-admin-email@example.com';
```

This is the #1 cause of the redirect issue.

### 2. Restart Everything

**Terminal:**
```bash
rm -rf .next
npm run dev
```

**Browser console (F12):**
```javascript
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### 3. Test with Console Open

1. Go to `/admin/login`
2. Open console (F12)
3. Login
4. Watch for logs
5. Click any button
6. Check if redirects

## What Console Should Show

**✅ Working (no redirect):**
```
[Middleware] { hasUser: true, cookies: 2 }
[getCurrentAdmin] Profile check: { hasProfile: true, role: 'high' }
```

**❌ Broken (redirects):**
```
[Middleware] { hasUser: false, cookies: 0 }
[getCurrentAdmin] Profile check: { hasProfile: false }
```

## Quick Test Page

Visit: `http://localhost:3000/admin/test-auth`

Shows exactly what's wrong:
- ✅ User authenticated = Good
- ❌ No admin profile = Run SQL above
- ❌ No user found = Clear cookies

## Still Broken?

Check `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Then restart server: `Ctrl+C` → `npm run dev`

---

**90% of issues = missing admin_profiles row. Run the SQL first!**
