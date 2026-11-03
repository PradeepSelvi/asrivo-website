"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function AuthButtons() {
  const pathname = usePathname()
  const isAuthPage = ['/login', '/reset-password', '/forgot-password', '/register'].includes(pathname || '')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Auth session check error:', err)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (isAuthPage) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground hover:text-[#4fd1ed] hover:bg-muted"
          asChild
        >
          <Link href="/login" target="_self">Login</Link>
        </Button>
        <Button
          size="sm"
          className="bg-[#2b6cb0] hover:bg-[#4fd1ed] text-white shadow-lg shadow-blue-500/20"
          asChild
        >
          <Link href="/register" target="_self">Register</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    // Show a subtle loading state
    return (
      <div className="w-32 h-9 bg-muted/50 animate-pulse rounded-lg" />
    )
  }

  if (user) {
    // User is logged in - show profile menu
    return <UserProfileMenu />
  }

  // User is not logged in - show Login and Register buttons
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground hover:text-[#4fd1ed] hover:bg-muted"
        asChild
      >
        <Link href="/login" target="_self">Login</Link>
      </Button>
      <Button
        size="sm"
        className="bg-[#2b6cb0] hover:bg-[#4fd1ed] text-white shadow-lg shadow-blue-500/20"
        asChild
      >
        <Link href="/register" target="_self">Register</Link>
      </Button>
    </div>
  )
}
