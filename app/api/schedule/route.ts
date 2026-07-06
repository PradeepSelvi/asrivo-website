import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, company, date, time, brief } = body

    // 1. Insert into Supabase (if table exists)
    const supabase = await createClient()
    
    // We try to insert into 'schedules'. If it fails because the table doesn't exist, 
    // we still proceed with the email sending.
    const { error: dbError } = await supabase
      .from('schedules')
      .insert([
        {
          email,
          name,
          company,
          scheduled_date: date,
          scheduled_time: time,
          brief,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])

    if (dbError) {
      console.warn("Supabase Error (Schedules table might not exist):", dbError.message)
      // If table doesn't exist, we'll just log it for now. 
      // The primary goal is the email.
    }

    // 2. Send email to the Admin (the company)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Call Scheduled: ${name} from ${company || 'N/A'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1FA2E1;">New Discovery Call Scheduled</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Brief:</strong> ${brief}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This is an automated notification from Asrivo Tech Website.</p>
          </div>
        `,
      })
    }

    // 3. Send confirmation email to the User
    await sendEmail({
      to: email,
      subject: `Confirmation: Discovery Call with Asrivo Tech`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1FA2E1;">Call Scheduled Successfully</h2>
          <p>Hi ${name},</p>
          <p>Thank you for scheduling a discovery call with Asrivo Tech. We've received your request and look forward to speaking with you.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p style="margin: 5px 0 0;"><strong>Time:</strong> ${time} (IST)</p>
          </div>
          <p>We will send you a calendar invite with the meeting link shortly.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Best regards,<br />The Asrivo Tech Team</p>
        </div>
      `,
    })

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )

  } catch (error: any) {
    console.error("SCHEDULE API ERROR:", error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
