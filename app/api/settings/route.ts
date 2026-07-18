import { NextRequest, NextResponse } from 'next/server'
import { updateSocialLinks, getSettings } from '@/lib/supabase/actions'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const result = await getSettings()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings: result.data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { linkedin, github, twitter } = body

    // Validate URLs if provided
    const validateUrl = (url: string) => {
      if (!url) return true // Allow empty strings
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    if (linkedin !== undefined && !validateUrl(linkedin)) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL' },
        { status: 400 }
      )
    }

    if (github !== undefined && !validateUrl(github)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL' },
        { status: 400 }
      )
    }

    if (twitter !== undefined && !validateUrl(twitter)) {
      return NextResponse.json(
        { error: 'Invalid Twitter URL' },
        { status: 400 }
      )
    }

    const result = await updateSocialLinks({ linkedin, github, twitter })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Social links updated successfully',
      data: result.data
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}