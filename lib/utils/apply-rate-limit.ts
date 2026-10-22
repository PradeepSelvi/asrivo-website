/**
 * apply-rate-limit.ts
 * One-line helper to apply a rate limiter to any API route.
 * Returns a 429 NextResponse if the limit is exceeded, or null if OK.
 *
 * Usage:
 *   const limit = await applyRateLimit(request, uploadRateLimit)
 *   if (limit) return limit
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, getClientIdentifier } from '@/lib/utils/rate-limit'

export async function applyRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): Promise<NextResponse | null> {
  const id = identifier ?? getClientIdentifier(request)
  const result = await limiter.check(id)

  if (!result.success) {
    const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000)
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.reset),
        },
      }
    )
  }

  return null
}
