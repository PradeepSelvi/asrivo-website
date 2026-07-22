import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export async function POST(request: NextRequest) {
  try {
    const adminResult = await getCurrentAdmin()
    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Update all unread items to read status
    await Promise.all([
      supabase.from('contacts').update({ status: 'read' }).eq('status', 'unread'),
      supabase.from('client_inquiries').update({ status: 'in_review' }).eq('status', 'new'),
      supabase.from('consultation_requests').update({ status: 'reviewed' }).eq('status', 'pending'),
      supabase.from('job_applications').update({ status: 'reviewed' }).eq('status', 'new'),
      supabase.from('partnership_requests').update({ status: 'reviewing' }).eq('status', 'new'),
      supabase.from('complaints').update({ status: 'in_progress' }).eq('status', 'new'),
    ])

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark all as read' },
      { status: 500 }
    )
  }
}
