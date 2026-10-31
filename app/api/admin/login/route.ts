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

/**
 * Atomically reserves attempt capacity before asynchronous authentication (CWE-307).
 * Prevents race conditions where concurrent requests all pass checks simultaneously.
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

  // Atomically increment attempt count (reserving capacity for this in-flight request)
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

/**
 * Safely reconciles attempts on success without allowing an older request to erase a newer lockout.
 */
function clearAttemptsOnSuccess(key: string): void {
  const attempt = loginAttempts.get(key)
  if (!attempt) return
  // Never erase an active lockout established by another request
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return
  }
  loginAttempts.delete(key)
}

/**
 * Releases reserved attempt count if an unexpected server/network failure aborted before auth
 */
function releaseAttemptOnServerError(key: string): void {
  const attempt = loginAttempts.get(key)
  if (!attempt) return
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) return
  if (attempt.count > 0) attempt.count--
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

    // F-025 / CWE-307: Shared atomic account-level key + IP-level key
    accountKey = `account:${cleanEmail}`
    clientKey = `ip:${identifier}`

    // 1. Atomically check and reserve account-level capacity upfront
    const accountReservation = reserveAttempt(accountKey, MAX_ACCOUNT_ATTEMPTS)
    if (!accountReservation.allowed) {
      const remainingMinutes = Math.ceil((accountReservation.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many failed login attempts for this account. Locked for ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: accountReservation.lockedUntil,
        },
        { status: 429 }
      )
    }

    // 2. Atomically check and reserve client IP-level capacity upfront
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

    // 3. Attempt authentication asynchronously (capacity is already atomically reserved)
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

      return NextResponse.json(
        {
          error: authError?.message || 'Invalid email or password',
          remainingAttempts: currentAccountStatus.remainingAttempts,
        },
        { status: 401 }
      )
    }

    // 4. Verify admin role
    const result = await verifyAdminProfile(authData.user.id)

    if (!result.success) {
      await supabase.auth.signOut()
      const currentAccountStatus = getAttemptStatus(accountKey, MAX_ACCOUNT_ATTEMPTS)

      return NextResponse.json(
        {
          error: 'Unauthorized: You do not have administrator permissions',
          remainingAttempts: currentAccountStatus.remainingAttempts,
        },
        { status: 403 }
      )
    }

    // 5. Successful login: Reconcile and clear attempts safely
    clearAttemptsOnSuccess(accountKey)
    clearAttemptsOnSuccess(clientKey)

    // Set session cookies manually to ensure they persist
    const successResponse = NextResponse.json({
      success: true,
      user: authData.user,
    })

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
