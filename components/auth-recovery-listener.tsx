'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Global listener that intercepts password recovery redirects from Supabase.
 * If Supabase redirects the user to the home page (Site URL) with a recovery
 * token hash (#access_token=...&type=recovery) or query parameter, this component
 * immediately forwards the user to /reset-password so they can set a new password.
 */
export function AuthRecoveryListener() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If user is already on reset-password, do nothing
    if (pathname === '/reset-password') return

    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const search = window.location.search

      // 1. Intercept hash with access_token, type=recovery, type=invite, or auth error
      if (
        hash &&
        (hash.includes('access_token=') ||
          hash.includes('type=recovery') ||
          hash.includes('type=invite') ||
          (hash.includes('error=') &&
            (hash.includes('recovery') ||
              hash.includes('otp') ||
              hash.includes('access_denied') ||
              hash.includes('token'))))
      ) {
        window.location.replace('/reset-password' + hash)
        return
      }

      // 2. Intercept query parameters (type=recovery, token_hash, or code arriving at /)
      if (search) {
        const params = new URLSearchParams(search)
        const code = params.get('code')
        const type = params.get('type')
        const token_hash = params.get('token_hash')
        const error = params.get('error')

        if (type === 'recovery' || token_hash) {
          window.location.replace('/reset-password' + search)
          return
        }

        if (pathname === '/' && code) {
          window.location.replace('/reset-password' + search)
          return
        }

        if (pathname === '/' && error) {
          window.location.replace('/reset-password' + search)
          return
        }
      }
    }

    // 3. Listen to Supabase PASSWORD_RECOVERY event
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event fired, navigating to /reset-password...')
        router.push('/reset-password')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return null
}
