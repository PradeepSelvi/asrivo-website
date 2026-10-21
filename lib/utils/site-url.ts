/**
 * Canonical Site URL resolution helper.
 * Ensures consistent, environment-driven redirect URLs across local, staging, and production.
 * Prevents vulnerabilities associated with host header injection and Docker/reverse proxy mismatches.
 */
export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
    'http://localhost:3000'

  // Ensure protocol is included
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '')
}
