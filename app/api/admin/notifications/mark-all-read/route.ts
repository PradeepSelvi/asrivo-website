import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify the caller is any valid administrator
    const adminResult = await getCurrentAdmin()
    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service-role client so RLS does not block bulk reads
    const supabase = createApiClient({ useServiceRole: true })

    // Step 2: Mark notification read-state only — these are lightweight status
    // flags that indicate the admin has seen the submission.
    // NOTE (F-014 / CWE-862): complaints are intentionally excluded here.
    // Changing complaint workflow_status to 'in_progress' is a protected
    // workflow transition that requires a HIGH administrator and must be
    // performed explicitly through the dedicated complaints management endpoint,
    // not as a side-effect of clearing notification badges.
    const results = await Promise.allSettled([
      supabase.from('contacts').update({ status: 'read' }).eq('status', 'unread'),
      supabase.from('client_inquiries').update({ status: 'in_review' }).eq('status', 'new'),
      supabase.from('consultation_requests').update({ status: 'reviewed' }).eq('status', 'pending'),
      supabase.from('job_applications').update({ status: 'reviewed' }).eq('status', 'new'),
      supabase.from('partnership_requests').update({ status: 'reviewing' }).eq('status', 'new'),
      // complaints intentionally omitted — workflow transitions require high admin
    ])

    // Step 3: HIGH admins may optionally also acknowledge new complaints
    // (sets a non-destructive 'acknowledged' read-flag, not a workflow state)
    if (adminResult.user.role === 'high') {
      // Only mark as 'acknowledged' if the complaints table supports it;
      // otherwise use a separate notifications_read table. Here we use
      // a safe read-receipt field if it exists, or skip gracefully.
      const { error: ackError } = await supabase
        .from('complaints')
        .update({ admin_acknowledged: true })
        .eq('status', 'new')
        .is('admin_acknowledged', null)

      // Ignore if column doesn't exist yet — won't affect complaint workflow
      if (ackError && !ackError.message.includes('column')) {
        console.error('Mark complaints acknowledged error:', ackError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark all as read' },
      { status: 500 }
    )
  }
}
