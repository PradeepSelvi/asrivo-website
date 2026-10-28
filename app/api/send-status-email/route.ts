import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin } from '@/lib/api/auth-middleware'
import { sendInquiryStatusEmail } from '@/lib/utils/status-email'

// POST /api/send-status-email (Admin only - Finding F-024 / CWE-862)
export async function POST(request: NextRequest) {
  try {
    // 1. Enforce verified administrator authorization
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const body = await request.json()
    const { inquiryId, status: overrideStatus } = body

    if (!inquiryId) {
      return NextResponse.json(
        { error: 'inquiryId is required' },
        { status: 400 }
      )
    }

    // 2. Fetch the authorized, persisted inquiry record from database
    const supabase = createApiClient({ useServiceRole: true })
    const { data: inquiry, error: fetchError } = await supabase
      .from('client_inquiries')
      .select('id, name, email, company, status')
      .eq('id', inquiryId)
      .maybeSingle()

    if (fetchError) {
      console.error('Database error fetching inquiry for email dispatch:', fetchError.message)
      return NextResponse.json(
        { error: 'Failed to retrieve inquiry record' },
        { status: 500 }
      )
    }

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry record not found' },
        { status: 404 }
      )
    }

    if (!inquiry.email) {
      return NextResponse.json(
        { error: 'Inquiry record has no recipient email address' },
        { status: 400 }
      )
    }

    // 3. Dispatch safe, HTML-encoded status notification using verified database values
    const effectiveStatus = overrideStatus || inquiry.status || 'new'
    const result = await sendInquiryStatusEmail({
      id: inquiry.id,
      email: inquiry.email,
      name: inquiry.name,
      company: inquiry.company,
      status: effectiveStatus
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch status email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Status notification email sent' })

  } catch (error: any) {
    console.error('Email sending error in POST /api/send-status-email:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
