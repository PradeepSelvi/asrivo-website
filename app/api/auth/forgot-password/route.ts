import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { forgotPasswordSchema } from '@/lib/utils/validation'
import { forgotPasswordRateLimit, getClientIdentifier } from '@/lib/utils/rate-limit'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { getSiteUrl } from '@/lib/utils/site-url'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Please enter a valid email address.',
        },
        { status: 400 }
      )
    }

    const email = validation.data.email.trim().toLowerCase()
    const clientIp = getClientIdentifier(request)

    // 1. Rate limiting: 5 per hour per IP and per email (prevents brute-force and email flooding)
    const ipLimit = await applyRateLimit(request, forgotPasswordRateLimit, `fp_ip:${clientIp}`)
    if (ipLimit) return ipLimit

    const emailLimit = await applyRateLimit(request, forgotPasswordRateLimit, `fp_email:${email}`)
    if (emailLimit) return emailLimit

    // 2. Canonical env-driven site URL for auth redirect
    const siteUrl = getSiteUrl()
    const redirectTo = `${siteUrl}/auth/confirm?next=/reset-password`

    // 3. Trigger Supabase password reset
    const supabase = createApiClient({ useServiceRole: true })
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetError) {
      // Security: Log real error internally; never leak to client (prevents user enumeration)
      console.error(`[ForgotPassword] Supabase reset error for ${email}:`, resetError.message)
    } else {
      // 4. Audit trail logging to database
      try {
        const userAgent = request.headers.get('user-agent') || 'unknown'
        await supabase.from('password_reset_requests').insert({
          email,
          ip_address: clientIp,
          user_agent: userAgent.slice(0, 500),
          status: 'sent',
          requested_at: new Date().toISOString(),
        })
      } catch (auditErr) {
        console.warn('[ForgotPassword] Audit log insert failed:', auditErr)
      }
    }

    // Security: Consistent response regardless of user existence (no user enumeration)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
