# Admin Login Infinite Redirect Loop - Debugging Guide

## Problem Overview
After login, browser gets stuck in infinite redirect between `/admin/login` and `/admin`.

## Root Causes Identified

### 1. **Middleware Cookie Handling Issue**
The original middleware had problematic cookie-setting logic:
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({ request }) // ❌ Creates new response
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}
```
This caused session cookies not to persist properly between requests.

**Fixed:** Simplified to only set cookies on the response object.

### 2. **No Session Check on Login Page**
If a user was already authenticated but got redirected to login, they'd be stuck because:
- They're already logged in (session exists)
- Login page doesn't check for existing session
- Dashboard redirects unauthenticated users back to login

**Fixed:** Added `useEffect` to check existing session on mount.

### 3. **Race Condition Between Login and Middleware**
After `signInWithPassword`, navigation happened immediately before cookies propagated.

**Fixed:** Added 100ms delay before navigation to ensure cookie propagation.

## Fixes Applied

### ✅ Fix 1: Middleware Cookie Handling
**File:** `middleware.ts`
- Removed duplicate response creation
- Simplified cookie-setting logic
- Added error capture for `getUser()`

### ✅ Fix 2: Login Page Session Check
**File:** `app/admin/login/page.tsx`
- Added `useEffect` to check for existing session on mount
- Auto-redirects if already authenticated

### ✅ Fix 3: Cookie Propagation Delay
**File:** `app/admin/login/page.tsx`
- Added 100ms delay after login before navigation
- Ensures cookies are set before middleware runs

## Testing Steps

### 1. Clear All Cookies
```javascript
// Run in browser console on /admin/login
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### 2. Test Fresh Login
1. Navigate to `/admin/login`
2. Enter credentials
3. Should redirect to `/admin` dashboard
4. Verify no redirect loop

### 3. Test Existing Session
1. While logged in, navigate to `/admin/login` directly
2. Should auto-redirect to `/admin` (via useEffect check)

### 4. Test Protected Route
1. Clear cookies (logout)
2. Try accessing `/admin/projects` directly
3. Should redirect to `/admin/login?redirected=true`
4. After login, should go to dashboard (not back to projects)

## Remaining Issues to Watch For

### Browser Dev Tools Inspection
Check Network tab during login:
```
1. POST /auth/v1/token (login request)
2. Response should include Set-Cookie headers
3. GET /admin (redirect)
4. Request should include Cookie headers matching step 2
```

If cookies aren't present in step 4, the issue is:
- Browser security settings (SameSite, Secure flags)
- Domain mismatch between Supabase URL and app URL
- Middleware not reading cookies correctly

### Environment Variables
Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Supabase Auth Settings
Check Supabase Dashboard → Authentication → URL Configuration:
- Site URL should match your deployment URL
- Redirect URLs should include your domain

## Additional Debugging

### Enable Supabase Debug Logs
Add to middleware:
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
console.log('[Middleware]', { pathname, user: !!user, error: error?.message })
```

Add to login page:
```typescript
console.log('[Login] Session check:', { user: !!user, error })
```

### Check for Stale Build Cache
```bash
rm -rf .next
npm run build
npm run dev
```

## Quick Fix Checklist

If issue persists:
- [ ] Clear browser cookies completely
- [ ] Restart Next.js dev server
- [ ] Check Network tab for cookie flow
- [ ] Verify middleware is running (check console)
- [ ] Confirm admin_profiles row exists in database
- [ ] Check Supabase project is not paused
- [ ] Verify environment variables are loaded (restart editor if needed)

## Last Resort: Nuclear Option

```bash
# Clear everything
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# In browser
Clear all cookies for localhost
Hard refresh (Ctrl+Shift+R)
```
