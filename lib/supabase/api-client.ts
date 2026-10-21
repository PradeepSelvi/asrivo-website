import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for API routes
 * Centralizes client creation to avoid repeated URL/KEY inline usage
 * 
 * @param options - Configuration options
 * @param options.useServiceRole - Use service role key for admin operations (bypasses RLS)
 * @returns Configured Supabase client
 */
export function createApiClient(options?: { useServiceRole?: boolean }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }

  if (options?.useServiceRole) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    }
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
