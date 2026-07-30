"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface MobileAuthButtonsProps {
  onNavigate: () => void
}

export function MobileAuthButtons({ onNavigate }: MobileAuthButtonsProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    onNavigate()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="w-full h-12 bg-muted/50 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (user) {
    // User is logged in - show profile and logout buttons
    return (
      <div className="space-y-3">
        <Link 
          href="/profile"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors active:scale-98 touch-manipulation"
          onClick={onNavigate}
        >
          <User className="h-5 w-5" />
          View Profile
        </Link>
        <Link 
          href="/profile/settings"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors active:scale-98 touch-manipulation"
          onClick={onNavigate}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xl transition-colors active:scale-98 touch-manipulation"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    )
  }

  // User is not logged in - show Login and Register buttons
  return (
    <div className="flex gap-3">
      <Link 
        href="/login"
        className="flex-1 px-4 py-3 text-center text-base font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors active:scale-98 touch-manipulation"
        onClick={onNavigate}
      >
        Login
      </Link>
      <Link 
        href="/register"
        className="flex-1 px-4 py-3 text-center text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors active:scale-98 touch-manipulation"
        onClick={onNavigate}
      >
        Register
      </Link>
    </div>
  )
}
