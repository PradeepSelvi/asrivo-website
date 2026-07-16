import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip non-admin routes immediately
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow login page without auth check
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

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
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate session and refresh tokens
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if no valid session
  if (!user) {
    const url = new URL('/admin/login', request.url)
    return NextResponse.redirect(url)
  }

  // Return response with refreshed cookies
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
