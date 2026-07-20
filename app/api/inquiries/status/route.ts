import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch all inquiries for this email
    const { data: inquiries, error } = await supabase
      .from('client_inquiries')
      .select('id, name, company, status, created_at, project_types, budget_range, timeline')
      .eq('email', email.toLowerCase().trim())
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

    // Return all inquiries for this email
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
