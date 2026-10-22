import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { jobApplicationSchema } from '@/lib/utils/validation'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

// GET - Fetch all job applications (for admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new job application (NO AUTHENTICATION REQUIRED)
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Zod Validation
    const validatedData = jobApplicationSchema.parse(body)
    
    name = validatedData.name || validatedData.full_name
    email = validatedData.email
    const {
      phone,
      job_id,
      job_title,
      resume_url,
      cover_letter,
      linkedin_url,
      portfolio_url,
      years_of_experience,
      expected_salary,
      available_from,
      location,
      willing_to_relocate,
    } = validatedData

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          job_id,
          job_title,
          resume_url,
          cover_letter: cover_letter || null,
          linkedin_url: linkedin_url || null,
          portfolio_url: portfolio_url || null,
          years_of_experience: years_of_experience || null,
          expected_salary: expected_salary || null,
          available_from: available_from || null,
          location: location || null,
          willing_to_relocate: willing_to_relocate || false,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (error) {
      logError('POST /api/job-applications - Database error', error, { email, name })
      return NextResponse.json(
        apiError('Failed to submit application', 'DATABASE_ERROR'),
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
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
