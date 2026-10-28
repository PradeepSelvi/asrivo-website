import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createServerClient } from '@/lib/supabase/server'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { complaintSchema } from '@/lib/utils/validation'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

// GET - Fetch all complaints (for admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = createApiClient({ useServiceRole: true })
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, count: data?.length || 0, data })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new complaint (Authenticated users only)
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  // Require authentication — matches the AuthGate on the complaints page
  const supabaseAuth = await createServerClient()
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      apiError('Authentication required to submit a complaint', 'UNAUTHORIZED'),
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Zod Validation
    const validatedData = complaintSchema.parse(body)
    
    name = validatedData.name
    email = validatedData.email
    const { phone, subject, description, category, priority, proofDocumentUrl, captchaToken } = validatedData

    // CAPTCHA verification (if token provided)
    if (captchaToken) {
      const captchaResult = await verifyCaptcha(captchaToken, 'complaint')
      if (!captchaResult.success) {
        return NextResponse.json(
          apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
          { status: HTTP_STATUS.FORBIDDEN }
        )
      }
    }

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('complaints')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          subject,
          description,
          category: category || null,
          priority: priority || 'medium',
          status: 'new',
          proof_document_url: proofDocumentUrl || null,
        },
      ])
      .select()
      .single()

    if (error) {
      logError('POST /api/complaints - Database error', error, { email, name })
      return NextResponse.json(
        apiError(error.message || 'Failed to submit complaint', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(
      apiSuccess(data, 'Complaint submitted successfully'),
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

    logError('POST /api/complaints', error, { email, name })
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : 'An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
