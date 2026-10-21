import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    console.log('PATCH request received for ID:', params.id)
    
    const supabase = createApiClient({ useServiceRole: true })

    const body = await request.json()
    const { status } = body
    
    console.log('Request body:', { status })

    if (!status || !['new', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      console.error('Invalid status:', status)
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    console.log('Updating partnership in database...')
    const { data, error } = await supabase
      .from('partnerships')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update partnership status', details: error.message },
        { status: 500 }
      )
    }

    console.log('Update successful:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Partnership not found', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
