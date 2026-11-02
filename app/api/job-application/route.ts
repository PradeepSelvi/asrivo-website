import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      full_name,
      email,
      phone,
      job_title,
      position_id,
      resume_url,
      cover_letter,
      linkedin_url,
      portfolio_url,
      experience_years,
    } = body

    // Validate required fields
    if (!full_name || !email || !job_title) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, job_title' },
        { status: 400 }
      )
    }

    // Use service-role client so RLS doesn't block anonymous applicants.
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        full_name,
        email,
        phone: phone || null,
        job_title,
        position_id: position_id || null,
        resume_url: resume_url || null,
        cover_letter: cover_letter || null,
        linkedin_url: linkedin_url || null,
        portfolio_url: portfolio_url || null,
        experience_years: experience_years || null,
        status: 'new',
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Job application submitted successfully',
        data 
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET - List all job applications (admin only) — F-022 / CWE-863
// Previously used a cookie-backed client with no authorization check,
// relying solely on the overly-broad authenticated SELECT RLS policy,
// which allowed any logged-in user to retrieve all applicant records.
// Now requires verified admin_profiles membership before returning data.
export async function GET(request: NextRequest) {
  try {
    // 1. Require a verified session
    const supabaseAuth = await createClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Require admin_profiles membership
    const supabaseService = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await supabaseService
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Forbidden: administrator access required' },
        { status: 403 }
      )
    }

    // 3. Fetch applications via service-role client (bypasses RLS)
    const { data: applications, error } = await supabaseService
      .from('job_applications')
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
      count: applications?.length || 0,
      data: applications
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
