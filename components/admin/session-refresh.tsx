'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SessionRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Refresh session every 30 minutes to keep it alive
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.error('Session refresh failed:', error)
          // Don't redirect immediately - let the next page load handle it
        } else if (data.session) {
          console.log('✅ Session refreshed successfully')
          // Refresh the page data to update any server components
          router.refresh()
        }
      } catch (err) {
        console.error('Session refresh error:', err)
      }
    }, 30 * 60 * 1000) // 30 minutes

    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting...')
        router.push('/admin/login')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed automatically')
        router.refresh()
      }
    })

    return () => {
      clearInterval(interval)
      authListener.subscription.unsubscribe()
    }
  }, [router])

  return null // This component renders nothing visible
}
