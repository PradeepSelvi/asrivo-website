import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'
import { verifyCaptcha } from '@/lib/utils/captcha'

// GET - Fetch all job applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET ERROR:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('SERVER ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Submit a job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      full_name,
      email,
      phone,
      position_id,
      job_title,
      experience_years,
      resume_url,
      linkedin_url,
      portfolio_url,
      cover_letter,
      captchaToken,
    } = body

    // Validation
    if (!full_name || !email || !experience_years) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, experience_years' },
        { status: 400 }
      )
    }

    // CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'job_application')
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          full_name,
          email,
          phone: phone || null,
          position_id: position_id || null,
          job_title: job_title || null,
          experience_years: parseInt(experience_years) || 0,
          resume_url: resume_url || null,
          linkedin_url: linkedin_url || null,
          portfolio_url: portfolio_url || null,
          cover_letter: cover_letter || null,
          status: 'new',
        },
      ])
      .select()

    console.log('Supabase Insert Result:', { data, error })

    if (error) {
      console.error('Supabase ERROR:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Send notification to admins
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/send-notification-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'job_application',
            data: {
              name: full_name,
              email,
              phone: phone || 'N/A',
              job_title: job_title || 'Not specified',
              experience_years,
              resume_url,
            },
          }),
        }
      )
    } catch (notifError) {
      console.error('Failed to send admin notification:', notifError)
      // Don't fail the whole operation if notification fails
    }

    // Send email notification to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Job Application: ${job_title || 'Position'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1FA2E1;">New Job Application Received</h2>
            <p><strong>Applicant:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Position:</strong> ${job_title || 'Not specified'}</p>
            <p><strong>Experience:</strong> ${experience_years} years</p>
            ${resume_url ? `<p><strong>Resume:</strong> <a href="${resume_url}" style="color: #1FA2E1;">View Resume</a></p>` : ''}
            ${linkedin_url ? `<p><strong>LinkedIn:</strong> <a href="${linkedin_url}" style="color: #1FA2E1;">View Profile</a></p>` : ''}
            ${portfolio_url ? `<p><strong>Portfolio:</strong> <a href="${portfolio_url}" style="color: #1FA2E1;">View Portfolio</a></p>` : ''}
            ${cover_letter ? `
              <p><strong>Cover Letter:</strong></p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1FA2E1;">
                ${cover_letter.replace(/\n/g, '<br/>')}
              </div>
            ` : ''}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/applications" style="display: inline-block; background-color: #1FA2E1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">View in Admin Panel</a></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated notification from Asrivo Tech Website.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('SERVER ERROR:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    )
  }
}
