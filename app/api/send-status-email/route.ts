import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const STATUS_INFO = {
  new: {
    title: 'Inquiry Received',
    message: 'We have received your inquiry and our team will review it shortly.',
    color: '#3B82F6' // Blue
  },
  contacted: {
    title: 'We\'ve Reached Out',
    message: 'Our team has contacted you regarding your inquiry. Please check your email or phone for our message.',
    color: '#F59E0B' // Amber
  },
  qualified: {
    title: 'Inquiry Qualified',
    message: 'Great news! Your project has been qualified and we\'re preparing a detailed proposal for you.',
    color: '#8B5CF6' // Purple
  },
  converted: {
    title: 'Let\'s Get Started!',
    message: 'Congratulations! We\'re excited to work with you on this project. Our team will be in touch with next steps.',
    color: '#10B981' // Green
  },
  rejected: {
    title: 'Inquiry Update',
    message: 'Thank you for your interest. Unfortunately, we\'re unable to proceed with this project at this time. We appreciate you considering us.',
    color: '#EF4444' // Red
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, company, status, inquiryId } = await request.json()

    if (!email || !status) {
      return NextResponse.json(
        { error: 'Email and status are required' },
        { status: 400 }
      )
    }

    const statusInfo = STATUS_INFO[status as keyof typeof STATUS_INFO] || STATUS_INFO.new

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `${statusInfo.title} - Your Project Inquiry`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${statusInfo.title}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    
                    <!-- Header with colored bar -->
                    <tr>
                      <td style="background-color: ${statusInfo.color}; padding: 4px 0;"></td>
                    </tr>
                    
                    <!-- Logo/Brand Section -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #18181b; font-size: 28px; font-weight: bold;">
                          ${statusInfo.title}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 0 40px 30px;">
                        <p style="margin: 0 0 20px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                          Hi ${name || 'there'},
                        </p>
                        <p style="margin: 0 0 20px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                          ${statusInfo.message}
                        </p>
                        ${company ? `
                        <div style="background-color: #f4f4f5; border-left: 4px solid ${statusInfo.color}; padding: 16px; margin: 24px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #71717a; font-size: 14px;"><strong>Company:</strong> ${company}</p>
                          <p style="margin: 8px 0 0; color: #71717a; font-size: 14px;"><strong>Inquiry ID:</strong> #${inquiryId}</p>
                          <p style="margin: 8px 0 0; color: #71717a; font-size: 14px;"><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
                        </div>
                        ` : ''}
                        ${status === 'contacted' ? `
                        <p style="margin: 20px 0 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                          If you haven't received our message yet, please check your spam folder or feel free to reach out to us directly.
                        </p>
                        ` : ''}
                        ${status === 'qualified' ? `
                        <p style="margin: 20px 0 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                          We'll send you a detailed proposal within the next 1-2 business days. In the meantime, feel free to reach out if you have any questions.
                        </p>
                        ` : ''}
                        ${status === 'converted' ? `
                        <p style="margin: 20px 0 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                          We're thrilled to bring your project to life. Our team will send you onboarding information and project details shortly.
                        </p>
                        ` : ''}
                      </td>
                    </tr>
                    
                    <!-- CTA Button (for qualified and converted) -->
                    ${status === 'qualified' || status === 'converted' ? `
                    <tr>
                      <td style="padding: 0 40px 30px; text-align: center;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact" 
                           style="display: inline-block; background-color: ${statusInfo.color}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Contact Us
                        </a>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
                          This is an automated notification about your inquiry status update.
                        </p>
                        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                          If you have any questions, please reply to this email.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
