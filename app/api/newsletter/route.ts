import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { lightRateLimit } from '@/lib/utils/rate-limit'
import { newsletterSchema } from '@/lib/utils/validation'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, lightRateLimit)
  if (limited) return limited

  let email: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Zod Validation
    const validatedData = newsletterSchema.parse(body)
    email = validatedData.email
    const { name, captchaToken } = validatedData

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'newsletter_signup')
    if (!captchaResult.success) {
      return NextResponse.json(
        apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    // Use service-role client so RLS doesn't block anonymous subscribers.
    const supabase = createApiClient({ useServiceRole: true })

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        apiError('Email already subscribed', 'DUPLICATE_EMAIL'),
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name: name || null,
        subscribed: true,
        verified: false,
      })
      .select()

    if (error) {
      logError('POST /api/newsletter - Database error', error, { email })
      return NextResponse.json(
        apiError('Failed to subscribe', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(
      apiSuccess(data, 'Successfully subscribed to newsletter'),
      { status: HTTP_STATUS.CREATED }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        apiError(`Validation failed: ${firstError.message}`, 'VALIDATION_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    logError('POST /api/newsletter', error, { email })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('subscribed', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      count: subscribers?.length || 0,
      data: subscribers
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
