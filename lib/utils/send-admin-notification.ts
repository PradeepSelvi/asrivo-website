/**
 * Utility function to send email notifications to all admins
 * whenever a new client request is received
 */

export async function sendAdminNotification(type: string, data: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/send-notification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      }
    )

    const result = await response.json()
    
    if (!result.success) {
      console.error('Failed to send admin notification:', result.error)
    } else {
      console.log(`✅ Admin notification sent (${type}) to ${result.recipients} admin(s)`)
    }

    return result
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error }
  }
}
