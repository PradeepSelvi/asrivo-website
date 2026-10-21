import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId } = body

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Missing identifier' }, { status: 400 })
    }

    const supabase = createApiClient({ useServiceRole: true })

    try {
      if (email) {
        await supabase
          .from('password_reset_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('email', email.trim().toLowerCase())
          .eq('status', 'sent')
      } else if (userId) {
        await supabase
          .from('password_reset_requests')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'sent')
      }
    } catch (dbErr) {
      console.warn('Could not update password_reset_requests status:', dbErr)
    }

    return NextResponse.json({ success: true, message: 'Password reset status logged' })
  } catch (error: any) {
    console.error('POST /api/auth/reset-password error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
