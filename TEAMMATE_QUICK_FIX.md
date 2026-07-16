# Quick Fix for Admin Login Loop 🚀

Hey! If you're experiencing the infinite redirect loop on admin login, follow these steps:

## ⚡ Quick Fix (5 minutes)

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Clear Build Cache
```bash
rm -rf .next
npm install  # Just in case
npm run dev
```

### 3. Clear Browser Cookies
Open browser console (F12) on `http://localhost:3000/admin/login` and run:
```javascript
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### 4. Test Login
1. Go to `/admin/login`
2. Enter your credentials
3. Submit
4. Should redirect to dashboard (no loop!)

## 🔍 If Still Not Working

### Check 1: Environment Variables
Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-key]...
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-key]...
```

**Important:** After changing `.env.local`, restart the dev server!

### Check 2: Database Access
Ask whoever set up the database to verify you have an admin profile:
```sql
SELECT * FROM admin_profiles WHERE email = 'your-email@example.com';
```

You should see a row with `role` = 'high' or 'low'

### Check 3: Watch the Console
During login, you should see these logs in browser console:
```
[Admin Login] Attempting sign in for: your-email@example.com
[Admin Login] Auth successful, verifying admin profile  
[Admin Login] Admin verified, redirecting to dashboard
```

If you see errors, share them with the team.

### Check 4: Network Tab
Open DevTools → Network tab during login:
1. Look for POST to `/auth/v1/token`
2. Check response has `set-cookie` headers
3. Next request to `/admin` should include those cookies

If cookies are missing in step 3, that's the issue.

## 🆘 Still Stuck?

Run this diagnostic script in browser console:
```javascript
// Copy-paste content from scripts/test-admin-auth.js
```

Then share the output with the team.

## 🔧 What Was Fixed

The issue was in the middleware cookie handling - it was creating duplicate response objects causing session cookies not to persist. The fix:

1. ✅ Simplified middleware cookie logic
2. ✅ Added session check on login page
3. ✅ Added delay for cookie propagation
4. ✅ Added better error handling

## 💡 Pro Tips

- Clear cookies whenever you pull auth-related changes
- Restart dev server after changing `.env.local`
- Use Network tab to debug cookie issues
- When in doubt, clear everything and start fresh

---

**Need more detail?** See `ADMIN_LOGIN_FIX_SUMMARY.md`

**Want to debug deeper?** See `ADMIN_LOGIN_DEBUG.md`
