import { createApiClient } from '@/lib/supabase/api-client'
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch complaints by email (authenticated users only, own complaints)
export async function GET(request: NextRequest) {
  try {
    // Require authentication — users can only look up their own complaints
    const supabaseAuth = await createServerClient()
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Ensure the user can only look up their own complaints
    if (user.email?.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        { error: 'You can only look up your own complaints' },
        { status: 403 }
      )
    }

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .ilike('email', cleanEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
