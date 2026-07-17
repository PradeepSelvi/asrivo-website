/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or Upstash
 */

interface RateLimitStore {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitStore>()

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now()
    const record = store.get(identifier)

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(now)
    }

    if (!record || now > record.resetTime) {
      // Create new record or reset expired record
      store.set(identifier, {
        count: 1,
        resetTime: now + this.config.interval,
      })
      return {
        success: true,
        remaining: this.config.uniqueTokenPerInterval - 1,
        reset: now + this.config.interval,
      }
    }

    // Check if limit exceeded
    if (record.count >= this.config.uniqueTokenPerInterval) {
      return {
        success: false,
        remaining: 0,
        reset: record.resetTime,
      }
    }

    // Increment count
    record.count++
    return {
      success: true,
      remaining: this.config.uniqueTokenPerInterval - record.count,
      reset: record.resetTime,
    }
  }

  private cleanup(now: number) {
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) {
        store.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters
export const loginRateLimit = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
})

export const apiRateLimit = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30, // 30 requests per minute
})

export const contactFormRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 3, // 3 submissions per hour
})

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (depending on deployment platform)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return ip
}
