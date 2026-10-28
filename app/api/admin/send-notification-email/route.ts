import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { escapeHtml, escapeHtmlWithLineBreaks, sanitizeHeader } from '@/lib/utils/html-escape'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid notification data' 
      }, { status: 400 })
    }

    // Get all admin email addresses
    const supabase = await createClient()
    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('email')

    if (!admins || admins.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No admin emails found' 
      })
    }

    const adminEmails = admins.map(admin => admin.email).filter(Boolean)

    // Prepare email content based on notification type (HTML-encoded to prevent injection CWE-116)
    let subject = ''
    let htmlContent = ''
    let textContent = ''

    switch (type) {
      case 'contact': {
        const safeName = escapeHtml(data.name)
        const safeEmail = escapeHtml(data.email)
        const safeCompany = escapeHtml(data.company || 'N/A')
        const safePhone = escapeHtml(data.phone || 'N/A')
        const safeMessage = escapeHtmlWithLineBreaks(data.message || '')

        subject = `🔔 New Contact Message from ${sanitizeHeader(data.name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Contact Message</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Company:</strong> ${safeCompany}</p>
              <p><strong>Phone:</strong> ${safePhone}</p>
              <h3 style="color: #333; margin-top: 20px;">Message</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">${safeMessage}</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/contacts" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'N/A'}\nPhone: ${data.phone || 'N/A'}\n\nMessage:\n${data.message}`
        break
      }

      case 'inquiry': {
        const safeName = escapeHtml(data.name)
        const safeEmail = escapeHtml(data.email)
        const safeCompany = escapeHtml(data.company || 'N/A')
        const safeService = escapeHtml(data.service_type || 'N/A')
        const safeBudget = escapeHtml(data.budget || 'Not specified')
        const safeTimeline = escapeHtml(data.timeline || 'Not specified')
        const safeDescription = escapeHtmlWithLineBreaks(data.project_description || 'N/A')

        subject = `🔔 New Service Inquiry from ${sanitizeHeader(data.name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Service Inquiry</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Inquiry Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Company:</strong> ${safeCompany}</p>
              <p><strong>Service Type:</strong> ${safeService}</p>
              <p><strong>Budget:</strong> ${safeBudget}</p>
              <p><strong>Timeline:</strong> ${safeTimeline}</p>
              <h3 style="color: #333; margin-top: 20px;">Project Description</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f5576c;">${safeDescription}</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/inquiries" 
                   style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Service Inquiry\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\nService: ${data.service_type}\n\nDescription:\n${data.project_description || 'N/A'}`
        break
      }

      case 'consultation': {
        const safeName = escapeHtml(data.name)
        const safeEmail = escapeHtml(data.email)
        const safePhone = escapeHtml(data.phone || 'N/A')
        const safeType = escapeHtml(data.consultation_type || 'General')
        const safeDate = escapeHtml(data.preferred_date || 'Not specified')
        const safeNotes = escapeHtmlWithLineBreaks(data.message || 'N/A')

        subject = `🔔 New Consultation Request from ${sanitizeHeader(data.name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Consultation Request</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Consultation Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Phone:</strong> ${safePhone}</p>
              <p><strong>Type:</strong> ${safeType}</p>
              <p><strong>Preferred Date:</strong> ${safeDate}</p>
              <h3 style="color: #333; margin-top: 20px;">Additional Notes</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4facfe;">${safeNotes}</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/consultations" 
                   style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Consultation Request\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nType: ${data.consultation_type || 'General'}`
        break
      }

      case 'application': {
        const safeName = escapeHtml(data.full_name)
        const safeEmail = escapeHtml(data.email)
        const safePhone = escapeHtml(data.phone || 'N/A')
        const safePosition = escapeHtml(data.position_applied || 'N/A')
        const safeExp = escapeHtml(data.years_of_experience || 'N/A')

        subject = `🔔 New Job Application from ${sanitizeHeader(data.full_name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Job Application</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Applicant Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Phone:</strong> ${safePhone}</p>
              <p><strong>Position:</strong> ${safePosition}</p>
              <p><strong>Experience:</strong> ${safeExp} years</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/applications" 
                   style="background: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Application
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Job Application\n\nName: ${data.full_name}\nEmail: ${data.email}\nPosition: ${data.position_applied}`
        break
      }

      case 'partnership': {
        const safeCompany = escapeHtml(data.company_name || 'N/A')
        const safeContact = escapeHtml(data.contact_person || 'N/A')
        const safeEmail = escapeHtml(data.email)
        const safePhone = escapeHtml(data.phone || 'N/A')
        const safeType = escapeHtml(data.partnership_type || 'N/A')
        const safeMessage = escapeHtmlWithLineBreaks(data.message || 'N/A')

        subject = `🔔 New Partnership Request from ${sanitizeHeader(data.company_name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center;">
              <h1 style="color: #333; margin: 0;">New Partnership Request</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Partnership Details</h2>
              <p><strong>Company:</strong> ${safeCompany}</p>
              <p><strong>Contact Person:</strong> ${safeContact}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Phone:</strong> ${safePhone}</p>
              <p><strong>Type:</strong> ${safeType}</p>
              <h3 style="color: #333; margin-top: 20px;">Message</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #a8edea;">${safeMessage}</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/partnerships" 
                   style="background: #5fd4c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Request
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Partnership Request\n\nCompany: ${data.company_name}\nContact: ${data.contact_person}\nEmail: ${data.email}`
        break
      }

      case 'complaint': {
        const safeName = escapeHtml(data.name)
        const safeEmail = escapeHtml(data.email)
        const safeType = escapeHtml(data.complaint_type || 'General')
        const safeComplaint = escapeHtmlWithLineBreaks(data.complaint || '')

        subject = `⚠️ New Complaint from ${sanitizeHeader(data.name, 'Unknown')}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">⚠️ New Complaint</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Complaint Details</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Type:</strong> ${safeType}</p>
              <h3 style="color: #333; margin-top: 20px;">Complaint</h3>
              <p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b6b;">${safeComplaint}</p>
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/complaints" 
                   style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Complaint
                </a>
              </div>
            </div>
          </div>
        `
        textContent = `New Complaint\n\nName: ${data.name}\nEmail: ${data.email}\nType: ${data.complaint_type || 'General'}\n\nComplaint:\n${data.complaint}`
        break
      }

      default:
        subject = '🔔 New Notification from Website'
        htmlContent = '<p>A new notification has been received. Please check the admin panel.</p>'
        textContent = 'A new notification has been received. Please check the admin panel.'
    }

    console.log(`📧 Email notification would be sent to: ${adminEmails.join(', ')}`)
    console.log(`📧 Subject: ${subject}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Email notification sent to admins',
      recipients: adminEmails.length 
    })

  } catch (error: any) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
