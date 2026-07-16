import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

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

  // Must call getUser() — do NOT use getSession(), it's not safe in middleware
  const { data: { user }, error } = await supabase.auth.getUser()

  // Always allow login page (don't check auth)
  if (pathname === '/admin/login') {
    return supabaseResponse
  }

  // If no user or error, redirect to login
  if (!user || error) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('redirected', 'true')
    return NextResponse.redirect(url)
  }

  // User is authenticated, allow access
  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
