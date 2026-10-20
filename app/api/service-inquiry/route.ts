import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { serviceInquirySchema } from '@/lib/utils/validation'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()

    // ✅ Zod Validation
    const validatedData = serviceInquirySchema.parse(body)
    
    email = validatedData.email
    name = validatedData.name
    const {
      company,
      phone,
      service_type,
      project_description,
      timeline,
      budget,
      captchaToken,
    } = validatedData

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'service_inquiry')
    if (!captchaResult.success) {
      return NextResponse.json(
        apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('client_inquiries')
      .insert({
        email,
        name,
        company,
        phone: phone || null,
        project_types: [service_type],
        project_description: project_description || null,
        timeline: timeline || null,
        budget_range: budget || null,
        status: 'new',
        // Fields with no form input — left as null / column defaults
        whatsapp: null,
        preferred_contact: null,
        has_existing: null,
        target_platform: null,
        key_features: null,
        target_audience: null,
        pain_points: null,
        reference_links: null,
        hear_about_us: null,
      })
      .select()

    if (error) {
      logError('POST /api/service-inquiry - Supabase error', error, { email, name })
      return NextResponse.json(
        apiError('Failed to submit inquiry', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(
      apiSuccess(data, 'Service inquiry submitted successfully'),
      { status: HTTP_STATUS.CREATED }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        apiError(`Validation failed: ${firstError.path.join('.')}: ${firstError.message}`, 'VALIDATION_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    logError('POST /api/service-inquiry', error, { email, name })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: inquiries, error } = await supabase
      .from('client_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      count: inquiries?.length || 0,
      data: inquiries
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
