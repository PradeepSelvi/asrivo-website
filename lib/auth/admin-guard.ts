/**
 * Reusable admin authentication guards
 * Centralized auth logic to reduce code duplication
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export type AdminRole = 'high' | 'low'

interface AdminGuardOptions {
  requireRole?: AdminRole
  redirectTo?: string
}

/**
 * Guard function for admin pages
 * Checks authentication and optionally role level
 */
export async function requireAdmin(options: AdminGuardOptions = {}) {
  const { requireRole, redirectTo = '/admin/login?error=unauthorized' } = options
  
  const adminResult = await getCurrentAdmin()
  
  if (!adminResult.success || !adminResult.user) {
    // Do NOT sign out - just redirect
    // The user might have a valid session that just needs to be refreshed
    redirect(redirectTo)
  }
  
  if (requireRole && adminResult.user.role !== requireRole) {
    redirect('/admin')
  }
  
  return adminResult.user
}

/**
 * Guard specifically for high-level admin actions
 */
export async function requireHighAdmin(redirectTo = '/admin') {
  const adminResult = await getCurrentAdmin()
  
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect(redirectTo)
  }
  
  return adminResult.user
}

/**
 * Check if user is admin without redirecting
 * Useful for conditional rendering
 */
export async function getAdminOrNull() {
  const adminResult = await getCurrentAdmin()
  return adminResult.success ? adminResult.user : null
}

/**
 * Check if user has high role
 */
export async function isHighAdmin() {
  const admin = await getAdminOrNull()
  return admin?.role === 'high'
}
