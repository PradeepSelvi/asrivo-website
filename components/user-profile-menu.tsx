'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Settings, LogOut, ChevronDown, UserCircle, Loader2 } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  avatar_url: string | null
  full_name: string | null
}

export function UserProfileMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session and profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch profile data from user_profiles table
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('avatar_url, full_name')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch updated profile data
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('avatar_url, full_name')
          .eq('id', session.user.id)
          .single()
        
        setProfile(profileData)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Use profile data from database if available, fallback to user metadata
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted transition-all max-w-[200px]"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium text-foreground truncate min-w-0">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-foreground"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              My Profile
            </Link>
            <Link
              href="/profile/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-foreground"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-destructive/10 transition-colors text-sm text-destructive w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
