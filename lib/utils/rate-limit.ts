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
  uniqueTokenPerInterval: 5,  // 5 attempts per 15 min
})

export const apiRateLimit = new RateLimiter({
  interval: 60 * 1000,        // 1 minute
  uniqueTokenPerInterval: 30, // 30 requests per minute
})

export const contactFormRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000,  // 1 hour
  uniqueTokenPerInterval: 3,  // 3 submissions per hour
})

// Upload routes — tighter to prevent storage abuse
export const uploadRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000,  // 1 hour
  uniqueTokenPerInterval: 10, // 10 uploads per hour per IP
})

// Inquiry / consultation / schedule forms
export const formSubmitRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000,  // 1 hour
  uniqueTokenPerInterval: 5,  // 5 submissions per hour per IP
})

// Newsletter / validate-email — lighter limit
export const lightRateLimit = new RateLimiter({
  interval: 60 * 1000,        // 1 minute
  uniqueTokenPerInterval: 10, // 10 per minute
})

// Password reset requests — 5 requests per hour to prevent brute force / flooding
export const forgotPasswordRateLimit = new RateLimiter({
  interval: 60 * 60 * 1000,   // 1 hour
  uniqueTokenPerInterval: 5,  // 5 requests per hour
})

function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string' || ip.length > 45) return false
  const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
  const ipv6Regex = /^[a-fA-F0-9:]+$/
  return ipv4Regex.test(ip.trim()) || ipv6Regex.test(ip.trim())
}

/**
 * Safely extracts client IP address.
 * Prioritizes trusted infrastructure headers and validates IP syntax (CWE-307).
 */
export function getClientIdentifier(request: Request): string {
  // 1. Cloudflare connecting IP (set by Cloudflare edge proxy)
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp && isValidIp(cfIp)) {
    return cfIp.trim()
  }

  // 2. Vercel / reverse-proxy real IP header
  const vercelIp = request.headers.get('x-vercel-ip') || request.headers.get('x-real-ip')
  if (vercelIp && isValidIp(vercelIp)) {
    return vercelIp.trim()
  }

  // 3. X-Forwarded-For: validate IP format to prevent spoofed/injected tokens
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const candidates = forwarded.split(',').map((s) => s.trim()).filter(Boolean)
    for (const candidate of candidates) {
      if (isValidIp(candidate)) {
        return candidate
      }
    }
  }

  return '127.0.0.1'
}
