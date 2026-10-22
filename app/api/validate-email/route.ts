import { NextRequest, NextResponse } from 'next/server'
import { validateEmail as validateEmailUtil } from '@/lib/utils/security-validation'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { lightRateLimit } from '@/lib/utils/rate-limit'

/**
 * POST /api/validate-email
 * Server-side email validation endpoint
 * Prevents exposing Abstract API key to clients
 */
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, lightRateLimit)
  if (limited) return limited

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email parameter' },
        { status: 400 }
      )
    }

    // Perform validation server-side
    const result = await validateEmailUtil(email)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Email validation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', isValid: true }, // Fail open
      { status: 500 }
    )
  }
}
