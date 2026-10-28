import { NextRequest, NextResponse } from 'next/server'
import { validateEmail as validateEmailUtil } from '@/lib/utils/security-validation'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { lightRateLimit } from '@/lib/utils/rate-limit'
import { isValidEmail } from '@/lib/utils/validation'

/**
 * POST /api/validate-email
 * Server-side email validation endpoint
 * Prevents exposing Abstract API key to clients and protects quota
 */
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, lightRateLimit)
  if (limited) return limited

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || email.length > 254) {
      return NextResponse.json(
        { error: 'Invalid email parameter', isValid: false },
        { status: 400 }
      )
    }

    const trimmed = email.trim()

    // Fast linear syntax validation locally to protect external API quota
    if (!isValidEmail(trimmed)) {
      return NextResponse.json(
        { isValid: false, error: 'Please enter a valid email address.' },
        { status: 200 }
      )
    }

    // Perform validation server-side
    const result = await validateEmailUtil(trimmed)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Email validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', isValid: true }, // Fail open
      { status: 500 }
    )
  }
}
