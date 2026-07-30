'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Home, Loader2, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showResendLink, setShowResendLink] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

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
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Handle specific error messages
        if (authError.message.includes('Email not confirmed')) {
          setErrorMsg('Please check your email and click the confirmation link before logging in.')
          setShowResendLink(true)
        } else if (authError.message.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password.')
          setShowResendLink(false)
        } else {
          setErrorMsg(authError.message)
          setShowResendLink(false)
        }
        setLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMsg('Invalid email or password.')
        setLoading(false)
        return
      }

      // Success - redirect to dashboard or home
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setErrorMsg('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.')
      return
    }

    setResending(true)
    setResendSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setResendSuccess(true)
        setErrorMsg(null)
      }
    } catch (err) {
      console.error('Resend error:', err)
      setErrorMsg('Failed to resend confirmation email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-8 md:left-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium text-foreground shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden"><Home className="w-4 h-4" /></span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Lock className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="text-destructive text-sm">{errorMsg}</div>
              {showResendLink && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending}
                  className="mt-3 text-xs text-primary hover:underline font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend confirmation email'
                  )}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div className="text-green-700 dark:text-green-400 text-sm">
                Confirmation email sent! Please check your inbox.
              </div>
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
                  placeholder="you@example.com"
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

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          &copy; {new Date().getFullYear()} Asrivo Tech. All rights reserved.
        </p>
      </div>
    </main>
  )
}
