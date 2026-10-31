import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getClientIdentifier } from '@/lib/utils/rate-limit'

// In-memory store for login attempts
interface LoginAttempt {
  count: number
  lockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()

// Account-level lockout
const MAX_ACCOUNT_ATTEMPTS = 5
// Network/IP-level limit
const MAX_IP_ATTEMPTS = 15
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Atomically reserves attempt capacity before asynchronous authentication (CWE-307).
 */
function reserveAttempt(
  key: string,
  maxAttempts: number
): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now()
  let attempt = loginAttempts.get(key)

  if (!attempt) {
    attempt = { count: 1, lockedUntil: null }
    loginAttempts.set(key, attempt)
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      lockedUntil: null,
    }
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
    attempt.count = 1
    attempt.lockedUntil = null
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      lockedUntil: null,
    }
  }

  // If already at or over max attempts, enforce lockout
  if (attempt.count >= maxAttempts) {
    if (!attempt.lockedUntil) {
      attempt.lockedUntil = now + LOCKOUT_DURATION
    }
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    }
  }

  // Atomically increment attempt count
  attempt.count++
  if (attempt.count >= maxAttempts) {
    attempt.lockedUntil = now + LOCKOUT_DURATION
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, maxAttempts - attempt.count),
    lockedUntil: null,
  }
}

function getAttemptStatus(
  key: string,
  maxAttempts: number
): { remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now()
  const attempt = loginAttempts.get(key)
  if (!attempt) return { remainingAttempts: maxAttempts, lockedUntil: null }
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return { remainingAttempts: 0, lockedUntil: attempt.lockedUntil }
  }
  return { remainingAttempts: Math.max(0, maxAttempts - attempt.count), lockedUntil: null }
}

function clearAttemptsOnSuccess(key: string): void {
  const attempt = loginAttempts.get(key)
  if (!attempt) return
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return
  }
  loginAttempts.delete(key)
}

function releaseAttemptOnServerError(key: string): void {
  const attempt = loginAttempts.get(key)
  if (!attempt) return
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) return
  if (attempt.count > 0) attempt.count--
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      loginAttempts.delete(key)
    }
  }
}, 60 * 1000)

export async function POST(request: NextRequest) {
  let accountKey = ''
  let clientKey = ''
  let capacityReserved = false

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

    accountKey = `pub-account:${cleanEmail}`
    clientKey = `pub-ip:${identifier}`

    // 1. Atomically check and reserve account-level lockout upfront
    const accountReservation = reserveAttempt(accountKey, MAX_ACCOUNT_ATTEMPTS)
    if (!accountReservation.allowed) {
      const remainingMinutes = Math.ceil((accountReservation.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: accountReservation.lockedUntil,
        },
        { status: 429 }
      )
    }

    // 2. Atomically check and reserve client IP-level rate limit upfront
    const clientReservation = reserveAttempt(clientKey, MAX_IP_ATTEMPTS)
    if (!clientReservation.allowed) {
      const remainingMinutes = Math.ceil((clientReservation.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many login attempts from this network. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: clientReservation.lockedUntil,
        },
        { status: 429 }
      )
    }

    capacityReserved = true

    const supabase = await createClient()

    // 3. Attempt authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      const currentAccountStatus = getAttemptStatus(accountKey, MAX_ACCOUNT_ATTEMPTS)

      if (currentAccountStatus.lockedUntil) {
        const remainingMinutes = Math.ceil((currentAccountStatus.lockedUntil - Date.now()) / 60000)
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Account locked for ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
            lockedUntil: currentAccountStatus.lockedUntil,
          },
          { status: 429 }
        )
      }

      let errorMessage = 'Invalid email or password'
      if (authError?.message.includes('Email not confirmed')) {
        errorMessage = 'EMAIL_NOT_CONFIRMED'
      }

      return NextResponse.json(
        {
          error: errorMessage,
          remainingAttempts: currentAccountStatus.remainingAttempts,
        },
        { status: 401 }
      )
    }

    // 4. Successful login: Reconcile and clear attempts safely
    clearAttemptsOnSuccess(accountKey)
    clearAttemptsOnSuccess(clientKey)

    // Set session cookies
    const successResponse = NextResponse.json({
      success: true,
      user: authData.user,
    })

    if (authData.session) {
      successResponse.cookies.set('sb-access-token', authData.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      successResponse.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return successResponse
  } catch (error) {
    console.error('Public login error:', error)
    if (capacityReserved) {
      releaseAttemptOnServerError(accountKey)
      releaseAttemptOnServerError(clientKey)
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
