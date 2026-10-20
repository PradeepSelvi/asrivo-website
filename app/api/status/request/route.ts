import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

// Rate limit: max 3 requests per email per 15 minutes (tracked via DB)
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MINUTES = 15
const TOKEN_EXPIRY_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body?.email ?? '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()

    // Check rate limit
    const { count } = await supabase
      .from('status_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', windowStart)

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes before trying again.` },
        { status: 429 }
      )
    }

    // Generate secure 6-digit OTP
    const otp = randomBytes(3).readUIntBE(0, 3) % 900000 + 100000
    const token = otp.toString()
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Store token
    const { error: insertError } = await supabase
      .from('status_tokens')
      .insert({ email, token, expires_at: expiresAt })

    if (insertError) {
      console.error('Error storing status token:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate verification code. Please try again.' },
        { status: 500 }
      )
    }

    const resend = getResendClient()
    if (!resend) {
      console.warn('RESEND_API_KEY is not configured; cannot send status email')
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Send OTP email
    await resend.emails.send({
      from: 'Asrivo Tech <noreply@asrivotech.in>',
      to: email,
      subject: 'Your inquiry status verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">Verify your identity</h2>
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 24px;">
            Use the code below to view your inquiry status. It expires in ${TOKEN_EXPIRY_MINUTES} minutes.
          </p>
          <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #111827;">${token}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}. Check your inbox — it expires in ${TOKEN_EXPIRY_MINUTES} minutes.`,
    })
  } catch (error) {
    console.error('Error in status/request:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
