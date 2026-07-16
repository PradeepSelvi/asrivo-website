# URGENT: Admin Session Loss Fix

## Problem
Users can log in successfully but when clicking any button or navigating to another admin page, they get redirected back to login.

## Root Cause
The middleware is checking auth on every request, but the session cookies aren't being refreshed/persisted properly across page navigations.

## Immediate Fix Applied

Updated `middleware.ts` to add debug logging and ensure cookies are properly returned.

## For Your Friend to Test NOW

### Step 1: Clear Everything
```bash
# In terminal
rm -rf .next
npm run dev
```

### Step 2: Clear Browser Cookies
Open browser console (F12) and run:
```javascript
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Step 3: Check Database
Run this SQL in Supabase SQL Editor (replace email):
```sql
-- Check if admin profile exists
SELECT * FROM admin_profiles WHERE email = 'friend@email.com';

-- If empty, add them:
INSERT INTO admin_profiles (id, email, role)
SELECT 
  id, 
  email, 
  'low'  -- or 'high' for full access
FROM auth.users 
WHERE email = 'friend@email.com';
```

### Step 4: Test Login Flow
1. Go to `/admin/login`
2. Login with credentials
3. **Open Network tab in DevTools**
4. Click any button (like "Projects" in sidebar)
5. Watch the Network tab:
   - Should see cookies in **Request Headers**
   - Should NOT redirect to login

### Step 5: Check Console Logs
During navigation, you should see in console:
```
[Middleware] { pathname: '/admin/projects', hasUser: true, error: undefined, cookies: 2 }
```

If you see `hasUser: false`, that's the problem.

## Common Issues & Fixes

### Issue 1: "hasUser: false" in console
**Cause:** No admin_profiles row exists
**Fix:** Run the SQL INSERT above

### Issue 2: Cookies count is 0
**Cause:** Cookies not being set during login
**Fix:** 
1. Check `.env.local` has correct Supabase URL/keys
2. Restart dev server after changing .env.local
3. Clear cookies and re-login

### Issue 3: "redirected=true" in URL
**Cause:** Middleware thinks user is not authenticated
**Fix:**
- Check Network tab → Does request have Cookie headers?
- If no: Browser blocking cookies (check browser settings)
- If yes: Admin profile missing (run SQL above)

### Issue 4: Works after login but fails on navigation
**Cause:** Cookies not persisting between requests
**Fix:**
1. Check if running on HTTPS in production (Supabase requires it)
2. In development, make sure using `localhost` not `127.0.0.1`
3. Check Supabase Dashboard → Authentication → URL Configuration:
   - Site URL should match your URL exactly
   - Add redirect URL: `http://localhost:3000/**` (dev)

## Debug Mode

The middleware now logs every request in development mode. Watch the console:

```
[Middleware] { 
  pathname: '/admin/projects', 
  hasUser: true,           ← Should be true
  error: undefined,        ← Should be undefined
  cookies: 2               ← Should be 2 or more
}
```

## Environment Check

Make sure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**CRITICAL:** After changing `.env.local`, you MUST restart the dev server!

## Quick Test Script

Have your friend run this in browser console while on `/admin`:
```javascript
// Test if session exists
const testSession = async () => {
  const { createBrowserClient } = await import('@supabase/ssr');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('Session:', session ? 'EXISTS' : 'MISSING');
  console.log('User:', session?.user?.email);
  console.log('Error:', error?.message);
  
  const cookies = document.cookie.split(';')
    .filter(c => c.trim().startsWith('sb-'));
  console.log('Supabase cookies:', cookies.length);
};

testSession();
```

Expected output:
```
Session: EXISTS
User: friend@email.com
Error: undefined
Supabase cookies: 2
```

If you see:
```
Session: MISSING
```

Then cookies were never set during login.

## Still Not Working?

### Last Resort: Manual Token Check

1. Login successfully
2. Open DevTools → Application tab → Cookies
3. Look for cookies starting with `sb-`
4. Do they exist? 
   - **YES** → Check admin_profiles table
   - **NO** → Supabase client config issue

### Nuclear Option

```bash
# Clear everything
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Clear browser
Clear all site data in DevTools → Application → Clear storage
```

## Contact Info for Debug

If still broken, collect this info:
1. Screenshot of Network tab during navigation
2. Screenshot of Console tab showing middleware logs
3. Screenshot of Application tab → Cookies
4. Output of the test script above
5. Result of SQL query checking admin_profiles

This will help diagnose the exact issue.
