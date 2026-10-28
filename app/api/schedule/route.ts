import { createApiClient } from '@/lib/supabase/api-client'
import { requireAdmin } from '@/lib/api/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
import { scheduleSchema } from '@/lib/utils/validation'
import { sendEmail } from '@/lib/mail'
import { escapeHtml, escapeHtmlWithLineBreaks, sanitizeHeader } from '@/lib/utils/html-escape'
import { ZodError } from 'zod'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

// GET - Fetch all schedules (Admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('schedule_consultation')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError('GET /api/schedule - Database error', error)
      return NextResponse.json(
        apiError(error.message, 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(apiSuccess(data))

  } catch (error: any) {
    logError('GET /api/schedule', error)
    return NextResponse.json(
      apiError(error.message || 'Internal server error', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

// POST - Schedule a new consultation
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, formSubmitRateLimit)
  if (limited) return limited

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()
    
    // ✅ Zod Validation on the server before constructing or sending confirmation (CWE-74)
    const validatedData = scheduleSchema.parse(body)
    
    name = validatedData.name
    email = validatedData.email
    const {
      phone,
      company,
      service_type,
      preferred_date,
      preferred_time,
      message,
      timezone,
    } = validatedData

    const supabase = createApiClient({ useServiceRole: true })

    const { data, error } = await supabase
      .from('schedule_consultation')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          company: company || null,
          service_type: service_type || null,
          preferred_date: preferred_date || null,
          preferred_time: preferred_time || null,
          message: message || null,
          timezone: timezone || 'UTC',
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      logError('POST /api/schedule - Database error', error, { email, name })
      return NextResponse.json(
        apiError('Failed to schedule consultation', 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 📧 Finding F-023 / CWE-74: HTML-encode every user input before template interpolation
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeCompany = company ? escapeHtml(company) : 'N/A'
    const safeService = service_type ? escapeHtml(service_type) : 'Discovery Call'
    const safeDate = preferred_date ? escapeHtml(preferred_date) : 'To be determined'
    const safeTime = preferred_time ? escapeHtml(preferred_time) : 'To be determined'
    const safeTimezone = timezone ? escapeHtml(timezone) : 'UTC'
    const safeMessage = message ? escapeHtmlWithLineBreaks(message) : 'None'

    // 1. Send confirmation email to the User
    try {
      const userSubject = sanitizeHeader(`Confirmation: Call Scheduled with Asrivo Tech`)
      const userPlainText = [
        `Hi ${name},`,
        '',
        `Thank you for scheduling a consultation with Asrivo Tech. We have received your request.`,
        '',
        `Details:`,
        `- Service: ${service_type || 'Discovery Call'}`,
        `- Date: ${preferred_date || 'TBD'}`,
        `- Time: ${preferred_time || 'TBD'} (${timezone || 'UTC'})`,
        '',
        `We will follow up with calendar invite and meeting link.`,
        '',
        `Best regards,`,
        `The Asrivo Tech Team`
      ].join('\n')

      await sendEmail({
        to: email,
        subject: userSubject,
        text: userPlainText,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px;">
            <h2 style="color: #1FA2E1;">Call Scheduled Successfully</h2>
            <p>Hi ${safeName},</p>
            <p>Thank you for scheduling a discovery call with Asrivo Tech. We've received your request and look forward to speaking with you.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1FA2E1;">
              <p style="margin: 0;"><strong>Service:</strong> ${safeService}</p>
              <p style="margin: 5px 0 0;"><strong>Date:</strong> ${safeDate}</p>
              <p style="margin: 5px 0 0;"><strong>Time:</strong> ${safeTime} (${safeTimezone})</p>
            </div>
            <p>We will send you a calendar invite with the meeting link shortly.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">Best regards,<br />The Asrivo Tech Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      logError('POST /api/schedule - User confirmation email failed', emailError, { email })
    }

    // 2. Send notification email to the Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      try {
        const adminSubject = sanitizeHeader(`New Call Scheduled: ${name} from ${company || 'N/A'}`)
        const adminPlainText = [
          'New Discovery Call Scheduled',
          '---------------------------',
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || 'N/A'}`,
          `Phone: ${phone || 'N/A'}`,
          `Service: ${service_type || 'Discovery Call'}`,
          `Date: ${preferred_date || 'TBD'}`,
          `Time: ${preferred_time || 'TBD'} (${timezone || 'UTC'})`,
          `Message: ${message || 'None'}`,
          '---------------------------',
          'Automated notification from Asrivo Tech Website.'
        ].join('\n')

        await sendEmail({
          to: adminEmail,
          subject: adminSubject,
          text: adminPlainText,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px;">
              <h2 style="color: #1FA2E1;">New Discovery Call Scheduled</h2>
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Company:</strong> ${safeCompany}</p>
              <p><strong>Service:</strong> ${safeService}</p>
              <p><strong>Date:</strong> ${safeDate}</p>
              <p><strong>Time:</strong> ${safeTime} (${safeTimezone})</p>
              <p><strong>Message / Notes:</strong></p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1FA2E1;">
                ${safeMessage}
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">This is an automated notification from Asrivo Tech Website.</p>
            </div>
          `,
        })
      } catch (adminEmailError) {
        logError('POST /api/schedule - Admin notification email failed', adminEmailError, { email })
      }
    }

    return NextResponse.json(
      apiSuccess(data, 'Consultation scheduled successfully'),
      { status: HTTP_STATUS.CREATED }
    )

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return NextResponse.json(
        apiError(`Validation failed: ${firstError.path.join('.')}: ${firstError.message}`, 'VALIDATION_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    logError('POST /api/schedule', error, { email, name })
    return NextResponse.json(
      apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
