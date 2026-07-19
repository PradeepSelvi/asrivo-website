import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'
import { verifyCaptcha } from '@/lib/utils/captcha'

// 👉 GET (optional - to fetch contacts)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("GET ERROR:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error("SERVER ERROR:", error)

    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}


// 👉 POST (MAIN FIXED CODE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, name, message, company, subject, type, captchaToken } = body

    // ✅ Validation
    if (!email || !name || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, message' },
        { status: 400 }
      )
    }

    // 🤖 CAPTCHA Verification
    const captchaResult = await verifyCaptcha(captchaToken, 'contact_form')
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please try again.' },
        { status: 403 }
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

    // 🔥 DEBUG
    console.log("Supabase Insert Result:", { data, error })

    if (error) {
      console.error("Supabase ERROR:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
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
      { success: true, data },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("SERVER ERROR:", error)

    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    )
  }
}