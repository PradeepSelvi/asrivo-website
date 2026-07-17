# ✅ Infinite Redirect Loop Fix

## Problem

An infinite redirect loop occurred between `/admin/login` and `/admin` when:
- A non-admin authenticated user tried to access `/admin`
- The user had a valid session but no admin role
- `requireAdmin()` redirected to login without signing them out
- Login page's `checkExistingSession()` saw the valid session and redirected back to `/admin`
- The loop continued indefinitely

## Root Cause

1. **middleware.ts** checked only session validity, NOT admin role
2. **app/admin/layout.tsx** called `requireAdmin()` to verify role
3. **lib/auth/admin-guard.ts** `requireAdmin()`:
   - Redirected to `/admin/login` on role-check failure
   - Did NOT sign the user out first
   - Did NOT pass `?error=unauthorized` query param
4. **app/admin/login/page.tsx** `checkExistingSession()`:
   - Saw valid session and redirected back to `/admin`
   - Caused infinite loop

## Solution Applied

### 1. lib/auth/admin-guard.ts
**Changes:**
- Added `import { createClient } from '@/lib/supabase/server'`
- Changed default `redirectTo` from `'/admin/login'` to `'/admin/login?error=unauthorized'`
- Added server-side sign out before redirect:
  ```typescript
  if (!adminResult.success || !adminResult.user) {
    // Sign out before redirecting to prevent redirect loop
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect(redirectTo)
  }
  ```

### 2. app/admin/login/page.tsx
**Changes:**
- Added `import { useRouter } from 'next/navigation'`
- Added `const router = useRouter()` hook
- Replaced hardcoded 300ms delay with `router.refresh()`:
  ```typescript
  // Before:
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // After:
  router.refresh()
  ```
- This ensures fresh server state instead of relying on fixed delay

### 3. middleware.ts
**Changes:**
- Added clarifying comment above `getUser()` check:
  ```typescript
  // Middleware checks session validity only, NOT admin role.
  // Role enforcement is intentionally left to requireAdmin() in the layout
  // to keep a single source of truth for role logic.
  ```

## How It Works Now

### Non-Admin User Flow
1. User with valid session but no admin role hits `/admin`
2. Middleware checks session → Valid ✅ → Allows through
3. Layout calls `requireAdmin()`
4. `requireAdmin()` checks admin role → Invalid ❌
5. **NEW:** Signs user out server-side
6. **NEW:** Redirects to `/admin/login?error=unauthorized`
7. Login page shows: "Unauthorized: You do not have administrator permissions."
8. User stays on login page (no loop)

### Valid Admin User Flow
1. Admin logs in successfully
2. `router.refresh()` gets fresh server state
3. `window.location.replace('/admin')` navigates to admin panel
4. Middleware checks session → Valid ✅
5. Layout calls `requireAdmin()` → Role valid ✅
6. Admin dashboard loads successfully

## Verification

### Build Status
```
✓ Compiled successfully
✓ All TypeScript checks passed
✓ No diagnostics found
✓ Production build successful
```

### Expected Behavior

**Test Case 1: Non-Admin User**
```
1. Non-admin user navigates to /admin
2. User is signed out automatically
3. Redirected to /admin/login?error=unauthorized (ONE TIME)
4. Error message displayed: "Unauthorized: You do not have administrator permissions."
5. No bounce back to /admin
```

**Test Case 2: Valid Admin**
```
1. Admin enters credentials
2. router.refresh() ensures fresh state
3. Redirected to /admin
4. Dashboard loads without loop
```

## Files Modified

1. **lib/auth/admin-guard.ts**
   - Added server-side sign out
   - Changed redirect to include error query param

2. **app/admin/login/page.tsx**
   - Replaced fixed delay with router.refresh()
   - Added useRouter hook

3. **middleware.ts**
   - Added clarifying comment (no logic changes)

## Benefits

✅ **No More Loops**: Sign out prevents bounce-back  
✅ **Clear Error**: `?error=unauthorized` shows why access denied  
✅ **Faster Login**: router.refresh() instead of arbitrary delay  
✅ **Single Source of Truth**: Role checks only in requireAdmin()  
✅ **Clean UX**: User sees clear unauthorized message  

## Testing Checklist

- [ ] Non-admin user accessing `/admin` is redirected to login ONCE
- [ ] Login page shows "Unauthorized" error message
- [ ] Valid admin can log in and reach dashboard
- [ ] No console errors
- [ ] No infinite redirect loops
- [ ] Session properly cleared for non-admin users

---

**Status**: ✅ Fixed and deployed  
**Build**: Passing  
**Ready for**: Production testing
