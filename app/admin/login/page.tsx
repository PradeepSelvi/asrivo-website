'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { verifyAdminProfile } from '@/lib/supabase/admin-actions'
import { Lock, Mail, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react'

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(() => {
    const errorParam = searchParams.get('error')
    const redirectedParam = searchParams.get('redirected')
    if (errorParam === 'unauthorized') return 'Unauthorized: You do not have administrator permissions.'
    if (redirectedParam === 'true') return 'Please log in to access the administrator panel.'
    return null
  })

  // Check if already logged in on mount
  React.useEffect(() => {
    const checkExistingSession = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const result = await verifyAdminProfile(user.id)
        if (result.success) {
          window.location.href = '/admin'
        } else {
          await supabase.auth.signOut()
        }
      }
    }
    
    checkExistingSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Sign in with password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        setErrorMsg(authError?.message || 'Authentication failed.')
        setLoading(false)
        return
      }

      // Verify admin role
      const result = await verifyAdminProfile(authData.user.id)

      if (!result.success) {
        await supabase.auth.signOut()
        setErrorMsg('Unauthorized: You do not have administrator permissions.')
        setLoading(false)
        return
      }

      // PRODUCTION FIX: Wait longer for cookie propagation (especially on Vercel)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Force a full page reload to ensure cookies are sent to middleware
      window.location.replace('/admin')
    } catch (err) {
      console.error('Login error:', err)
      setErrorMsg('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Admin Panel
          </h1>
         
        </div>

        <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          &copy; {new Date().getFullYear()} Asrivo Tech. All rights reserved.
        </p>
      </div>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </main>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
