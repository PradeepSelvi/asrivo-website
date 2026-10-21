'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Home,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shield,
  KeyRound,
  ArrowRight,
  Check,
  X,
} from 'lucide-react'
import { checkPasswordBreach, getPasswordStrength } from '@/lib/utils/security-validation'
import { updatePasswordSchema } from '@/lib/utils/validation'

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading reset password...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [redirectTimer, setRedirectTimer] = useState(5)

  // Security validation states
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string[]
    isStrong: boolean
  } | null>(null)
  const [passwordBreach, setPasswordBreach] = useState<{
    isBreached: boolean
    error?: string
  } | null>(null)

  // 1. Verify that user has an active recovery session
  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      // 1. Check URL hash for error messages (e.g. otp_expired, access_denied)
      if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
        try {
          const hashStr = window.location.hash.replace(/^#/, '')
          const hashParams = new URLSearchParams(hashStr)
          const errorDesc = hashParams.get('error_description') || hashParams.get('error')
          if (errorDesc) {
            setErrorMsg(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
            setCheckingSession(false)
            return
          }
        } catch (e) {}
      }

      // 2. Check query params for explicit error
      if (searchParams.get('error') && !window.location.hash.includes('access_token')) {
        const errorDesc = searchParams.get('error_description') || searchParams.get('error')
        setErrorMsg(
          errorDesc
            ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
            : 'The reset link is invalid or has expired. Please request a new one.'
        )
        setCheckingSession(false)
        return
      }

      // 3. Check URL hash for access_token (implicit recovery grant)
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        try {
          const hashStr = window.location.hash.replace(/^#/, '')
          const hashParams = new URLSearchParams(hashStr)
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')

          if (accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || accessToken,
            })

            if (!sessionError && sessionData.session) {
              setIsAuthorized(true)
              setCheckingSession(false)
              return
            }

            // Fallback: verify user directly with token
            const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)
            if (!userError && userData.user) {
              setIsAuthorized(true)
              setCheckingSession(false)
              return
            }
          }
        } catch (hashErr) {
          console.warn('Error parsing hash tokens:', hashErr)
        }
      }

      // 4. Check search params for code (PKCE flow)
      const code = searchParams.get('code')
      if (code) {
        try {
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
          if (!codeErr && codeData.session) {
            setIsAuthorized(true)
            setCheckingSession(false)
            return
          }
        } catch (codeErr) {
          console.warn('Error exchanging code:', codeErr)
        }
      }

      // 5. Check search params for token_hash (verifyOtp flow)
      const token_hash = searchParams.get('token_hash')
      const type = (searchParams.get('type') as any) || 'recovery'
      if (token_hash) {
        try {
          const { data: otpData, error: otpErr } = await supabase.auth.verifyOtp({
            type,
            token_hash,
          })
          if (!otpErr && otpData.session) {
            setIsAuthorized(true)
            setCheckingSession(false)
            return
          }
        } catch (otpErr) {
          console.warn('Error verifying otp token_hash:', otpErr)
        }
      }

      // 6. Check existing session and user in cookies / localStorage
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsAuthorized(true)
        setCheckingSession(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsAuthorized(true)
        setCheckingSession(false)
        return
      }

      setCheckingSession(false)
    }

    checkSession()

    // Listen to PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
          setIsAuthorized(true)
          setCheckingSession(false)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [searchParams])

  // 2. Real-time Password Strength Check
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null)
      setPasswordBreach(null)
      return
    }

    const strength = getPasswordStrength(password)
    setPasswordStrength(strength)

    // Debounced breach check (only if 8+ chars)
    if (password.length >= 8) {
      const timer = setTimeout(async () => {
        const breach = await checkPasswordBreach(password)
        setPasswordBreach(breach)
      }, 700)
      return () => clearTimeout(timer)
    } else {
      setPasswordBreach(null)
    }
  }, [password])

  // 3. Countdown timer when reset is successful
  useEffect(() => {
    if (!success) return
    const timer = setInterval(() => {
      setRedirectTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [success, router])

  // Checklist items
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const validationResult = updatePasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!validationResult.success) {
      setErrorMsg(validationResult.error.errors[0]?.message || 'Please check your password inputs.')
      return
    }

    if (passwordBreach?.isBreached) {
      setErrorMsg('Please choose a different password. This password has appeared in a data breach.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMsg(error.message || 'Failed to update password. Please try again.')
        setLoading(false)
        return
      }

      // Record completion in audit schema
      try {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user?.id,
            email: data.user?.email,
          }),
        })
      } catch (logErr) {
        console.warn('Could not log reset completion:', logErr)
      }

      // Sign out all sessions globally to invalidate old tokens
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (signOutErr) {
        console.warn('Global signout error:', signOutErr)
      }

      router.push('/login?reset=success')
    } catch (err: any) {
      console.error('Password update error:', err)
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background Gradients and Grid Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-8 md:left-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium text-foreground shadow-sm"
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
          <Link href="/" className="mb-4 inline-block group" title="Return to home">
            <img
              src="/asrivo.png"
              alt="Asrivo Tech Logo"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-border/50 group-hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {success ? 'Password Reset Complete' : 'Set New Password'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            {success
              ? 'Your password has been successfully updated.'
              : 'Choose a strong, unique password for your account.'}
          </p>
        </div>

        {/* Card Content */}
        <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl relative">
          {checkingSession ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm">Verifying reset authorization...</p>
            </div>
          ) : success ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">All Set!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your new password is now active in Supabase. You will be redirected to sign in in{' '}
                  <span className="font-semibold text-foreground">{redirectTimer}s</span>.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold shadow-md"
              >
                <Link href="/login" className="flex items-center justify-center gap-2">
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : !isAuthorized ? (
            /* INVALID OR EXPIRED LINK STATE */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Link Invalid or Expired</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For your security, password reset links expire after a short period and can only
                  be used once. Please request a fresh link.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/forgot-password"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-md"
                >
                  <KeyRound className="w-4 h-4" />
                  Request New Reset Link
                </Link>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground text-xs transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* NEW PASSWORD FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-destructive text-sm leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && passwordStrength && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Strength</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength.score >= 3
                            ? 'text-emerald-500'
                            : passwordStrength.score === 2
                            ? 'text-amber-500'
                            : 'text-red-500'
                        }`}
                      >
                        {passwordStrength.score === 4
                          ? 'Very Strong'
                          : passwordStrength.score === 3
                          ? 'Strong'
                          : passwordStrength.score === 2
                          ? 'Medium'
                          : 'Weak'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-colors duration-300 ${
                            step <= passwordStrength.score - 1
                              ? passwordStrength.score >= 3
                                ? 'bg-emerald-500'
                                : passwordStrength.score === 2
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                              : 'bg-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Breach Warning */}
                {passwordBreach?.isBreached && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-xs text-red-600 dark:text-red-400 mt-2">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{passwordBreach.error}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs pt-1">
                    {passwordsMatch ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Requirements Checklist */}
              <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 text-xs text-muted-foreground border border-border/50">
                <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-2">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-500' : ''
                    }`}
                  >
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUppercase ? 'text-emerald-500' : ''
                    }`}
                  >
                    {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasNumber ? 'text-emerald-500' : ''
                    }`}
                  >
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>One number</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSpecial ? 'text-emerald-500' : ''
                    }`}
                  >
                    {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !hasMinLength || !passwordsMatch || passwordBreach?.isBreached}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-center gap-2 shadow-md hover:shadow-primary/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password in Supabase...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-8">
          &copy; {new Date().getFullYear()} Asrivo Tech. All rights reserved.
        </p>
      </div>
    </main>
  )
}

function Button({
  asChild,
  className,
  children,
}: {
  asChild?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (asChild) {
    return <div className={className}>{children}</div>
  }
  return <button className={className}>{children}</button>
}
