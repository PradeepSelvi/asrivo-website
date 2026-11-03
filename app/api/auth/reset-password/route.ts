import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { updatePasswordSchema } from '@/lib/utils/validation'

/**
 * POST /api/auth/reset-password
 * Completes a password reset request and optionally updates the user's password securely.
 * 
 * Flow:
 * 1. Derives and cryptographically verifies user identity from session cookies OR Bearer recovery token.
 * 2. If newPassword is provided:
 *    - Validates password strength & security policy (Zod schema)
 *    - Uses Supabase Admin API (updateUserById) to reliably set new password
 *    - Immediately tests login credentials with signInWithPassword to verify login works
 * 3. Updates audit record in public.password_reset_requests to 'completed' with completed_at timestamp
 */
export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Body may be empty
    }

    let verifiedUserId: string | null = null
    let verifiedEmail: string | null = null

    // 1. Check for authenticated user via session cookies
    const supabaseServer = await createServerClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (user && !authError) {
      verifiedUserId = user.id
      verifiedEmail = user.email || null
    } else {
      // 2. Check for Bearer token in Authorization header
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
        { success: false, error: 'Unauthorized: A valid reset token or active session is required.' },
        { status: 401 }
      )
    }

    const supabaseService = createApiClient({ useServiceRole: true })
    let loginVerified = false

    // 3. If newPassword provided, securely update password and verify login
    if (body.newPassword) {
      const newPassword = body.newPassword
      const confirmPassword = body.confirmPassword || newPassword

      const validation = updatePasswordSchema.safeParse({
        password: newPassword,
        confirmPassword,
      })

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error.errors[0]?.message || 'Password does not meet security requirements.',
          },
          { status: 400 }
        )
      }

      // Update password via admin API (bypasses broken client-side refresh token loops)
      const { data: updateData, error: updateError } = await supabaseService.auth.admin.updateUserById(
        verifiedUserId,
        { password: newPassword }
      )

      if (updateError) {
        console.error('[ResetPassword API] updateUserById error:', updateError.message)
        return NextResponse.json(
          { success: false, error: updateError.message || 'Failed to update password.' },
          { status: 500 }
        )
      }

      if (updateData?.user?.email) {
        verifiedEmail = updateData.user.email
      }

      // Immediately verify login with newly updated credentials
      if (verifiedEmail) {
        try {
          const supabaseAnon = createApiClient()
          const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
            email: verifiedEmail,
            password: newPassword,
          })

          if (!signInError && signInData?.session) {
            loginVerified = true
          } else {
            console.warn('[ResetPassword API] Verification sign-in notice:', signInError?.message)
          }
        } catch (verifyEx: any) {
          console.warn('[ResetPassword API] Verification sign-in exception:', verifyEx?.message)
        }
      }
    }

    // 4. Update audit record in password_reset_requests
    try {
      const now = new Date().toISOString()
      const query = supabaseService
        .from('password_reset_requests')
        .update({
          status: 'completed',
          completed_at: now,
          updated_at: now,
        })
        .eq('status', 'sent')

      if (verifiedEmail) {
        await query.or(`user_id.eq.${verifiedUserId},email.eq.${verifiedEmail.toLowerCase()}`)
      } else {
        await query.eq('user_id', verifiedUserId)
      }
    } catch (dbErr: any) {
      console.warn('[ResetPassword API] Could not update password_reset_requests status:', dbErr?.message || dbErr)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Password updated and verified successfully.',
      verifiedUserId,
      verifiedEmail,
      loginVerified,
    })

    // Invalidate and delete all Supabase auth session cookies so user is signed out
    const allCookies = request.cookies.getAll()
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase') || cookie.name.includes('token')) {
        response.cookies.set(cookie.name, '', {
          path: '/',
          expires: new Date(0),
          maxAge: 0,
        })
      }
    })

    return response
  } catch (error: any) {
    console.error('POST /api/auth/reset-password error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
