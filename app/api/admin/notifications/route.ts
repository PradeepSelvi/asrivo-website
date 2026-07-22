import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminResult = await getCurrentAdmin()
    if (!adminResult.success || !adminResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const notifications: Array<{
      id: string
      type: string
      title: string
      message: string
      link: string
      created_at: string
      read: boolean
    }> = []

    // Fetch unread contacts (last 50)
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, name, email, message, created_at, status')
      .eq('status', 'unread')
      .order('created_at', { ascending: false })
      .limit(20)

    if (contacts) {
      contacts.forEach((contact: any) => {
        notifications.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: `New Contact: ${contact.name}`,
          message: contact.message.substring(0, 100),
          link: `/admin/contacts/${contact.id}`,
          created_at: contact.created_at,
          read: false
        })
      })
    }

    // Fetch new service inquiries
    const { data: inquiries } = await supabase
      .from('client_inquiries')
      .select('id, name, company, service_type, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20)

    if (inquiries) {
      inquiries.forEach((inquiry: any) => {
        notifications.push({
          id: `inquiry-${inquiry.id}`,
          type: 'inquiry',
          title: `New Inquiry: ${inquiry.name}`,
          message: `${inquiry.company} - ${inquiry.service_type}`,
          link: `/admin/inquiries/${inquiry.id}`,
          created_at: inquiry.created_at,
          read: false
        })
      })
    }

    // Fetch new consultations
    const { data: consultations } = await supabase
      .from('consultation_requests')
      .select('id, name, email, consultation_type, created_at, status')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20)

    if (consultations) {
      consultations.forEach((consultation: any) => {
        notifications.push({
          id: `consultation-${consultation.id}`,
          type: 'consultation',
          title: `New Consultation: ${consultation.name}`,
          message: `${consultation.consultation_type || 'General'} consultation request`,
          link: `/admin/consultations/${consultation.id}`,
          created_at: consultation.created_at,
          read: false
        })
      })
    }

    // Fetch new job applications
    const { data: applications } = await supabase
      .from('job_applications')
      .select('id, full_name, position_applied, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20)

    if (applications) {
      applications.forEach((app: any) => {
        notifications.push({
          id: `application-${app.id}`,
          type: 'application',
          title: `New Application: ${app.full_name}`,
          message: `Applied for ${app.position_applied}`,
          link: `/admin/applications`,
          created_at: app.created_at,
          read: false
        })
      })
    }

    // Fetch new partnership requests
    const { data: partnerships } = await supabase
      .from('partnership_requests')
      .select('id, company_name, contact_person, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20)

    if (partnerships) {
      partnerships.forEach((partnership: any) => {
        notifications.push({
          id: `partnership-${partnership.id}`,
          type: 'partnership',
          title: `New Partnership: ${partnership.company_name}`,
          message: `Contact: ${partnership.contact_person}`,
          link: `/admin/partnerships`,
          created_at: partnership.created_at,
          read: false
        })
      })
    }

    // Fetch new complaints
    const { data: complaints } = await supabase
      .from('complaints')
      .select('id, name, email, complaint_type, created_at, status')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20)

    if (complaints) {
      complaints.forEach((complaint: any) => {
        notifications.push({
          id: `complaint-${complaint.id}`,
          type: 'complaint',
          title: `New Complaint: ${complaint.name}`,
          message: `${complaint.complaint_type || 'General complaint'}`,
          link: `/admin/complaints/${complaint.id}`,
          created_at: complaint.created_at,
          read: false
        })
      })
    }

    // Sort all notifications by date
    notifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Limit to 50 most recent
    const recentNotifications = notifications.slice(0, 50)
    const unreadCount = notifications.length

    return NextResponse.json({
      notifications: recentNotifications,
      unreadCount,
      success: true
    })

  } catch (error: any) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
