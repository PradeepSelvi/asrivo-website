# Fix Cookie Persistence Issue

## Your Situation
✅ Admin profile exists in database (pradeepselvi126@gmail.com)
❌ Session cookies not persisting between page navigations

## The Problem
The middleware and server components are not properly sharing cookie state, causing the session to be lost when clicking buttons.

## Immediate Fix - Do This Now

### Step 1: Verify Current Middleware
The middleware needs to properly handle cookie refreshing. It should already be updated, but let's verify.

### Step 2: Clear Everything
```bash
# Terminal (stop server first with Ctrl+C)
rm -rf .next
npm run dev
```

### Step 3: Clear Browser State
**In browser console (F12) on localhost:3000:**
```javascript
// Clear all
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
sessionStorage.clear();
localStorage.clear();
location.reload();
```

### Step 4: Check Environment Variables
```bash
# Check .env.local exists and has correct values
cat .env.local
```

Must have:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-key]
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-key]
```

**If you changed .env.local, restart the dev server!**

### Step 5: Test with Network Tab Open

1. Go to `http://localhost:3000/admin/login`
2. Open DevTools (F12)
3. Go to **Network** tab
4. Check "Preserve log"
5. Login with: pradeepselvi126@gmail.com
6. After redirect to dashboard, click "Projects"
7. Find the request to `/admin/projects`
8. Click on it → Headers tab → Request Headers

**Look for:**
```
cookie: sb-[project]-auth-token=eyJ...; sb-[project]-auth-token-code-verifier=...
```

**If cookies are MISSING:**
→ This is the problem! Continue to Step 6

**If cookies are PRESENT:**
→ Issue is in server-side code, skip to Step 7

### Step 6: Cookie Missing? Check Browser Settings

**Chrome/Edge:**
1. Settings → Privacy and security
2. Cookies and other site data
3. Make sure NOT set to "Block third-party cookies"
4. Make sure localhost is not in blocked sites

**Firefox:**
1. Settings → Privacy & Security
2. Cookies and Site Data
3. Make sure not blocking cookies

**Alternative: Try Incognito/Private Window**
Sometimes regular windows have stale state.

### Step 7: Check Console Logs

After login and clicking Projects, console should show:

**✅ WORKING:**
```
[Middleware] { 
  pathname: '/admin/projects', 
  hasUser: true, 
  error: undefined, 
  cookies: 2 
}
[getCurrentAdmin] Auth check: { hasUser: true, userId: 'c1f76548...' }
[getCurrentAdmin] Profile check: { hasProfile: true, role: 'high' }
```

**❌ NOT WORKING:**
```
[Middleware] { 
  pathname: '/admin/projects', 
  hasUser: false, 
  error: 'JWT expired', 
  cookies: 0 
}
```

### Step 8: Check Supabase Dashboard

**Authentication → URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: Add `http://localhost:3000/**`

**Save changes if you modified anything**

### Step 9: Test Page

Go to: `http://localhost:3000/admin/test-auth`

Should show:
```
✅ User authenticated
ID: c1f76548-0fd5-4dff-a8fb-29fe0113da6c
Email: pradeepselvi126@gmail.com

✅ Admin profile found
Role: high
```

If it shows ❌ anywhere, that tells you exactly what's wrong.

## Specific Fixes Based on Symptoms

### Symptom: "cookies: 0" in console
**Problem:** Cookies not being set during login

**Fix:**
1. Check using `localhost` not `127.0.0.1`
2. Check `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL
3. Restart dev server
4. Try different browser

### Symptom: "hasUser: false" after login works
**Problem:** Session token not being validated correctly

**Fix:**
1. Check Supabase project is active (not paused)
2. Check internet connection
3. Check no VPN/proxy interfering
4. Try regenerating anon key in Supabase Dashboard

### Symptom: "JWT expired" error
**Problem:** Session tokens expired

**Fix:**
1. Login again (tokens expire after time)
2. Check system clock is correct
3. Session refresh should happen automatically in middleware

### Symptom: Works after login, fails on first click
**Problem:** Middleware not persisting refreshed cookies

**This is the most likely issue based on your description**

**Fix:** The middleware should already be fixed with our updates. Make sure you:
1. Saved middleware.ts with our changes
2. Restarted dev server
3. Cleared .next folder

## Verify Middleware is Correct

Check that `middleware.ts` has this structure:

```typescript
export async function middleware(request: NextRequest) {
  // ... setup code ...
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  // ... rest of code ...
  
  // IMPORTANT: Return supabaseResponse, not a new NextResponse
  return supabaseResponse
}
```

The key is that `setAll` updates `supabaseResponse.cookies`, and we return that same response object.

## Nuclear Option

If NOTHING works:

```bash
# Complete reset
rm -rf .next node_modules package-lock.json .turbo
npm install
npm run dev
```

Then in browser:
- Clear all cookies
- Close ALL browser tabs
- Open fresh tab
- Go to localhost:3000/admin/login
- Login
- Test

## Alternative: Check if it's a Shared Session Issue

Since you mentioned sharing credentials with a friend:

**Are both of you logged in at the same time?**
- You on your computer
- Friend on their computer
- Both using pradeepselvi126@gmail.com

If YES: This can cause session conflicts!

**Test:**
1. Have friend logout completely
2. You clear your cookies
3. You login fresh
4. Test navigation

If it works when only YOU are logged in → That's the issue!

**Solution:** Create separate admin account for your friend.

## Most Likely Solutions

Based on "works at login, fails on first click":

1. **Clear .next and restart** (60% chance this fixes it)
2. **Clear browser cookies** (30% chance)
3. **Check Supabase URL config** (10% chance)

Try them in that order!

## What to Share if Still Broken

1. Screenshot of Network tab showing request headers for `/admin/projects`
2. Screenshot of console showing all logs during navigation
3. Screenshot of `/admin/test-auth` page
4. Output of: `cat .env.local` (hide actual keys)

This will let me pinpoint the exact issue.
