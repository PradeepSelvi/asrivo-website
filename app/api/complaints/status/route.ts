import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { isValidEmail } from '@/lib/utils/validation'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { apiRateLimit } from '@/lib/utils/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Fetch complaints by email (authenticated users only, own complaints or admin)
// Mitigates CWE-862: Enforces authentication, owner authorization, and strictly bounds returned data.
export async function GET(request: NextRequest) {
  const limited = await applyRateLimit(request, apiRateLimit)
  if (limited) return limited

  try {
    // 1. Require authenticated session
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to look up complaint status' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get('email')

    // If email is provided, validate its format; otherwise default to verified session email
    const cleanEmail = emailParam ? emailParam.trim().toLowerCase() : (user.email ? user.email.toLowerCase() : '')

    // F-016 / CWE-1333: Require valid email, bound length BEFORE regex, use linear-time validator
    if (!cleanEmail || cleanEmail.length > 254 || !isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }

    // 2. Authorization check: verified admin OR verified owner
    const supabase = createApiClient({ useServiceRole: true })
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const isAdmin = !!adminProfile

    // Non-admin callers can strictly ONLY look up complaints under their own verified email
    if (!isAdmin) {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Your account has no verified email address' },
          { status: 403 }
        )
      }

      if (user.email.toLowerCase() !== cleanEmail) {
        return NextResponse.json(
          { error: 'Forbidden: You can only look up your own complaints' },
          { status: 403 }
        )
      }
    }

    // 3. Query complaints with safe projection (exclude internal admin-only fields)
    const { data, error } = await supabase
      .from('complaints')
      .select('id, name, email, subject, description, category, priority, status, proof_document_url, created_at, updated_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching complaint status:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve complaint status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })

  } catch (error: any) {
    console.error('Complaint status server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
