import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getSiteUrl } from '@/lib/utils/site-url'

/**
 * /auth/confirm
 * Verifies recovery token_hash or PKCE code from Supabase email links.
 * Creates an authenticated recovery session in cookies and redirects to /reset-password.
 *
 * Security:
 * - Uses token_hash + verifyOtp (works cross-device / cross-browser without PKCE verifier state).
 * - Validates `next` destination to block open-redirect attacks.
 * - Enforces Referrer-Policy: no-referrer to keep recovery tokens out of Referer logs.
 * - Redirects to /forgot-password?error=expired on any validation failure.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') as EmailOtpType | null) || 'recovery'
  const code = searchParams.get('code')

  // 1. Validate `next` destination against open redirect attacks
  let next = searchParams.get('next') || '/reset-password'
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('://')) {
    next = '/reset-password'
  }

  // 2. Canonical env-driven redirect target
  const siteUrl = getSiteUrl()
  const redirectUrl = new URL(next, siteUrl)
  const response = NextResponse.redirect(redirectUrl)
  response.headers.set('Referrer-Policy', 'no-referrer')

  const cookieStore = await cookies()

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

  // 3. Primary recovery mechanism: token_hash + verifyOtp
  // Cross-browser & mobile friendly (does not require local PKCE code verifier)
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      type: type || 'recovery',
      token_hash,
    })

    if (!error) {
      return response
    }
    console.error('[AuthConfirm] OTP verification error:', error.message)
  }

  // 4. Secondary support: PKCE authorization code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
    console.error('[AuthConfirm] Code exchange error:', error.message)
  }

  // 5. On failure, redirect to /forgot-password with explicit expired notice
  const errorResponse = NextResponse.redirect(
    new URL('/forgot-password?error=expired', siteUrl)
  )
  errorResponse.headers.set('Referrer-Policy', 'no-referrer')
  return errorResponse
}
