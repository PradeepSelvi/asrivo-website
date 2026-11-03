import { getSiteUrl } from '@/lib/utils/site-url'

/**
 * Utility function to send email notifications to all admins
 * whenever a new client request is received
 */

interface NotificationData {
  title?: string
  message?: string
  type?: string
  link?: string
  [key: string]: unknown // Allow additional flexible fields
}

export async function sendAdminNotification(
  type: string, 
  data: NotificationData
): Promise<{ success: boolean; error?: unknown; recipients?: number }> {
  try {
    const siteUrl = getSiteUrl()
    const internalSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.INTERNAL_API_SECRET || ''

    const response = await fetch(
      `${siteUrl}/api/admin/send-notification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(internalSecret ? { Authorization: `Bearer ${internalSecret}` } : {}),
        },
        body: JSON.stringify({ type, data }),
      }
    )

    const result = await response.json()
    
    if (!result.success) {
      console.error('Failed to send admin notification:', result.error)
    } else {
      console.log(`✅ Admin notification processed (${type})`)
    }

    return result
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error }
  }
}
