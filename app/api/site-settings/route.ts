import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all site settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    let data, error

    if (key) {
      const result = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', key)
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('site_settings')
        .select('*')
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('GET ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('SERVER ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update a site setting
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { setting_key, setting_value } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: setting_key, setting_value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('site_settings')
      .update({
        setting_value: String(setting_value),
        updated_by: user.id,
      })
      .eq('setting_key', setting_key)
      .select()

    if (error) {
      console.error('UPDATE ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('SERVER ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
