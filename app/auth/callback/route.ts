import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getRealSiteUrl, PRIMARY_PRODUCTION_DOMAIN } from '@/lib/utils/site-url'

/**
 * /auth/callback
 * Handles OAuth, PKCE exchange, and email confirmation callbacks.
 * 
 * Security:
 * - Resolves canonical site URL dynamically (strictly https://www.asrivotech.in, never *.vercel.app).
 * - Sanitizes `next` target to prevent open redirect vulnerabilities (CWE-601).
 * - Enforces Referrer-Policy: no-referrer.
 * - Preserves hash fragments (#access_token=...) when redirects arrive from Supabase verify.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = (requestUrl.searchParams.get('type') as any) || 'recovery'

  // 1. Sanitize `next` destination to block open-redirect attacks
  let next = requestUrl.searchParams.get('next') || '/reset-password'
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('://')) {
    next = '/reset-password'
  }

  // 2. Canonical production domain resolution (strictly https://www.asrivotech.in)
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

  // 3. Handle PKCE authorization code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return response
    }
    console.error('[AuthCallback] Code exchange error:', error.message)
  }

  // 4. Handle recovery / magic link token_hash verification
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return response
    }
    console.error('[AuthCallback] OTP verification error:', error.message)
  }

  // 5. If neither code nor token_hash is present, forward client to /reset-password preserving hash
  if (!code && !token_hash) {
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
      <p style="font-size: 16px;">Verifying session and redirecting...</p>
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

  // 6. On explicit failure, redirect to /reset-password with error notice on canonical domain
  const errorResponse = NextResponse.redirect(
    new URL('/reset-password?error=invalid_link', siteUrl)
  )
  errorResponse.headers.set('Referrer-Policy', 'no-referrer')
  return errorResponse
}
