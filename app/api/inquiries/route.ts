import { createApiClient } from '@/lib/supabase/api-client'
import { createServerClient } from '@/lib/supabase/server'
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
    const raw = validatedData as any

    email = raw.email
    name = raw.name

    // 🤖 CAPTCHA Verification (if token provided)
    const captchaToken = raw.captchaToken
    if (captchaToken) {
      const captchaResult = await verifyCaptcha(captchaToken, 'service_inquiry')
      if (!captchaResult.success) {
        return NextResponse.json(
          apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
          { status: HTTP_STATUS.FORBIDDEN }
        )
      }
    }

    // Format phone and whatsapp with country code if provided
    const formattedPhone = raw.phone
      ? (raw.countryCode && !raw.phone.startsWith('+') ? `${raw.countryCode}${raw.phone}` : raw.phone)
      : null

    const formattedWhatsapp = raw.whatsapp
      ? (raw.whatsappCountryCode && !raw.whatsapp.startsWith('+') ? `${raw.whatsappCountryCode}${raw.whatsapp}` : raw.whatsapp)
      : null

    // Determine project types list
    const projectTypes = (Array.isArray(raw.projectTypes) && raw.projectTypes.length > 0)
      ? raw.projectTypes
      : ((Array.isArray(raw.project_types) && raw.project_types.length > 0)
          ? raw.project_types
          : (raw.service_type || raw.service ? [raw.service_type || raw.service] : ['General Inquiry']))

    // Determine project description
    const projectDescription = raw.projectDescription || raw.project_description || raw.message || null

    // Determine budget range
    const budgetRange = raw.budgetRange || raw.budget_range || raw.budget || null

    // Determine timeline
    const timeline = raw.timeline || null

    // Determine has_existing boolean
    const hasExisting = raw.hasExisting === 'yes' || raw.hasExisting === true || raw.has_existing === true

    // Create Supabase client with service role (bypasses RLS for public inquiry submissions)
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('client_inquiries')
      .insert({
        email,
        name,
        company: raw.company || null,
        phone: formattedPhone,
        whatsapp: formattedWhatsapp,
        preferred_contact: raw.preferredContact || raw.preferred_contact || 'email',
        project_types: projectTypes,
        other_project_type: raw.otherProjectType || raw.other_project_type || null,
        project_description: projectDescription,
        has_existing: hasExisting,
        existing_link: raw.existingLink || raw.existing_link || null,
        target_platform: raw.targetPlatform || raw.target_platform || null,
        key_features: raw.keyFeatures || raw.key_features || null,
        other_key_feature: raw.otherKeyFeature || raw.other_key_feature || null,
        budget_range: budgetRange,
        timeline,
        target_audience: raw.targetAudience || raw.target_audience || null,
        pain_points: raw.painPoints || raw.pain_points || null,
        reference_links: raw.referenceLinks || raw.reference_links || null,
        hear_about_us: raw.hearAboutUs || raw.hear_about_us || null,
        prd_file_url: raw.prdFileUrl || raw.prd_file_url || null,
        prd_file_name: raw.prdFileName || raw.prd_file_name || null,
        prd_text: raw.prdText || raw.prd_text || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      logError('POST /api/inquiries - Supabase error', error, { email, name })
      return NextResponse.json(
        apiError(error.message || 'Failed to submit inquiry', 'DATABASE_ERROR'),
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

    logError('POST /api/inquiries', error, { email, name })
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : 'An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Admin-only: require authenticated session
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('client_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: inquiries, error } = await query

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
