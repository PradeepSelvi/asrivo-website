import { createApiClient } from '@/lib/supabase/api-client'
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
      countryCode,
      whatsapp,
      whatsappCountryCode,
      preferredContact,
      projectTypes,
      otherProjectType,
      projectDescription,
      service,
      service_type,
      budget,
      budgetRange,
      timeline,
      message,
      project_description,
      hasExisting,
      has_existing,
      existingLink,
      targetPlatform,
      keyFeatures,
      otherKeyFeature,
      targetAudience,
      painPoints,
      referenceLinks,
      hearAboutUs,
      prdFileUrl,
      prdFileName,
      prdText,
      captchaToken,
    } = validatedData

    // 🤖 CAPTCHA Verification (if token provided)
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
    const formattedPhone = phone
      ? (countryCode && !phone.startsWith('+') ? `${countryCode}${phone}` : phone)
      : null

    const formattedWhatsapp = whatsapp
      ? (whatsappCountryCode && !whatsapp.startsWith('+') ? `${whatsappCountryCode}${whatsapp}` : whatsapp)
      : null

    // Determine project types list
    const resolvedProjectTypes = (projectTypes && projectTypes.length > 0)
      ? projectTypes
      : (service_type ? [service_type] : (service ? [service] : []))

    // Determine project description
    const resolvedDescription = projectDescription || project_description || message || null

    // Determine budget range
    const resolvedBudget = budgetRange || budget || null

    // Determine has_existing boolean
    const resolvedHasExisting = hasExisting === 'yes' || hasExisting === true || has_existing === true

    // Create Supabase client with service role (bypasses RLS for public inquiry submissions)
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('client_inquiries')
      .insert({
        email,
        name,
        company: company || null,
        phone: formattedPhone,
        whatsapp: formattedWhatsapp,
        preferred_contact: preferredContact || 'email',
        project_types: resolvedProjectTypes,
        other_project_type: otherProjectType || null,
        project_description: resolvedDescription,
        has_existing: resolvedHasExisting,
        existing_link: existingLink || null,
        target_platform: targetPlatform && targetPlatform.length > 0 ? targetPlatform : null,
        key_features: keyFeatures && keyFeatures.length > 0 ? keyFeatures : null,
        other_key_feature: otherKeyFeature || null,
        budget_range: resolvedBudget,
        timeline: timeline || null,
        target_audience: targetAudience || null,
        pain_points: painPoints || null,
        reference_links: referenceLinks || null,
        hear_about_us: hearAboutUs || null,
        prd_file_url: prdFileUrl || null,
        prd_file_name: prdFileName || null,
        prd_text: prdText || null,
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

