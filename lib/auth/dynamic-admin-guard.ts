/**
 * Dynamic admin authentication guards
 * These guards force dynamic rendering to avoid static generation errors
 */

import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export type AdminRole = 'high' | 'low'

interface AdminGuardOptions {
  requireRole?: AdminRole
  redirectTo?: string
}

/**
 * Force dynamic rendering for admin pages
 * This prevents static generation errors with cookie usage
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Guard function for admin pages with dynamic rendering
 */
export async function requireAdminDynamic(options: AdminGuardOptions = {}) {
  const { requireRole, redirectTo = '/admin/login?error=unauthorized' } = options
  
  const adminResult = await getCurrentAdmin()
  
  if (!adminResult.success || !adminResult.user) {
    redirect(redirectTo)
  }
  
  if (requireRole && adminResult.user.role !== requireRole) {
    redirect('/admin')
  }
  
  return adminResult.user
}

/**
 * Guard specifically for high-level admin actions with dynamic rendering
 */
export async function requireHighAdminDynamic(redirectTo = '/admin') {
  const adminResult = await getCurrentAdmin()
  
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect(redirectTo)
  }
  
  return adminResult.user
}

/**
 * Check if user is admin without redirecting with dynamic rendering
 */
export async function getAdminOrNullDynamic() {
  const adminResult = await getCurrentAdmin()
  return adminResult.success ? adminResult.user : null
}