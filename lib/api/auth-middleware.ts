import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants/http'
import { apiError } from './api-handler'

/**
 * Verify user authentication and return user object
 */
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json(
        apiError(ERROR_MESSAGES.UNAUTHORIZED, 'AUTHENTICATION_ERROR'),
        { status: HTTP_STATUS.UNAUTHORIZED }
      ),
      user: null,
      supabase
    }
  }

  return { error: null, user, supabase }
}

/**
 * Verify admin privileges
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await requireAuth(request)
  
  if (authResult.error) {
    return authResult
  }

  const { user, supabase } = authResult

  // Check admin status
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('user_id', user!.id)
    .single()

  if (adminError || !adminProfile) {
    return {
      error: NextResponse.json(
        apiError(ERROR_MESSAGES.FORBIDDEN, 'AUTHORIZATION_ERROR'),
        { status: HTTP_STATUS.FORBIDDEN }
      ),
      user: null,
      supabase,
      adminProfile: null
    }
  }

  return {
    error: null,
    user,
    supabase,
    adminProfile
  }
}

/**
 * Check if user is super admin
 */
export async function requireSuperAdmin(request: NextRequest) {
  const adminResult = await requireAdmin(request)
  
  if (adminResult.error) {
    return adminResult
  }

  const { adminProfile } = adminResult

  if (adminProfile?.role !== 'super_admin') {
    return {
      ...adminResult,
      error: NextResponse.json(
        apiError('Super admin access required', 'AUTHORIZATION_ERROR'),
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }
  }

  return adminResult
}
