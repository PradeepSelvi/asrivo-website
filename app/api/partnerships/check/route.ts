import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'

// POST - Check partnership application status by email.
// Authorization: caller must be authenticated. Non-admins may only query their
// own email; admins may query any email.
export async function POST(request: NextRequest) {
  try {
    // ── 1. Require authentication ──────────────────────────────────────────────
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ── 2. Validate the requested email ───────────────────────────────────────
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // ── 3. Ownership check — non-admins may only look up their own email ───────
    const adminSupabase = createApiClient({ useServiceRole: true })

    if (!user.email || user.email.toLowerCase() !== cleanEmail) {
      // Not their own email — check for admin membership
      const { data: adminProfile } = await adminSupabase
        .from('admin_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!adminProfile) {
        return NextResponse.json(
          { error: 'You can only check your own application status' },
          { status: 403 }
        )
      }
    }

    // ── 4. Fetch applications — scope columns so internal fields stay private ──
    const { data, error } = await adminSupabase
      .from('partnerships')
      .select('id, company_name, contact_person, email, status, created_at, updated_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partnership status' },
        { status: 500 }
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

