import { createClient } from '@/lib/supabase/server'

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT'

export type ResourceType = 
  | 'team_member' | 'job_posting' | 'job_application' 
  | 'content' | 'settings' | 'admin_user'
  | 'complaint' | 'inquiry' | 'newsletter'

interface AuditLogData {
  action: AuditAction
  resourceType: ResourceType
  resourceId?: string
  oldValues?: any
  newValues?: any
  status?: 'success' | 'failure'
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an administrative action to the audit_logs table
 */
export async function logAudit(data: AuditLogData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Insert audit log
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id || null,
        user_email: user?.email || 'system',
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
        new_values: data.newValues ? JSON.stringify(data.newValues) : null,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        status: data.status || 'success',
        error_message: data.errorMessage,
      })

    if (error) {
      console.error('Failed to log audit:', error)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
  userId?: string
  action?: AuditAction
  resourceType?: ResourceType
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  
  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  
  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  const limit = filters?.limit || 50
  const offset = filters?.offset || 0
  
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching audit logs:', error)
    return { data: [], count: 0, error }
  }

  return { data, count, error: null }
}

/**
 * Helper to get IP address from request headers
 */
export function getIpAddress(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Helper to sanitize sensitive data before logging
 */
export function sanitizeData(data: any): any {
  if (!data) return data
  
  const sensitive = ['password', 'token', 'secret', 'api_key', 'apiKey']
  const sanitized = { ...data }
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]'
    }
  }
  
  return sanitized
}
