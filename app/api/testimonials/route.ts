import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_name, client_title, client_company, content, rating } = body

    if (!client_name || !content) {
      return NextResponse.json(
        { error: 'Name and review content are required' },
        { status: 400 }
      )
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        client_name,
        client_title: client_title || null,
        client_company: client_company || null,
        content,
        rating: rating || 5,
        verified: false,
        featured: false,
      })
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json(
      { success: true, message: 'Review submitted successfully', data },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
