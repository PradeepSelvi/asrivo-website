import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin, requireHighAdmin } from '@/lib/api/auth-middleware'

const ALLOWED_STATUSES = ['unread', 'read', 'responded', 'archived']

function isValidContactId(id: string): boolean {
  return typeof id === 'string' && /^\d+$/.test(id)
}

// GET - Fetch single contact by ID (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Enforce verified administrator authentication & authorization (Finding F-018 / CWE-862)
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!isValidContactId(id)) {
      return NextResponse.json(
        { error: 'Invalid contact ID format' },
        { status: 400 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Database error fetching contact:', error.message)
      return NextResponse.json(
        { error: 'Failed to fetch contact' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Server error in GET /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update contact status (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Enforce verified administrator authentication & authorization (Finding F-018 / CWE-862)
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!isValidContactId(id)) {
      return NextResponse.json(
        { error: 'Invalid contact ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Database error updating contact status:', error.message)
      return NextResponse.json(
        { error: 'Failed to update contact status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Server error in PATCH /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete contact (High Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Enforce high admin authorization for contact deletion
    const auth = await requireHighAdmin(request)
    if (auth.error) return auth.error

    const { id } = await context.params
    if (!isValidContactId(id)) {
      return NextResponse.json(
        { error: 'Invalid contact ID format' },
        { status: 400 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error deleting contact:', error.message)
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Contact deleted successfully' })

  } catch (error: any) {
    console.error('Server error in DELETE /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
