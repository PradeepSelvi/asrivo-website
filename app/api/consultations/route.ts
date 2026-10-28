import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { consultationSchema } from '@/lib/utils/validation'
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
    const validatedData = consultationSchema.parse(body)
    
    name = validatedData.name
    email = validatedData.email
    const { phone, whatsapp, availability, preferredMode, message } = validatedData

    // Use service-role client so RLS doesn't block public form submissions.
    // All validation and rate-limiting have already run above.
    const supabase = createApiClient({ useServiceRole: true })

    // Insert consultation request
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert([
        {
          name,
          email,
          phone,
          whatsapp: whatsapp || null,
          availability,
          preferred_modes: preferredMode,
          message: message || null,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      logError('POST /api/consultations - Database error', error, { email, name })
      return NextResponse.json(
        apiError('Failed to save consultation request', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // TODO: Send confirmation email to client
    // TODO: Send notification email to admin

    return NextResponse.json(
      apiSuccess(data, 'Consultation request submitted successfully'),
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

    logError('POST /api/consultations', error, { email, name })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching consultation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation requests' },
      { status: 500 }
    )
  }
}
