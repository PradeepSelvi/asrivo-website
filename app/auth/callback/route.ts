import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/reset-password'

  const cookieStore = await cookies()
  const redirectUrl = new URL(next, requestUrl.origin)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
  }

  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = (requestUrl.searchParams.get('type') as any) || 'recovery'

  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return response
    }
  }

  // If code exchange failed or no code provided, redirect to reset-password with error
  return NextResponse.redirect(
    new URL('/reset-password?error=invalid_link', requestUrl.origin)
  )
}
