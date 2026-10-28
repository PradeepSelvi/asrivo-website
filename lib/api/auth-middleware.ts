import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants/http'
import { apiError } from './api-handler'

/**
 * Verify user authentication and return user object
 * Supports both Next.js session cookies and Bearer tokens
 */
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient()
  let { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const tokenResult = await supabase.auth.getUser(token)
      if (tokenResult.data?.user) {
        user = tokenResult.data.user
        error = null
      }
    }
  }

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

  // Check admin status in admin_profiles using service role client to avoid RLS recursion
  const adminClient = createApiClient({ useServiceRole: true })
  const { data: adminProfile, error: adminError } = await adminClient
    .from('admin_profiles')
    .select('role')
    .eq('id', user!.id)
    .maybeSingle()

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
 * Verify high admin privileges
 */
export async function requireHighAdmin(request: NextRequest) {
  const adminResult = await requireAdmin(request)
  
  if (adminResult.error) {
    return adminResult
  }

  if (adminResult.adminProfile?.role !== 'high') {
    return {
      error: NextResponse.json(
        apiError(ERROR_MESSAGES.FORBIDDEN, 'INSUFFICIENT_PERMISSIONS'),
        { status: HTTP_STATUS.FORBIDDEN }
      ),
      user: adminResult.user,
      supabase: adminResult.supabase,
      adminProfile: adminResult.adminProfile
    }
  }

  return adminResult
}
