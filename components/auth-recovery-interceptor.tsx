'use client'

import { useEffect } from 'react'

export function AuthRecoveryInterceptor() {
  useEffect(() => {
    try {
      const p = window.location.pathname || ''
      if (p === '/reset-password') return

      const h = window.location.hash || ''
      const q = window.location.search || ''

      // 1. Intercept hash fragments from Supabase recovery redirect
      const hasAuthHash = (
        h.indexOf('access_token=') !== -1 ||
        h.indexOf('type=recovery') !== -1 ||
        h.indexOf('type=invite') !== -1 ||
        (h.indexOf('error=') !== -1 && (
          h.indexOf('recovery') !== -1 ||
          h.indexOf('otp') !== -1 ||
          h.indexOf('access_denied') !== -1 ||
          h.indexOf('token') !== -1
        ))
      )

      // 2. Intercept query parameters (PKCE code, token_hash, or type=recovery)
      const hasRecoveryQuery = (
        q.indexOf('type=recovery') !== -1 ||
        q.indexOf('token_hash=') !== -1 ||
        (p === '/' && q.indexOf('code=') !== -1) ||
        (p === '/' && q.indexOf('error=') !== -1)
      )

      if (hasAuthHash) {
        window.location.replace('/reset-password' + h)
      } else if (hasRecoveryQuery) {
        window.location.replace('/reset-password' + q)
      }
    } catch {
      // Ignore interceptor errors
    }
  }, [])

  return null
}
