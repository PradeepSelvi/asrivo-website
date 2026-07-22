import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { status, scheduled_date, scheduled_time, meeting_link, notes } = body

    console.log('Update request for consultation:', body)

    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('consultation_requests')
      .update({
        status,
        scheduled_date,
        scheduled_time,
        meeting_link,
        notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Failed to update consultation request', details: error.message },
        { status: 500 }
      )
    }

    console.log('Successfully updated consultation:', data)
    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('Error updating consultation request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching consultation request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation request' },
      { status: 500 }
    )
  }
}
