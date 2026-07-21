import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, whatsapp, availability, preferredMode, message } = body

    // Validate required fields
    if (!name || !email || !phone || !availability || !preferredMode || preferredMode.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use anon client for public submissions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Insert consultation request
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert([
        {
          name,
          email,
          phone,
          whatsapp: whatsapp || null,
          availability,
          preferred_modes: preferredMode,
          message: message || null,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Failed to save consultation request', details: error.message },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email to client
    // TODO: Send notification email to admin

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing consultation request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching consultation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation requests' },
      { status: 500 }
    )
  }
}
