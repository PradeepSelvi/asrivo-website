# Bug Analysis: Action Buttons Redirect to Login

## Root Cause Identified

### Problem
When clicking action buttons (save/update/delete), the server actions call `check AuthAndPermission()` which throws an error. **These thrown errors are NOT caught by the server actions**, causing Next.js to treat them as unhandled exceptions, which triggers a redirect to the login page.

### Why This Happens

1. **Middleware** (`middleware.ts`):
   - ✅ Only checks if user session exists
   - ✅ Does NOT check `admin_profiles` table
   - ✅ Does NOT check roles
   - ✅ Correctly allows authenticated requests through

2. **Server Actions** (`lib/supabase/content-actions.ts`):
   - ❌ Call `checkAuthAndPermission()` which **throws errors**
   - ❌ These thrown errors cause server action failure
   - ❌ Next.js interprets server action failures as auth issues
   - ❌ Triggers redirect to `/admin/login`

3. **The Helper Function** (`checkAuthAndPermission`):
```typescript
async function checkAuthAndPermission(requiredRole?: 'high') {
  const authResult = await getCurrentAdmin()
  if (!authResult.success || !authResult.user) {
    throw new Error('Unauthorized: Authentication required')  // ❌ THROWS!
  }
  
  if (requiredRole === 'high' && authResult.user.role !== 'high') {
    throw new Error('Unauthorized: High clearance level required')  // ❌ THROWS!
  }
  
  return authResult.user
}
```

**The issue:** Server actions wrap these in try-catch, but they return `{ success: false, error }` which the UI doesn't handle properly, causing Next.js to redirect.

## Distinction Between Failures

Currently, BOTH failures look identical:
- ❌ Session expired/invalid → throws error → redirect to login
- ❌ Valid session but wrong role → throws error → redirect to login

Should be:
- ✅ Session expired/invalid → redirect to login (correct)
- ✅ Valid session but wrong role → return error response, show "unauthorized" message

## The Fix

### File 1: `lib/supabase/content-actions.ts`

Change the helper function to NOT throw errors for role check failures:

```typescript
// BEFORE (lines 8-20)
async function checkAuthAndPermission(requiredRole?: 'high') {
  const authResult = await getCurrentAdmin()
  if (!authResult.success || !authResult.user) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  if (requiredRole === 'high' && authResult.user.role !== 'high') {
    throw new Error('Unauthorized: High clearance level required')
  }
  
  return authResult.user
}

// AFTER
async function checkAuthAndPermission(requiredRole?: 'high') {
  const authResult = await getCurrentAdmin()
  
  // Only throw for auth failures (session invalid/expired)
  if (!authResult.success || !authResult.user) {
    throw new Error('AUTH_REQUIRED')  // Special code for middleware
  }
  
  // For role check failures, return null (don't throw)
  if (requiredRole === 'high' && authResult.user.role !== 'high') {
    return null  // Indicates insufficient role
  }
  
  return authResult.user
}
```

### File 2: Update ALL delete/create actions to handle null

Example for `deleteProject`:

```typescript
// BEFORE (lines 113-127)
export async function deleteProject(id: string | number) {
  try {
    await checkAuthAndPermission('high') // Only high admins can delete
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/projects')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// AFTER
export async function deleteProject(id: string | number) {
  try {
    const user = await checkAuthAndPermission('high')
    
    // Handle insufficient role
    if (!user) {
      return { 
        success: false, 
        error: 'Unauthorized: High-level admin access required',
        code: 'INSUFFICIENT_ROLE'
      }
    }
    
    const supabase = await createClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/projects')
    return { success: true }
  } catch (error: any) {
    // Only auth errors will reach here
    if (error.message === 'AUTHIQ') {
      return { success: false, error: 'Session expired', code: 'AUTH_EXPIRED' }
    }
    return { success: false, error: error.message }
  }
}
```

Apply same pattern to ALL actions that require 'high' role:
- `createProject`
- `deleteProject`
- `createService`
- `deleteService`
- `createTeamMember`
- `deleteTeamMember`
- `createJobPosting`
- `deleteJobPosting`
- `createTestimonial`
- `deleteTestimonial`
- `deleteContact`
- `deleteInquiry`

### File 3: Update UI to show proper error messages

Example for delete pages:

```typescript
// In app/admin/(dashboard)/projects/[id]/delete/page.tsx
const handleDelete = async () => {
  'use server'
  const result = await deleteProject(id)
  
  if (!result.success) {
    if (result.code === 'INSUFFICIENT_ROLE') {
      // Show unauthorized message, don't redirect
      return redirect('/admin/projects?error=unauthorized')
    }
    if (result.code === 'AUTH_EXPIRED') {
      // Redirect to login only for expired session
      return redirect('/admin/login')
    }
    // Other errors
    return redirect(`/admin/projects?error=${encodeURIComponent(result.error)}`)
  }
  
  redirect('/admin/projects')
}
```

## Summary of Changes

### Minimal Fix (Recommended):

1. **Change `checkAuthAndPermission()` to return `null` for role failures instead of throwing**
2. **Update all high-role actions to check for `null` and return proper error response**
3. **Add error code differentiation** (`AUTH_EXPIRED` vs `INSUFFICIENT_ROLE`)

### What NOT to change:
- ✅ Middleware stays the same (only checks session)
- ✅ Admin guard functions stay the same
- ✅ Login page stays the same

### Files to modify:
1. `lib/supabase/content-actions.ts` - Update helper and ~12 action functions
2. `app/admin/(dashboard)/[entity]/[id]/delete/page.tsx` - Update 6 delete pages
3. `app/admin/(dashboard)/[entity]/new/page.tsx` - Update 4 create pages

## Testing the Fix

1. Login as LOW role admin
2. Try to delete a project (requires HIGH role)
3. **Expected:** Error message "Unauthorized: High-level admin access required"
4. **Should NOT:** Redirect to login page

## Why This is Better

| Scenario | Before | After |
|----------|--------|-------|
| Session expired | Redirect to login ✅ | Redirect to login ✅ |
| Wrong role | Redirect to login ❌ | Show error message ✅ |
| User clarity | Confusing | Clear |
| UX | Poor | Good |
