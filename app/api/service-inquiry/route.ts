import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin } from '@/lib/api/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { serviceInquirySchema } from '@/lib/utils/validation'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'
import {
  extractCanonicalInquiryPath,
  SAFE_INQUIRY_PATH_REGEX,
  verifyUploadCapability,
} from '@/lib/utils/upload-capability'

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
    const fullPhone = validatedData.phone
      ? (validatedData.phone.startsWith('+') ? validatedData.phone : `${validatedData.countryCode || ''}${validatedData.phone}`)
      : ''

    const fullWhatsapp = validatedData.whatsapp
      ? (validatedData.whatsapp.startsWith('+') ? validatedData.whatsapp : `${validatedData.whatsappCountryCode || ''}${validatedData.whatsapp}`)
      : null

    const projectTypes = Array.isArray(validatedData.projectTypes) && validatedData.projectTypes.length > 0
      ? validatedData.projectTypes
      : (Array.isArray(validatedData.project_types) && validatedData.project_types.length > 0
          ? validatedData.project_types
          : (validatedData.service_type || validatedData.service ? [validatedData.service_type || validatedData.service] : ['General Inquiry']))

    const projectDescription = validatedData.projectDescription || validatedData.project_description || validatedData.message || 'No description provided'
    const budgetRange = validatedData.budgetRange || validatedData.budget_range || validatedData.budget || 'Flexible'
    const timeline = validatedData.timeline || 'Flexible'
    const hasExisting = validatedData.hasExisting === 'yes' || validatedData.hasExisting === true || validatedData.has_existing === true

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(validatedData.captchaToken || undefined, 'service_inquiry')
    if (!captchaResult.success) {
      return NextResponse.json(
        apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    // Verify document attachment ownership (Finding F-012 / CWE-863)
    const prdRef = validatedData.prdFileUrl || validatedData.prd_file_url || null
    let verifiedPrdPath: string | null = null

    if (prdRef) {
      const canonicalPath = extractCanonicalInquiryPath(prdRef)

      if (!SAFE_INQUIRY_PATH_REGEX.test(canonicalPath)) {
        return NextResponse.json(
          apiError('Invalid document attachment format', 'VALIDATION_ERROR'),
          { status: HTTP_STATUS.BAD_REQUEST }
        )
      }

      // Check if caller is authenticated admin or regular user
      let isAdmin = false
      let authUser: { id: string; email?: string } | null = null
      try {
        const serverSupabase = await createClient()
        const { data: { user } } = await serverSupabase.auth.getUser()
        if (user) {
          authUser = { id: user.id, email: user.email }
          const adminSupabase = createApiClient({ useServiceRole: true })
          const { data: adminProfile } = await adminSupabase
            .from('admin_profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()
          isAdmin = !!adminProfile
        }
      } catch {
        // Unauthenticated public submission
      }

      if (!isAdmin) {
        const cleanFilename = canonicalPath.split('/').pop() || canonicalPath

        // Immutable user identity check (CWE-863)
        // If filename is bound to a user ID (prd_<userId>_...), caller must match that user ID
        if (cleanFilename.startsWith('prd_') && !cleanFilename.startsWith('prd_pub_')) {
          const parts = cleanFilename.split('_')
          if (parts.length >= 4) {
            const ownerId = parts[1]
            if (!authUser || authUser.id !== ownerId) {
              return NextResponse.json(
                apiError('Forbidden: You can only attach documents uploaded by your own account', 'FORBIDDEN'),
                { status: HTTP_STATUS.FORBIDDEN }
              )
            }
          }
        }

        // Validate server-issued upload capability
        const uploadToken = validatedData.prdUploadToken || validatedData.prd_upload_token
        const verification = verifyUploadCapability(uploadToken, {
          bucket: 'inquiry-documents',
          path: canonicalPath,
          userId: authUser?.id || null,
          email,
        })

        if (!verification.valid) {
          return NextResponse.json(
            apiError(`Unauthorized document reference: ${verification.reason}`, 'FORBIDDEN'),
            { status: HTTP_STATUS.FORBIDDEN }
          )
        }
      }

      verifiedPrdPath = canonicalPath
    }

    // Use service-role client so RLS doesn't block anonymous form submissions.
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('client_inquiries')
      .insert({
        email,
        name,
        company: validatedData.company || null,
        phone: fullPhone || validatedData.phone,
        whatsapp: fullWhatsapp,
        preferred_contact: validatedData.preferredContact || validatedData.preferred_contact || 'email',
        project_types: projectTypes,
        other_project_type: validatedData.otherProjectType || validatedData.other_project_type || null,
        project_description: projectDescription,
        has_existing: hasExisting,
        existing_link: validatedData.existingLink || validatedData.existing_link || null,
        target_platform: validatedData.targetPlatform || validatedData.target_platform || [],
        key_features: validatedData.keyFeatures || validatedData.key_features || [],
        other_key_feature: validatedData.otherKeyFeature || validatedData.other_key_feature || null,
        budget_range: budgetRange,
        timeline,
        target_audience: validatedData.targetAudience || validatedData.target_audience || null,
        pain_points: validatedData.painPoints || validatedData.pain_points || null,
        reference_links: validatedData.referenceLinks || validatedData.reference_links || null,
        hear_about_us: validatedData.hearAboutUs || validatedData.hear_about_us || null,
        prd_file_url: verifiedPrdPath,
        prd_file_name: validatedData.prdFileName || validatedData.prd_file_name || null,
        prd_text: validatedData.prdText || validatedData.prd_text || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      logError('POST /api/service-inquiry - Supabase error', error, { email, name })
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

    logError('POST /api/service-inquiry', error, { email, name })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

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
