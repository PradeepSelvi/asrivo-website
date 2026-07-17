# Token Refresh Race Condition Fix

## Problem
`AuthApiError: Invalid Refresh Token: Already Used` errors occurring in production due to multiple parallel requests attempting to refresh the same Supabase auth token simultaneously.

## Root Cause
When the admin dashboard loads, it makes multiple parallel API calls (projects, contacts, inquiries, etc.). Each request was independently trying to refresh the auth token, causing race conditions where the same refresh token was used multiple times, violating Supabase's token rotation security.

## Solution Implemented

### 1. **Disabled Auto-Refresh in Server Components** (`lib/supabase/server.ts`)
```typescript
auth: {
  autoRefreshToken: false,  // Disable automatic refresh
  persistSession: false,     // Don't persist in server context
  detectSessionInUrl: false, // Not needed server-side
}
```
This ensures that only the middleware handles token refreshing, preventing race conditions from multiple server components.

### 2. **Improved Middleware Error Handling** (`middleware.ts`)
- Added specific handling for refresh token errors
- Clears auth cookies when token errors occur
- Prevents cascading failures by catching and handling token errors gracefully

### 3. **Optimized Dashboard Queries** (`app/admin/(dashboard)/page.tsx`)
- Changed from sequential queries to `Promise.all()` with a single Supabase client instance
- Reduced the number of independent token refresh attempts
- Improved performance by parallelizing queries efficiently

## How It Works Now

1. **Middleware** is the **single source of truth** for token refreshing
   - All admin routes pass through middleware first
   - Middleware calls `getUser()` which handles token refresh if needed
   - Updated tokens are set in cookies for all subsequent requests

2. **Server Components** use tokens from cookies **without refreshing**
   - They trust the middleware has already refreshed tokens
   - Multiple parallel queries don't trigger multiple refresh attempts

3. **Error Recovery** is handled gracefully
   - Token errors redirect to login
   - Stale tokens are cleared automatically
   - Users get a clean re-authentication flow

## Testing
After deployment:
1. Login to admin dashboard
2. Navigate through different admin pages
3. Let the session idle for 50+ minutes
4. Refresh and verify no token errors
5. Check browser console for any auth errors

## Expected Behavior
- ✅ No "Invalid Refresh Token" errors
- ✅ Smooth navigation between admin pages
- ✅ Automatic session refresh in middleware
- ✅ Clean redirect to login when sessions expire
- ✅ Single token refresh per request cycle

## Additional Notes
- This is a common issue with Supabase SSR in Next.js App Router
- The fix follows Supabase's recommended patterns for server-side auth
- Middleware-only token refresh is the best practice for preventing race conditions
