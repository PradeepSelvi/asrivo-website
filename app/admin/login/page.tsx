'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { verifyAdminProfile } from '@/lib/supabase/admin-actions'
import { Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react'

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(() => {
    const errorParam = searchParams.get('error')
    const redirectedParam = searchParams.get('redirected')
    if (errorParam === 'unauthorized') return 'Unauthorized: You do not have administrator permissions.'
    if (redirectedParam === 'true') return 'Please log in to access the administrator panel.'
    return null
  })

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
      // Step 1: Sign in on the CLIENT — this sets the session cookie in the browser
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        setErrorMsg(authError?.message || 'Authentication failed.')
        setLoading(false)
        return
      }

      // Step 2: Verify admin role via server action
      const result = await verifyAdminProfile(authData.user.id)

      if (!result.success) {
        // Not an admin — sign them out and show error
        await supabase.auth.signOut()
        setErrorMsg('Unauthorized: You do not have administrator permissions.')
        setLoading(false)
        return
      }

      // Step 3: Session is set in browser, navigate to admin
      window.location.href = '/admin'
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Admin Panel
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Please log in with your administrator credentials
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl py-3 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
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

        <p className="text-center text-slate-600 text-xs mt-8">
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
