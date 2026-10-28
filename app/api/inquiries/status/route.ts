import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { isValidEmail } from '@/lib/utils/validation'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { apiRateLimit } from '@/lib/utils/rate-limit'

// POST /api/inquiries/status — Authenticated users can only look up their own inquiries
export async function POST(request: NextRequest) {
  // Rate limit to prevent brute force / event loop starvation
  const limited = await applyRateLimit(request, apiRateLimit)
  if (limited) return limited

  try {
    // Require session auth
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const email = body?.email

    // F-021 / CWE-1333: Require string type before parsing
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // F-021 / CWE-1333: Bound length (RFC 5321 max: 254 chars) BEFORE applying linear-time regex
    if (cleanEmail.length > 254 || !isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Verify user account has an email and matches the requested address
    if (!user.email) {
      return NextResponse.json(
        { error: 'Your account has no verified email address' },
        { status: 403 }
      )
    }

    // Users can only look up their own inquiries
    if (user.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { error: 'You can only look up your own inquiries' },
        { status: 403 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    // Fetch all inquiries for this email
    const { data: inquiries, error } = await supabase
      .from('client_inquiries')
      .select('id, name, company, status, created_at, project_types, budget_range, timeline')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching inquiries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch inquiry status' },
        { status: 500 }
      )
    }

    if (!inquiries || inquiries.length === 0) {
      return NextResponse.json(
        { error: 'No inquiries found for this email address' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      inquiries: inquiries.map(inquiry => ({
        id: inquiry.id,
        name: inquiry.name,
        company: inquiry.company,
        status: inquiry.status,
        createdAt: inquiry.created_at,
        projectTypes: inquiry.project_types,
        budgetRange: inquiry.budget_range,
        timeline: inquiry.timeline,
      }))
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'An error occurred while checking status' },
      { status: 500 }
    )
  }
}
