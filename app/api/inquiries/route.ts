import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Received inquiry submission:', body)

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    if (!body.projectTypes || body.projectTypes.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one project type' },
        { status: 400 }
      )
    }

    if (!body.projectDescription || body.projectDescription.length < 20) {
      return NextResponse.json(
        { error: 'Project description is too short (minimum 20 characters)' },
        { status: 400 }
      )
    }

    if (!body.budgetRange || !body.timeline) {
      return NextResponse.json(
        { error: 'Budget range and timeline are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert inquiry into database
    const { data, error } = await supabase
      .from('client_inquiries')
      .insert({
        name: body.name,
        company: body.company || null,
        email: body.email,
        phone: `${body.countryCode}${body.phone}`,
        preferred_contact: body.preferredContact,
        project_types: body.projectTypes,
        project_description: body.projectDescription,
        has_existing: body.hasExisting === 'yes',
        existing_link: body.existingLink || null,
        target_platform: body.targetPlatform,
        key_features: body.keyFeatures,
        budget_range: body.budgetRange,
        timeline: body.timeline,
        target_audience: body.targetAudience || null,
        pain_points: body.painPoints || null,
        reference_links: body.referenceLinks || null,
        hear_about_us: body.hearAboutUs || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // Check if table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Database table not set up. Please run CLIENT_INQUIRIES_SCHEMA.sql first.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Successfully saved inquiry:', data)

    // TODO: Send email notification using Resend
    // You can add email notification here using your existing Resend setup

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Inquiry submission error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
