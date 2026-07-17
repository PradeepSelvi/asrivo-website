import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { verifyCaptcha } from '@/lib/utils/captcha'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      name,
      company,
      phone,
      service_type,
      project_description,
      timeline,
      budget,
      captchaToken,
    } = body

    // Validate required fields
    if (!email || !name || !company || !service_type) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, company, service_type' },
        { status: 400 }
      )
    }

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'service_inquiry')
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
        { status: 403 }
      )
    }

    // Validate service type
    const validServiceTypes = [
      'software-dev',
      'web-app',
      'mobile-app',
      'cloud-devops',
      'ai-automation',
      'it-consulting',
    ]

    if (!validServiceTypes.includes(service_type)) {
      return NextResponse.json(
        { error: `Invalid service type. Must be one of: ${validServiceTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_inquiries')
      .insert({
        email,
        name,
        company,
        phone: phone || null,
        service_type,
        project_description: project_description || null,
        timeline: timeline || null,
        budget: budget || null,
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
        message: 'Service inquiry submitted successfully',
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

    const { data: inquiries, error } = await supabase
      .from('service_inquiries')
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
