import { createServerClient } from '@supabase/ssr'
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getRealSiteUrl, PRIMARY_PRODUCTION_DOMAIN } from '@/lib/utils/site-url'

/**
 * /auth/confirm
 * Verifies recovery token_hash or PKCE code from Supabase email links.
 * Creates an authenticated recovery session in cookies and redirects to /reset-password.
 *
 * Security:
 * - Uses token_hash + verifyOtp (works cross-device / cross-browser without PKCE verifier state).
 * - Validates `next` destination to block open-redirect attacks.
 * - Enforces Referrer-Policy: no-referrer to keep recovery tokens out of Referer logs.
 * - Preserves hash fragments (#access_token=...) when redirects arrive from Supabase verify.
 * - Guaranteed to redirect only to canonical domain (https://www.asrivotech.in), never *.vercel.app.
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

  // 2. Canonical production site URL (strictly https://www.asrivotech.in)
  const siteUrl = await getRealSiteUrl(request)
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

  // 5. If neither token_hash nor code is in the query params:
  // Supabase's verify endpoint appends session tokens as a URL fragment (#access_token=...).
  // Because HTTP request headers never include URL fragments, we serve a client-side HTML redirector
  // that preserves window.location.hash and forwards the user to /reset-password on the canonical domain!
  if (!token_hash && !code) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting to Password Reset...</title>
    <script>
      (function() {
        var hash = window.location.hash || '';
        var search = window.location.search || '';
        var target = '${siteUrl}/reset-password' + search + hash;
        window.location.replace(target);
      })();
    </script>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #0b0f19; color: #f8fafc;">
    <div style="text-align: center;">
      <p style="font-size: 16px;">Verifying reset link and redirecting...</p>
    </div>
  </body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Referrer-Policy': 'no-referrer',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }

  // 6. If explicit verification error occurred, redirect to /forgot-password?error=expired on canonical domain
  const errorResponse = NextResponse.redirect(
    new URL('/forgot-password?error=expired', siteUrl)
  )
  errorResponse.headers.set('Referrer-Policy', 'no-referrer')
  return errorResponse
}
