import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { handleApiError, logError } from '@/lib/utils/error-handler'
import { apiSuccess, apiError } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { contactFormRateLimit } from '@/lib/utils/rate-limit'
import { contactFormSchema } from '@/lib/utils/validation'
import { ZodError } from 'zod'

// 👉 GET (optional - to fetch contacts)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logError('GET /api/contacts - Supabase error', error)
      return NextResponse.json(
        apiError(error.message, 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    return NextResponse.json(apiSuccess(data))

  } catch (error) {
    logError('GET /api/contacts', error)
    const errorDetail = handleApiError(error)
    return NextResponse.json(
      apiError(errorDetail.message, errorDetail.code),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}


// 👉 POST (MAIN FIXED CODE)
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, contactFormRateLimit)
  if (limited) return limited

  let email: string | undefined
  let name: string | undefined

  try {
    const body = await request.json()

    // ✅ Zod Validation
    const validatedData = contactFormSchema.parse(body)
    
    email = validatedData.email
    name = validatedData.name
    const { message, company, subject, type, captchaToken } = validatedData

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'contact_form')
    if (!captchaResult.success) {
      return NextResponse.json(
        apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          email,
          name,
          message,
          company: company || null,
          subject: subject || null,
          type: type || 'contact',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      logError('POST /api/contacts - Supabase insert error', error, { email, name })
      return NextResponse.json(
        apiError(error.message, 'DATABASE_ERROR'),
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 🔔 Send notification to admins
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/send-notification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          data: { name, email, company, phone: '', message }
        })
      })
    } catch (notifError) {
      logError('POST /api/contacts - Failed to send admin notification', notifError)
      // Don't fail the whole operation if notification fails
    }

    // 📧 Send email notification to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Message: ${subject || 'No Subject'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1FA2E1;">New Contact Message Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1FA2E1;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This is an automated notification from Asrivo Tech Website.</p>
          </div>
        `,
      })
    }

    return NextResponse.json(
      apiSuccess(data),
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
    
    logError('POST /api/contacts', error, { email, name })
    const errorDetail = handleApiError(error)
    return NextResponse.json(
      apiError('An error occurred processing your request', errorDetail.code),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
