import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin } from '@/lib/api/auth-middleware'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Admin-only: check admin_profiles membership
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const params = await context.params
    const supabase = createApiClient({ useServiceRole: true })

    const body = await request.json()
    const { status } = body

    if (!status || !['new', 'reviewing', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('partnerships')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Database error updating partnership:', error.message)
      return NextResponse.json(
        { error: 'Failed to update partnership status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Server error in PATCH /api/partnerships/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Admin-only: check admin_profiles membership
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id } = await context.params
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error fetching partnership:', error.message)
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Server error in GET /api/partnerships/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Admin-only: check admin_profiles membership
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id } = await context.params
    const supabase = createApiClient({ useServiceRole: true })

    const { error } = await supabase
      .from('partnerships')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting partnership:', error.message)
      return NextResponse.json(
        { error: 'Failed to delete partnership' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Partnership deleted successfully' })
  } catch (error) {
    console.error('Server error in DELETE /api/partnerships/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

