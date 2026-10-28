import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminProfile } from '@/lib/supabase/admin-actions'
import { getClientIdentifier } from '@/lib/utils/rate-limit'

// In-memory store for login attempts
interface LoginAttempt {
  count: number
  lockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()

// Account-level lockout: strict atomic limit per target email (cannot be bypassed by spoofing IP headers)
const MAX_ACCOUNT_ATTEMPTS = 5
// Network/IP-level limit: prevents distributed credential stuffing from a single IP
const MAX_IP_ATTEMPTS = 15
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes

function checkRateLimit(
  key: string,
  maxAttempts: number
): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    return { allowed: true, remainingAttempts: maxAttempts - 1, lockedUntil: null }
  }

  // Check if lockout period is currently active
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    }
  }

  // Reset entry if lockout has expired
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(key)
    return { allowed: true, remainingAttempts: maxAttempts - 1, lockedUntil: null }
  }

  // Check if max attempts reached
  if (attempt.count >= maxAttempts) {
    const lockedUntil = now + LOCKOUT_DURATION
    attempt.lockedUntil = lockedUntil
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil,
    }
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempt.count - 1,
    lockedUntil: null,
  }
}

function recordFailedAttempt(key: string, maxAttempts: number): void {
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    loginAttempts.set(key, { count: 1, lockedUntil: null })
  } else if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.set(key, { count: 1, lockedUntil: null })
  } else {
    attempt.count++
    if (attempt.count >= maxAttempts) {
      attempt.lockedUntil = now + LOCKOUT_DURATION
    }
  }
}

function clearAttempts(key: string): void {
  loginAttempts.delete(key)
}

// Clean up old expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      loginAttempts.delete(key)
    }
  }
}, 60 * 1000)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const identifier = getClientIdentifier(request)

    // F-025 / CWE-307: Shared atomic account-level key + IP-level key
    // The accountKey guarantees that changing or spoofing request headers cannot reset the lockout counter.
    const accountKey = `account:${cleanEmail}`
    const clientKey = `ip:${identifier}`

    // 1. Check account-level lockout first
    const accountLimit = checkRateLimit(accountKey, MAX_ACCOUNT_ATTEMPTS)
    if (!accountLimit.allowed) {
      const remainingMinutes = Math.ceil((accountLimit.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many failed login attempts for this account. Locked for ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: accountLimit.lockedUntil,
        },
        { status: 429 }
      )
    }

    // 2. Check client IP-level rate limit
    const clientLimit = checkRateLimit(clientKey, MAX_IP_ATTEMPTS)
    if (!clientLimit.allowed) {
      const remainingMinutes = Math.ceil((clientLimit.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many login attempts from this network. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: clientLimit.lockedUntil,
        },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Attempt authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      // Record failed attempt on both account and client IP
      recordFailedAttempt(accountKey, MAX_ACCOUNT_ATTEMPTS)
      recordFailedAttempt(clientKey, MAX_IP_ATTEMPTS)

      const updatedAccountLimit = checkRateLimit(accountKey, MAX_ACCOUNT_ATTEMPTS)

      if (!updatedAccountLimit.allowed) {
        const remainingMinutes = Math.ceil((updatedAccountLimit.lockedUntil! - Date.now()) / 60000)
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Account locked for ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
            lockedUntil: updatedAccountLimit.lockedUntil,
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: authError?.message || 'Invalid email or password',
          remainingAttempts: updatedAccountLimit.remainingAttempts,
        },
        { status: 401 }
      )
    }

    // Verify admin role
    const result = await verifyAdminProfile(authData.user.id)

    if (!result.success) {
      await supabase.auth.signOut()
      recordFailedAttempt(accountKey, MAX_ACCOUNT_ATTEMPTS)
      recordFailedAttempt(clientKey, MAX_IP_ATTEMPTS)

      const updatedAccountLimit = checkRateLimit(accountKey, MAX_ACCOUNT_ATTEMPTS)

      return NextResponse.json(
        {
          error: 'Unauthorized: You do not have administrator permissions',
          remainingAttempts: updatedAccountLimit.remainingAttempts,
        },
        { status: 403 }
      )
    }

    // Clear attempts on successful login for both account and client IP
    clearAttempts(accountKey)
    clearAttempts(clientKey)

    // Set session cookies manually to ensure they persist
    const successResponse = NextResponse.json({
      success: true,
      user: authData.user,
    })

    // Set auth cookies from the session
    if (authData.session) {
      successResponse.cookies.set('sb-access-token', authData.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      successResponse.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return successResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
