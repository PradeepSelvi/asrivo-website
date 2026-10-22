import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export async function GET(_request: NextRequest) {
  try {
    // Verify admin authentication
    const adminResult = await getCurrentAdmin()
    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return new NextResponse('id,email,status,subscribed_date\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="subscribers.csv"',
        },
      })
    }

    // Build CSV string
    const header = 'id,email,status,subscribed_date'
    const rows = subscribers.map((s) => {
      const id = `"${String(s.id).replace(/"/g, '""')}"`
      const email = `"${String(s.email ?? '').replace(/"/g, '""')}"`
      const status = `"${String(s.status ?? '').replace(/"/g, '""')}"`
      const date = `"${s.created_at ? new Date(s.created_at).toISOString() : ''}"`
      return `${id},${email},${status},${date}`
    })

    const csv = [header, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Subscribers export error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export subscribers' },
      { status: 500 }
    )
  }
}
