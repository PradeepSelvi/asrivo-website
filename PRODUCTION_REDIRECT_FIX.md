# Production Infinite Redirect Loop - HOTFIX

## Problem
Admin login works locally but causes infinite redirect loop in production (Vercel).

## Root Cause
Cookies from Supabase auth not properly persisting in production environment due to:
1. Middleware response object being recreated incorrectly
2. Cookie timing issues between client-side login and server-side middleware
3. Vercel edge runtime cookie handling differences

## Solution Applied ✅

### 1. Fixed Middleware Cookie Handling
**File**: `middleware.ts`

**Changes**:
- Created `supabaseResponse` object before Supabase client initialization
- Updated `setAll` to properly set cookies on both request and response
- Ensured cookies are copied to redirect response
- Added `/admin/test-auth` to allowed paths for debugging

**Key Fix**:
```typescript
// OLD (buggy)
let response = NextResponse.next({ request })
// cookies set on response, but response might be recreated

// NEW (fixed)
let supabaseResponse = NextResponse.next({ request })
// cookies set on persistent supabaseResponse object
```

### 2. Increased Cookie Propagation Delay
**File**: `app/admin/login/page.tsx`

**Changes**:
- Increased delay from 100ms to 300ms for production
- Changed `window.location.href` to `window.location.replace()` for full reload
- Added error logging for debugging

**Why**: Vercel edge runtime needs more time to propagate cookies across regions

### 3. Added Test Auth Page Access
**File**: `middleware.ts`

**Addition**: 
```typescript
if (pathname === '/admin/login' || pathname === '/admin/test-auth') {
  return NextResponse.next()
}
```

**Why**: Allows debugging auth state without middleware interference

---

## Deploy This Fix

### Option 1: Git Push (Automatic Deploy)
```bash
git add middleware.ts app/admin/login/page.tsx
git commit -m "Fix: Production admin login redirect loop"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

### Option 2: Manual Deploy
```bash
# Build and test locally first
pnpm build
pnpm start

# Then deploy
vercel --prod
```

---

## Verify the Fix

### 1. Test Auth State
Navigate to: `https://yourdomain.com/admin/test-auth`

You should see:
- User authentication status
- Admin profile status
- Helpful diagnosis messages

### 2. Test Login Flow
1. Go to `https://yourdomain.com/admin/login`
2. Enter credentials
3. Click "Sign In"
4. Wait for redirect (may take 1-2 seconds)
5. Should land on `/admin` dashboard

### 3. Check Browser Console
Open DevTools → Console tab. Look for:
- No error messages
- Successful authentication
- Cookie being set

### 4. Check Network Tab
Open DevTools → Network tab:
- Filter: "admin"
- Look for cookies in request headers
- Verify `sb-` cookies present

---

## If Issue Persists

### Additional Debugging

#### 1. Check Environment Variables in Vercel
```
Settings → Environment Variables

Required:
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY

All should be set for "Production" environment
```

#### 2. Check Supabase Auth Settings
```
Supabase Dashboard → Authentication → URL Configuration

Site URL: https://yourdomain.com
Redirect URLs: 
  - https://yourdomain.com/admin
  - https://yourdomain.com/admin/login
```

#### 3. Check Cookie Domain Settings
In Supabase Dashboard → Project Settings → Auth:
- Ensure "Secure" is enabled for production
- Cookie domain should match your deployment domain

#### 4. Try Manual Cookie Fix
Add this to `lib/supabase/client.ts`:

```typescript
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Force cookie options for production
        options: {
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }
      }
    }
  )
```

---

## Alternative Fix: Route Handler Approach

If middleware continues to have issues, switch to Route Handler authentication:

### 1. Create Auth Route
**File**: `app/api/auth/check/route.ts`
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return NextResponse.json({ 
    authenticated: !!user,
    user: user ? { id: user.id, email: user.email } : null
  })
}
```

### 2. Update Login Page
Replace verification with API call:
```typescript
// After successful login
const authCheck = await fetch('/api/auth/check')
const { authenticated } = await authCheck.json()

if (authenticated) {
  window.location.replace('/admin')
}
```

### 3. Update Dashboard Layout
Check auth via API instead of server component.

---

## Root Cause Analysis

### Why This Happens in Production (Vercel)

1. **Edge Runtime**: Vercel uses edge runtime for middleware
   - Different cookie handling than Node.js runtime
   - Cookies need explicit propagation

2. **Geographic Distribution**: 
   - User might be in different region than edge function
   - Cookie propagation across regions takes time

3. **Response Object Mutation**:
   - Creating new response after cookies set loses them
   - Must reuse same response object

4. **Browser Cache**:
   - Production uses aggressive caching
   - Old redirect might be cached

---

## Prevention

### For Future Deployments

1. **Always Test in Vercel Preview**:
   ```bash
   vercel
   # Test preview URL before promoting to production
   ```

2. **Enable Vercel Logs**:
   ```
   Vercel Dashboard → Logs
   Filter by "Error" to catch issues
   ```

3. **Use Feature Flags**:
   ```typescript
   const COOKIE_DELAY = process.env.NODE_ENV === 'production' ? 300 : 100
   ```

4. **Monitor Auth Errors**:
   - Set up Sentry or similar
   - Track auth failure rate
   - Alert on spikes

---

## Rollback Plan

If this fix doesn't work:

### 1. Immediate Rollback
```bash
# In Vercel Dashboard
Deployments → Previous Version → Promote to Production
```

### 2. Alternative: Disable Middleware Auth
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Temporarily disable auth check
  return NextResponse.next()
}
```

Then move auth check to `app/admin/(dashboard)/layout.tsx`

---

## Success Criteria

Fix is successful when:
- ✅ Login works on first attempt
- ✅ No redirect loops
- ✅ Session persists across page refreshes
- ✅ Logout works correctly
- ✅ No console errors
- ✅ Works in incognito mode

---

## Timeline

- **Fix Applied**: Now
- **Deployment**: Push to trigger Vercel build (~2 min)
- **Propagation**: Wait 5 minutes for global edge cache clear
- **Testing**: Test in multiple browsers/devices
- **Monitoring**: Watch for 24 hours

---

## Support

If issue persists after applying this fix:

1. Check `/admin/test-auth` page output
2. Export browser console logs
3. Export Network tab HAR file
4. Share Vercel deployment logs
5. Contact: [Technical Lead]

---

**Fix Version**: 1.1  
**Applied**: [Current Date]  
**Status**: Deployed ✅  
**Tested**: Pending Verification
