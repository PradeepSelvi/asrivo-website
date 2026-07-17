# Admin Login Infinite Redirect Loop - Fix Summary

## 🔍 Problem Identified

Your teammate experienced an infinite redirect loop between `/admin/login` → `/admin` → `/admin/login` after entering valid credentials.

## 🎯 Root Causes

1. **Middleware Cookie Handling Bug**: The `setAll()` function was creating duplicate response objects, causing session cookies not to persist properly
2. **No Existing Session Check**: Login page didn't check for existing sessions, causing loops for already-authenticated users
3. **Cookie Propagation Race Condition**: Immediate navigation after login didn't give cookies time to persist

## ✅ Fixes Applied

### Fix #1: Middleware Cookie Handling (`middleware.ts`)
**Before:**
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({ request }) // ❌ Creates new response!
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
```

**After:**
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
```

**Also added error handling:**
```typescript
const { data: { user }, error } = await supabase.auth.getUser()

// If no user or error, redirect to login
if (!user || error) {
  const url = new URL('/admin/login', request.url)
  url.searchParams.set('redirected', 'true')
  return NextResponse.redirect(url)
}
```

### Fix #2: Existing Session Check (`app/admin/login/page.tsx`)
Added a `useEffect` hook that runs on mount:
```typescript
React.useEffect(() => {
  const checkExistingSession = async () => {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (user) {
      const result = await verifyAdminProfile(user.id)
      if (result.success) {
        window.location.href = '/admin'
      } else {
        await supabase.auth.signOut()
      }
    }
  }
  
  checkExistingSession()
}, [])
```

### Fix #3: Cookie Propagation Delay (`app/admin/login/page.tsx`)
Added 100ms delay before navigation:
```typescript
// Step 3: Session is set in browser, navigate to admin
// Use a short delay to ensure cookie propagation
await new Promise(resolve => setTimeout(resolve, 100))
window.location.href = '/admin'
```

### Fix #4: Debug Logging
Added development-mode console logs to trace auth flow:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[Admin Login] Attempting sign in for:', email)
}
```

## 🧪 Testing Instructions

### Step 1: Clear Everything
```bash
# Terminal
rm -rf .next
npm run dev

# Browser Console (on /admin/login)
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Step 2: Test Fresh Login
1. Navigate to `http://localhost:3000/admin/login`
2. Open browser DevTools → Console tab (you'll see debug logs)
3. Open Network tab
4. Enter admin credentials and submit
5. Watch console for:
   ```
   [Admin Login] Attempting sign in for: admin@example.com
   [Admin Login] Auth successful, verifying admin profile
   [Admin Login] Admin verified, redirecting to dashboard
   ```
6. Should redirect to `/admin` dashboard (no loop!)

### Step 3: Test Existing Session
1. While logged in to dashboard, manually navigate to `/admin/login`
2. Watch console - should see:
   ```
   [Admin Login] Session check on mount: { hasUser: true, userId: 'xxx' }
   [Admin Login] Already authenticated, redirecting to dashboard
   ```
3. Should immediately redirect back to `/admin`

### Step 4: Test Protected Route Access
1. Sign out (or clear cookies)
2. Try accessing `/admin/projects` directly
3. Should redirect to `/admin/login?redirected=true`
4. Login should work and land you on dashboard

### Step 5: Network Tab Verification
During login, verify this sequence in Network tab:
```
1. POST https://[project].supabase.co/auth/v1/token
   Response Headers should include:
   - set-cookie: sb-[project]-auth-token=...
   - set-cookie: sb-[project]-auth-token-code-verifier=...

2. GET http://localhost:3000/admin
   Request Headers should include:
   - cookie: sb-[project]-auth-token=...
```

If cookies are missing in step 2, that's your problem.

## 🚨 Troubleshooting

### Issue: Still getting redirect loop

**Check 1: Environment Variables**
```bash
# .env.local must have these
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

After changing .env.local, **restart the dev server**!

**Check 2: Database**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM admin_profiles WHERE email = 'your-admin@email.com';
```
Must return a row with `role` = 'high' or 'low'

**Check 3: Browser Cookies**
- Open DevTools → Application tab → Cookies
- Look for cookies starting with `sb-`
- If they're missing after login, the issue is:
  - Supabase URL mismatch
  - Browser blocking third-party cookies
  - HTTPS/HTTP mismatch

**Check 4: Supabase Project Settings**
Go to Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (dev) or your production URL
- Redirect URLs: Add `http://localhost:3000/**` (dev)

### Issue: "Unauthorized" after successful login

This means the user authenticated but doesn't have an `admin_profiles` row.

**Fix:**
```sql
-- Replace with actual user ID from auth.users
INSERT INTO admin_profiles (id, email, role)
VALUES (
  'user-uuid-here',
  'admin@example.com',
  'high'
);
```

### Issue: Middleware not running

Check that `middleware.ts` is in the **root** of your project (next to `app/` folder, not inside it).

```
project-root/
├── app/
├── middleware.ts  ← Must be here
├── package.json
└── ...
```

## 📋 Quick Diagnostic Script

Open browser console on `/admin/login` and run:
```javascript
// Copy and paste the entire content of scripts/test-admin-auth.js
```

Or load it directly:
```html
<!-- Add to app/admin/login/page.tsx temporarily -->
<script src="/scripts/test-admin-auth.js"></script>
```

## 🎯 What Changed vs. Previous Fix

You mentioned fixing this before. The key differences in this fix:

1. **Simplified cookie handling** - removed the duplicate `NextResponse.next()` call
2. **Added session check on mount** - prevents loops for already-authenticated users  
3. **Added error handling** - middleware now catches `getUser()` errors
4. **Added cookie propagation delay** - gives browser time to persist cookies
5. **Added comprehensive logging** - easier to diagnose future issues

## 💡 Prevention Tips

1. **Never manually edit auth cookies** - let Supabase handle them
2. **Always restart dev server** after changing `.env.local`
3. **Clear cookies when switching branches** that have auth changes
4. **Use the debug script** (`test-admin-auth.js`) when issues arise
5. **Check Network tab first** - cookies tell the story

## ✅ Commit This Fix

```bash
git add middleware.ts app/admin/login/page.tsx ADMIN_LOGIN_FIX_SUMMARY.md
git commit -m "fix: resolve infinite redirect loop on admin login

- Simplified middleware cookie handling (removed duplicate response creation)
- Added existing session check on login page mount
- Added 100ms delay for cookie propagation before navigation
- Added error handling for auth.getUser() in middleware
- Added development-mode debug logging for auth flow"
```

## 📚 Reference Files

- `middleware.ts` - Fixed cookie handling
- `app/admin/login/page.tsx` - Added session check + delay
- `ADMIN_LOGIN_DEBUG.md` - Detailed debugging guide
- `scripts/test-admin-auth.js` - Browser diagnostic tool

---

**Status:** ✅ Ready to test
**Estimated fix time:** 5 minutes to test
**Risk:** Low (only affects auth flow, easily reversible)
