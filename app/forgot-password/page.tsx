'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Mail,
  ArrowLeft,
  Home,
  Loader2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { forgotPasswordSchema } from '@/lib/utils/validation'

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)

  // Real-time email validation error hint
  const [emailFormatError, setEmailFormatError] = useState<string | null>(null)

  // Surface expired token or URL errors
  useEffect(() => {
    if (errorParam === 'expired') {
      setErrorMsg('Your password reset link is invalid or has expired. Please request a new one below.')
    }
  }, [errorParam])

  // Countdown timer for resend button (60 seconds)
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Real-time email format validation as user types
  const handleEmailChange = (val: string) => {
    setEmail(val)
    if (errorMsg) setErrorMsg(null)
    const trimmed = val.trim()
    if (!trimmed) {
      setEmailFormatError(null)
      return
    }
    const result = forgotPasswordSchema.safeParse({ email: trimmed })
    if (!result.success) {
      setEmailFormatError(result.error.errors[0]?.message || 'Invalid email format')
    } else {
      setEmailFormatError(null)
    }
  }

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErrorMsg(null)

    const cleanEmail = email.trim().toLowerCase()
    const validation = forgotPasswordSchema.safeParse({ email: cleanEmail })
    if (!validation.success) {
      setErrorMsg(validation.error.errors[0]?.message || 'Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'https://asrivotech.in/reset-password'

      const supabase = createClient()

      // Security quarantine: Sign out any older logged-in session so it never mixes with password reset
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.auth.signOut({ scope: 'local' })
        }
      } catch {}

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        setErrorMsg(resetError.message || 'Failed to send password reset email. Please try again.')
        setLoading(false)
        return
      }

      // Record in audit table via API route (non-blocking)
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      }).catch(() => {})

      setSent(true)
      setCountdown(60)
    } catch (err: any) {
      console.error('Password reset request error:', err)
      setErrorMsg('An unexpected network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    setErrorMsg(null)

    try {
      const cleanEmail = email.trim().toLowerCase()
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'https://asrivotech.in/reset-password'

      const supabase = createClient()

      // Security quarantine: Sign out any older logged-in session so it never mixes with password reset
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.auth.signOut({ scope: 'local' })
        }
      } catch {}

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      })

      if (resetError) {
        setErrorMsg(resetError.message || 'Failed to resend reset link.')
      } else {
        // Record in audit table
        fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        }).catch(() => {})

        setCountdown(60)
      }
    } catch {
      setErrorMsg('Failed to resend reset link. Please try again later.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background Gradients and Grid Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Back to Home Button (Same-Tab) */}
      <Link
        href="/"
        target="_self"
        className="absolute top-4 left-4 md:top-8 md:left-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium text-foreground shadow-sm"
        aria-label="Return to Home"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">
          <Home className="w-4 h-4" />
        </span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" target="_self" className="mb-4 inline-block group" title="Return to home">
            <img
              src="/asrivo.png"
              alt="Asrivo Tech Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-border/50 group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {sent ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            {sent
              ? `Instructions to reset your password have been sent to ${email}`
              : 'Enter your account email address and we will send you a secure link to reset your password.'}
          </p>
        </div>

        {/* Card Content */}
        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl relative">
          {!sent ? (
            /* STEP 1: Enter Email Form */
            <>
              {errorMsg && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-destructive text-sm leading-relaxed">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSendResetLink} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="forgot-password-email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="forgot-password-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      disabled={loading}
                      className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required
                      autoFocus
                    />
                  </div>
                  {emailFormatError && email.length > 3 && (
                    <p className="text-xs text-destructive mt-1">{emailFormatError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || Boolean(emailFormatError)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-md hover:shadow-primary/25 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/60 text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <Link
                  href="/login"
                  target="_self"
                  className="text-primary hover:underline font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: Sent Confirmation */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">Reset Link Sent</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Password reset link sent to your email. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="p-3 bg-muted/60 border border-border/60 rounded-xl text-xs text-muted-foreground flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Please check your inbox and spam folder. Links are valid for a limited time for your security.
                </span>
              </div>

              {/* Resend and back actions */}
              <div className="pt-4 border-t border-border/60 flex flex-col gap-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <span>Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className="text-primary hover:underline font-semibold disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Resending...
                      </>
                    ) : countdown > 0 ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Resend in {countdown}s
                      </span>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Resend Link
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setErrorMsg(null)
                  }}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors mt-1 cursor-pointer"
                >
                  ← Use a different email address
                </button>
              </div>

              <div className="pt-2 text-center text-sm">
                <Link
                  href="/login"
                  target="_self"
                  className="text-primary hover:underline font-semibold transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          &copy; {new Date().getFullYear()} Asrivo Tech. All rights reserved.
        </p>
      </div>
    </main>
  )
}
