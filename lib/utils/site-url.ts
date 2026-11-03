/**
 * Canonical Site URL resolution helper.
 * Ensures consistent, production-pinned redirect URLs.
 * Strictly prevents routing to *.vercel.app deployment URLs or host header injection.
 */

export const PRIMARY_PRODUCTION_DOMAIN = 'https://www.asrivotech.in'

// In-memory cache for database-resolved domain to minimize database roundtrips
let cachedDbDomain: { url: string; expiresAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Clean and canonicalize any URL string:
 * - Ensures https:// protocol
 * - Discards trailing slashes
 * - Discards any *.vercel.app domain and enforces PRIMARY_PRODUCTION_DOMAIN
 */
export function sanitizeDomain(url: string | null | undefined): string {
  if (!url) return PRIMARY_PRODUCTION_DOMAIN
  let clean = url.trim()

  // Discard any vercel.app domains (prevents email links or callbacks routing to Vercel)
  if (clean.includes('vercel.app')) {
    return PRIMARY_PRODUCTION_DOMAIN
  }

  // Ensure protocol is included
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`
  }

  // If running in production or Vercel, discard localhost
  if (
    (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') &&
    (clean.includes('localhost') || clean.includes('127.0.0.1'))
  ) {
    return PRIMARY_PRODUCTION_DOMAIN
  }

  return clean.replace(/\/+$/, '')
}

/**
 * Synchronous canonical site URL resolution.
 * Safe for use in client components, server components, and route handlers.
 * Guaranteed to never return a *.vercel.app URL.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL

  // If in production mode or running on Vercel platform, always pin to official domain
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    if (!envUrl || envUrl.includes('vercel.app') || envUrl.includes('localhost')) {
      return PRIMARY_PRODUCTION_DOMAIN
    }
    return sanitizeDomain(envUrl)
  }

  if (envUrl) {
    return sanitizeDomain(envUrl)
  }

  return PRIMARY_PRODUCTION_DOMAIN
}

/**
 * Asynchronous canonical site URL resolution for server-side route handlers.
 * 
 * Resolution order:
 * 1. Checks incoming request host (if matching asrivotech.in)
 * 2. Queries Supabase database (site_settings / settings) for configured production domain
 * 3. Falls back to environment variable NEXT_PUBLIC_SITE_URL (sanitized against vercel.app)
 * 4. Authoritative fallback to PRIMARY_PRODUCTION_DOMAIN (https://www.asrivotech.in)
 */
export async function getRealSiteUrl(
  request?: Request | { headers?: Headers | Record<string, string | string[] | undefined> }
): Promise<string> {
  // 1. Check incoming request host if present
  if (request) {
    try {
      let host = ''
      if ('headers' in request && request.headers) {
        if (typeof (request.headers as Headers).get === 'function') {
          host =
            (request.headers as Headers).get('x-forwarded-host') ||
            (request.headers as Headers).get('host') ||
            ''
        } else {
          const raw = request.headers as Record<string, string | string[] | undefined>
          const h = raw['x-forwarded-host'] || raw['host']
          host = Array.isArray(h) ? h[0] : (h || '')
        }
      }

      const cleanHost = host.split(':')[0].toLowerCase()
      // If request came through vercel.app or asrivotech.in, always use the real domain
      if (
        cleanHost === 'asrivotech.in' ||
        cleanHost === 'www.asrivotech.in' ||
        cleanHost.includes('vercel.app')
      ) {
        return PRIMARY_PRODUCTION_DOMAIN
      }
    } catch {
      // Ignore header parsing errors
    }
  }

  // 2. Check in-memory cache
  const now = Date.now()
  if (cachedDbDomain && cachedDbDomain.expiresAt > now) {
    return cachedDbDomain.url
  }

  // 3. Query Supabase for dynamic site_settings or settings (server-side only)
  if (typeof window === 'undefined') {
    try {
      const { createApiClient } = await import('@/lib/supabase/api-client')
      const supabase = createApiClient({ useServiceRole: true })

      // First check site_settings table (site_url or site.url)
      const { data: siteSetting } = await supabase
        .from('site_settings')
        .select('setting_value')
        .in('setting_key', ['site_url', 'site.url', 'site_domain'])
        .limit(1)
        .maybeSingle()

      if (siteSetting?.setting_value) {
        let val = siteSetting.setting_value.trim()
        if (val.startsWith('"') && val.endsWith('"')) {
          try {
            val = JSON.parse(val)
          } catch {
            val = val.slice(1, -1)
          }
        }
        if (val && !val.includes('vercel.app')) {
          const resolved = sanitizeDomain(val)
          cachedDbDomain = { url: resolved, expiresAt: now + CACHE_TTL_MS }
          return resolved
        }
      }

      // Second check settings table (company_website)
      const { data: setting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'company_website')
        .limit(1)
        .maybeSingle()

      if (setting?.value) {
        const val = setting.value.trim()
        if (val && !val.includes('vercel.app')) {
          const resolved = sanitizeDomain(val)
          cachedDbDomain = { url: resolved, expiresAt: now + CACHE_TTL_MS }
          return resolved
        }
      }
    } catch {
      // On DB error, continue to env fallback
    }
  }

  // 4. Default to PRIMARY_PRODUCTION_DOMAIN
  return PRIMARY_PRODUCTION_DOMAIN
}
