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

  // CRITICAL: Call getUser() to refresh session
  const { data: { user }, error } = await supabase.auth.getUser()

  // Redirect to login if no valid session
  if (!user || error) {
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
