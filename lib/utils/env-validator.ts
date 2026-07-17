/**
 * Production Environment Variable Validator
 * Validates required environment variables at build time
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const optionalEnvVars = [
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'ADMIN_EMAIL',
  'NEXT_PUBLIC_GA_ID',
] as const

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional variables (warnings only)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  // Validate Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      if (!url.hostname.includes('supabase.co')) {
        console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL does not appear to be a Supabase URL')
      }
    } catch {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file or deployment environment variables.`
    )
  }

  // Log warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Optional environment variables not set:\n${warnings.map(v => `  - ${v}`).join('\n')}`
    )
  }

  // Success message in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully')
  }
}

// Run validation on import (build-time check)
if (typeof window === 'undefined') {
  validateEnv()
}
