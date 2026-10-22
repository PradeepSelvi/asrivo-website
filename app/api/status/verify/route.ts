import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body?.email ?? '').trim().toLowerCase()
    const token = (body?.token ?? '').trim()

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    // Look up the token
    const { data: tokenRow, error: tokenError } = await supabase
      .from('status_tokens')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .gt('expires_at', now)
      .is('used_at', null)
      .single()

    if (tokenError || !tokenRow) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code. Please request a new one.' },
        { status: 401 }
      )
    }

    // Mark token as used
    await supabase
      .from('status_tokens')
      .update({ used_at: now })
      .eq('id', tokenRow.id)

    // Fetch inquiries for this email (safe minimal fields only)
    const { data: inquiries } = await supabase
      .from('service_inquiries')
      .select('id, company, project_types, budget_range, timeline, status, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch complaints for this email (safe minimal fields only)
    const { data: complaints } = await supabase
      .from('complaints')
      .select('id, subject, category, status, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(10)

    const hasResults = (inquiries?.length ?? 0) + (complaints?.length ?? 0) > 0

    if (!hasResults) {
      return NextResponse.json({
        success: true,
        inquiries: [],
        complaints: [],
        message: 'No submissions found for this email address.',
      })
    }

    return NextResponse.json({
      success: true,
      inquiries: inquiries ?? [],
      complaints: complaints ?? [],
    })
  } catch (error) {
    console.error('Error in status/verify:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
