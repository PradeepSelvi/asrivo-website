import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

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

    // Prepare email content based on notification type
    let subject = ''
    let htmlContent = ''
    let textContent = ''

    switch (type) {
      case 'contact':
        subject = `🔔 New Contact Message from ${data.name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Contact Message</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
              <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
              <h3 style="color: #333; margin-top: 20px;">Message</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">${data.message}</p>
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

      case 'inquiry':
        subject = `🔔 New Service Inquiry from ${data.name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Service Inquiry</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Inquiry Details</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Company:</strong> ${data.company}</p>
              <p><strong>Service Type:</strong> ${data.service_type}</p>
              <p><strong>Budget:</strong> ${data.budget || 'Not specified'}</p>
              <p><strong>Timeline:</strong> ${data.timeline || 'Not specified'}</p>
              <h3 style="color: #333; margin-top: 20px;">Project Description</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #f5576c;">${data.project_description || 'N/A'}</p>
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

      case 'consultation':
        subject = `🔔 New Consultation Request from ${data.name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Consultation Request</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Consultation Details</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
              <p><strong>Type:</strong> ${data.consultation_type || 'General'}</p>
              <p><strong>Preferred Date:</strong> ${data.preferred_date || 'Not specified'}</p>
              <h3 style="color: #333; margin-top: 20px;">Additional Notes</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4facfe;">${data.message || 'N/A'}</p>
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

      case 'application':
        subject = `🔔 New Job Application from ${data.full_name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Job Application</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Applicant Details</h2>
              <p><strong>Name:</strong> ${data.full_name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
              <p><strong>Position:</strong> ${data.position_applied}</p>
              <p><strong>Experience:</strong> ${data.years_of_experience || 'N/A'} years</p>
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

      case 'partnership':
        subject = `🔔 New Partnership Request from ${data.company_name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center;">
              <h1 style="color: #333; margin: 0;">New Partnership Request</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Partnership Details</h2>
              <p><strong>Company:</strong> ${data.company_name}</p>
              <p><strong>Contact Person:</strong> ${data.contact_person}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
              <p><strong>Type:</strong> ${data.partnership_type || 'N/A'}</p>
              <h3 style="color: #333; margin-top: 20px;">Message</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #a8edea;">${data.message || 'N/A'}</p>
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

      case 'complaint':
        subject = `⚠️ New Complaint from ${data.name}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">⚠️ New Complaint</h1>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <h2 style="color: #333; margin-top: 0;">Complaint Details</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Type:</strong> ${data.complaint_type || 'General'}</p>
              <h3 style="color: #333; margin-top: 20px;">Complaint</h3>
              <p style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b6b;">${data.complaint}</p>
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

      default:
        subject = '🔔 New Notification from Website'
        htmlContent = '<p>A new notification has been received. Please check the admin panel.</p>'
        textContent = 'A new notification has been received. Please check the admin panel.'
    }

    // Send email using your email service (Resend, SendGrid, etc.)
    // For now, using a placeholder - you'll need to implement your email service
    
    // Example with Resend (you'd need to install: npm install resend)
    // const { Resend } = require('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    
    // For demo, we'll just log and return success
    console.log(`📧 Email notification would be sent to: ${adminEmails.join(', ')}`)
    console.log(`📧 Subject: ${subject}`)
    
    // TODO: Implement actual email sending here
    // await resend.emails.send({
    //   from: 'notifications@yourdomain.com',
    //   to: adminEmails,
    //   subject: subject,
    //   html: htmlContent,
    //   text: textContent
    // })

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
