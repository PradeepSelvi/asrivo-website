import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await getCurrentAdmin()
    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { read } = body

    // Parse notification ID to determine type and actual ID
    const [type, actualId] = id.split('-')
    
    const supabase = await createClient()
    let updated = false

    // Update the appropriate table based on type
    switch (type) {
      case 'contact':
        const { error: contactError } = await supabase
          .from('contacts')
          .update({ status: read ? 'read' : 'unread' })
          .eq('id', actualId)
        updated = !contactError
        break

      case 'inquiry':
        const { error: inquiryError } = await supabase
          .from('client_inquiries')
          .update({ status: read ? 'in_review' : 'new' })
          .eq('id', actualId)
        updated = !inquiryError
        break

      case 'consultation':
        const { error: consultationError } = await supabase
          .from('consultation_requests')
          .update({ status: read ? 'reviewed' : 'pending' })
          .eq('id', actualId)
        updated = !consultationError
        break

      case 'application':
        const { error: applicationError } = await supabase
          .from('job_applications')
          .update({ status: read ? 'reviewed' : 'new' })
          .eq('id', actualId)
        updated = !applicationError
        break

      case 'partnership':
        const { error: partnershipError } = await supabase
          .from('partnership_requests')
          .update({ status: read ? 'reviewing' : 'new' })
          .eq('id', actualId)
        updated = !partnershipError
        break

      case 'complaint':
        const { error: complaintError } = await supabase
          .from('complaints')
          .update({ status: read ? 'in_progress' : 'new' })
          .eq('id', actualId)
        updated = !complaintError
        break
    }

    return NextResponse.json({ success: updated })

  } catch (error: any) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    )
  }
}
