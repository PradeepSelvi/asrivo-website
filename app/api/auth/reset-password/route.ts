import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/reset-password
 * Completes a password reset request audit record.
 * 
 * Security Fix (F-035 / CWE-862):
 * Previously, this endpoint accepted unverified caller-supplied `email` or `userId`
 * in the JSON body, allowing an anonymous attacker to mark any user's pending reset
 * requests as 'completed' without authorization or an actual password change.
 * 
 * We now strictly require:
 * 1. A verified user session (via cookie session or Bearer token header) OR an explicit
 *    admin authentication check.
 * 2. The account identity (`userId` and `email`) is strictly derived from the verified
 *    authenticated user object (`user.id` / `user.email`), NEVER trusted from the client body.
 */
export async function POST(request: NextRequest) {
  try {
    let verifiedUserId: string | null = null
    let verifiedEmail: string | null = null

    // 1. Check for authenticated user via session cookies
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (user && !authError) {
      verifiedUserId = user.id
      verifiedEmail = user.email || null
    } else {
      // 2. Check for Bearer token in Authorization header (common in client-side auth tokens)
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        const token = authHeader.substring(7).trim()
        const { data: tokenUserData, error: tokenError } = await supabaseServer.auth.getUser(token)
        if (tokenUserData?.user && !tokenError) {
          verifiedUserId = tokenUserData.user.id
          verifiedEmail = tokenUserData.user.email || null
        }
      }
    }

    if (!verifiedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Verified user session required' },
        { status: 401 }
      )
    }

    // 3. Perform the audit record update using service role, strictly scoped to the verified user's identity
    const supabaseService = createApiClient({ useServiceRole: true })

    try {
      const query = supabaseService
        .from('password_reset_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('status', 'sent')

      if (verifiedEmail) {
        await query.or(`user_id.eq.${verifiedUserId},email.eq.${verifiedEmail.toLowerCase()}`)
      } else {
        await query.eq('user_id', verifiedUserId)
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
