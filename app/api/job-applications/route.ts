import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin } from '@/lib/api/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { jobApplicationSchema } from '@/lib/utils/validation'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

// GET - Fetch all job applications (Admin only - Finding F-002 / CWE-862)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const supabase = createApiClient({ useServiceRole: true })
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('job_applications')
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

// POST - Create a new job application (Public submission)
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Zod Validation
    const validatedData = jobApplicationSchema.parse(body)
    
    const fullName = validatedData.full_name || validatedData.name || 'Anonymous'
    email = validatedData.email
    name = fullName

    const {
      phone,
      position_id,
      job_id,
      job_title,
      resume_url,
      cover_letter,
      linkedin_url,
      linkedin,
      portfolio_url,
      portfolio,
      experience_years,
      years_of_experience,
      captchaToken,
    } = validatedData

    // CAPTCHA verification (if token provided)
    if (captchaToken) {
      const captchaResult = await verifyCaptcha(captchaToken, 'job_application')
      if (!captchaResult.success) {
        return NextResponse.json(
          apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
          { status: HTTP_STATUS.FORBIDDEN }
        )
      }
    }

    // Parse experience_years to integer
    const rawExp = experience_years ?? years_of_experience ?? 0
    const parsedExp = typeof rawExp === 'number' ? rawExp : (parseInt(String(rawExp)) || 0)

    // Parse position_id to number if present
    const rawPos = position_id ?? job_id
    const parsedPos = rawPos ? parseInt(String(rawPos)) : null

    // Create Supabase client with service role (bypasses RLS for public submissions)
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          full_name: fullName,
          email,
          phone: phone || null,
          position_id: isNaN(parsedPos as number) ? null : parsedPos,
          job_title: job_title || null,
          experience_years: parsedExp,
          resume_url: resume_url || null,
          linkedin_url: linkedin_url || linkedin || null,
          portfolio_url: portfolio_url || portfolio || null,
          cover_letter: cover_letter || null,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (error) {
      logError('POST /api/job-applications - Database error', error, { email, name })
      return NextResponse.json(
        apiError(error.message || 'Failed to submit application', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(
      apiSuccess(data, 'Job application submitted successfully'),
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

    logError('POST /api/job-applications', error, { email, name })
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : 'An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

// PATCH - Update job application status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        apiError('Missing id or status', 'INVALID_INPUT'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const validStatuses = ['new', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        apiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 'INVALID_STATUS'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('PATCH /api/job-applications - Database error', error, { id, status })
      return NextResponse.json(
        apiError(error.message || 'Failed to update status', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(
      apiSuccess(data, 'Job application status updated successfully')
    )
  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || 'Internal server error', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
