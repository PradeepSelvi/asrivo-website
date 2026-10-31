import { createApiClient } from '@/lib/supabase/api-client'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Allowed workflow values (prevent injection of arbitrary field values)
const ALLOWED_STATUSES = ['new', 'in_progress', 'resolved', 'closed', 'rejected'] as const
const ALLOWED_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

type ComplaintStatus = typeof ALLOWED_STATUSES[number]
type ComplaintPriority = typeof ALLOWED_PRIORITIES[number]

// GET - Fetch single complaint by ID
// Authorization: verified admin OR verified complaint owner (authenticated session).
// Mitigates CWE-862 / CWE-807: Enforces authorization decision BEFORE reading complaint records.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Valid complaint ID is required' }, { status: 400 })
    }

    // 1. Require verified authentication upfront before querying complaint data
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to view complaint details' },
        { status: 401 }
      )
    }

    // 2. Check if user is an administrator
    const adminResult = await getCurrentAdmin()
    const isAdmin = Boolean(adminResult.success && adminResult.user)

    const supabase = createApiClient({ useServiceRole: true })

    let query = supabase.from('complaints').select('*').eq('id', id)

    // 3. If not an admin, strictly scope query to the caller's verified email address
    // This ensures no caller can read or probe another person's complaint record
    if (!isAdmin) {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Forbidden: A verified email address is required to access complaint records' },
          { status: 403 }
        )
      }
      query = query.eq('email', user.email.toLowerCase())
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('Error fetching complaint detail:', error)
      return NextResponse.json({ error: 'Database error fetching complaint' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Complaint not found or you do not have permission to view it' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Complaint detail handler exception:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update complaint status or priority
// Authorization: HIGH administrator only (F-015 / CWE-862)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Require HIGH admin role upfront
    const adminResult = await getCurrentAdmin()

    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (adminResult.user.role !== 'high') {
      return NextResponse.json(
        { error: 'Forbidden: high administrator role required to update complaint status' },
        { status: 403 }
      )
    }

    // 2. Validate and allowlist body fields
    const { id } = await params
    const body = await request.json()
    const { status, priority } = body

    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status as ComplaintStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (priority !== undefined) {
      if (!ALLOWED_PRIORITIES.includes(priority as ComplaintPriority)) {
        return NextResponse.json(
          { error: `Invalid priority. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.priority = priority
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      )
    }

    // 3. Apply the update via service-role client
    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
