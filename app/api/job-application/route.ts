import { createClient } from '@/lib/supabase/server'
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

    const supabase = await createClient()

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: applications, error } = await supabase
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
