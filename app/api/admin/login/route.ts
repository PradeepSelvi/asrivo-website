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

const MAX_ATTEMPTS = 3
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minuteses

function getAttemptKey(identifier: string, email: string): string {
  return `${identifier}-${email.toLowerCase()}`
}

function checkRateLimit(key: string): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, lockedUntil: null }
  }

  // Check if lockout period has expired
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    }
  }

  // Reset if lockout has expired
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, lockedUntil: null }
  }

  // Check if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
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
    remainingAttempts: MAX_ATTEMPTS - attempt.count - 1,
    lockedUntil: null,
  }
}

function recordFailedAttempt(key: string): void {
  const now = Date.now()
  const attempt = loginAttempts.get(key)

  if (!attempt) {
    loginAttempts.set(key, { count: 1, lockedUntil: null })
  } else if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    // Reset if lockout expired
    loginAttempts.set(key, { count: 1, lockedUntil: null })
  } else {
    attempt.count++
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCKOUT_DURATION
    }
  }
}

function clearAttempts(key: string): void {
  loginAttempts.delete(key)
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      loginAttempts.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get client identifier
    const identifier = getClientIdentifier(request)
    const attemptKey = getAttemptKey(identifier, email)

    // Check rate limit
    const rateLimit = checkRateLimit(attemptKey)
    
    if (!rateLimit.allowed) {
      const remainingMinutes = Math.ceil((rateLimit.lockedUntil! - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedUntil: rateLimit.lockedUntil,
        },
        { status: 429 }
      )
    }

    // Create response object to set cookies
    const response = NextResponse.next()
    
    const supabase = await createClient()

    // Attempt authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user || !authData.session) {
      // Record failed attempt
      recordFailedAttempt(attemptKey)
      
      const updatedRateLimit = checkRateLimit(attemptKey)
      
      if (!updatedRateLimit.allowed) {
        const remainingMinutes = Math.ceil((updatedRateLimit.lockedUntil! - Date.now()) / 60000)
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Please try again after ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
            lockedUntil: updatedRateLimit.lockedUntil,
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: authError?.message || 'Invalid email or password',
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 401 }
      )
    }

    // Verify admin role
    const result = await verifyAdminProfile(authData.user.id)

    if (!result.success) {
      await supabase.auth.signOut()
      recordFailedAttempt(attemptKey)
      
      const updatedRateLimit = checkRateLimit(attemptKey)
      
      return NextResponse.json(
        {
          error: 'Unauthorized: You do not have administrator permissions',
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 403 }
      )
    }

    // Clear attempts on successful login
    clearAttempts(attemptKey)

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
