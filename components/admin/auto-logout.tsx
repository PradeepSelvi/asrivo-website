'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function AutoLogout() {
  const router = useRouter()
  const pathname = usePathname()
  const previousPathRef = useRef(pathname)
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Handle when user closes the tab/window
    const handleBeforeUnload = async () => {
      // Only logout on actual page unload, not on navigation
      await supabase.auth.signOut()
    }

    // Handle page visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start a timer when tab becomes hidden
        logoutTimerRef.current = setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/admin/login?redirected=true')
        }, 5 * 60 * 1000) // 5 minutes of inactivity
      } else {
        // Clear timer when tab becomes visible again
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current)
          logoutTimerRef.current = null
        }
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current)
      }
    }
  }, [router])

  // Monitor pathname changes to detect navigation away from admin
  useEffect(() => {
    const supabase = createClient()
    
    // Check if user navigated away from admin panel
    if (previousPathRef.current.startsWith('/admin') && !pathname.startsWith('/admin')) {
      // User navigated from admin to non-admin page - logout
      supabase.auth.signOut()
    }
    
    // Update previous path
    previousPathRef.current = pathname
  }, [pathname])

  return null // This component doesn't render anything
}
