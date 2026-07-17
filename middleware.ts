import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security: Block common attack paths
  const blockedPaths = [
    '/wp-admin',
    '/wp-login',
    '/.env',
    '/.git',
    '/admin.php',
    '/phpmyadmin',
  ]
  
  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Skip non-admin routes immediately
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow login page and test-auth without auth check
  if (pathname === '/admin/login' || pathname === '/admin/test-auth') {
    return NextResponse.next()
  }

  // Create response FIRST
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on request for immediate availability
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Set cookies on response for persistence
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Middleware checks session validity only, NOT admin role.
  // Role enforcement is intentionally left to requireAdmin() in the layout
  // to keep a single source of truth for role logic.
  // CRITICAL: Call getUser() to refresh session
  const { data: { user }, error } = await supabase.auth.getUser()

  // Handle token refresh errors gracefully
  if (error) {
    // If it's a refresh token error, clear session and redirect to login
    if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
      const loginUrl = new URL('/admin/login', request.url)
      const redirectResponse = NextResponse.redirect(loginUrl)
      
      // Clear all auth cookies
      const authCookieNames = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token'
      ]
      
      authCookieNames.forEach(name => {
        redirectResponse.cookies.delete(name)
      })
      
      return redirectResponse
    }
    
    // For other errors, also redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to login if no valid session
  if (!user) {
    const loginUrl = new URL('/admin/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    
    // Copy any cookies from supabaseResponse to redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie)
    })
    
    return redirectResponse
  }

  // Return response with refreshed session cookies
  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
