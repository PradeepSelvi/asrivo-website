'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
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
  KeyRound,
  ArrowRight,
  Check,
  X,
} from 'lucide-react'
import { checkPasswordBreach, getPasswordStrength } from '@/lib/utils/security-validation'
import { updatePasswordSchema } from '@/lib/utils/validation'

export default function ResetPasswordPage() {
  return (
    <Suspense
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
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLinkExpired, setIsLinkExpired] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null)

  const isSubmittedSuccessfully = useRef(false)

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

  // Step B: Quarantine & Terminate session if user leaves /reset-password without updating password
  useEffect(() => {
    return () => {
      if (!isSubmittedSuccessfully.current) {
        const supabase = createClient()
        supabase.auth.signOut({ scope: 'local' }).catch(() => {})
      }
    }
  }, [])

  // 1. Verify recovery session / token & detect expired links
  useEffect(() => {
    const supabase = createClient()

    const checkSession = async () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const search = typeof window !== 'undefined' ? window.location.search : ''

      // Check if URL contains error flags (otp_expired, access_denied, or generic error)
      const isExpiredInHash =
        hash.includes('otp_expired') ||
        hash.includes('access_denied') ||
        hash.includes('error=')
      const isExpiredInSearch =
        search.includes('otp_expired') ||
        search.includes('access_denied') ||
        Boolean(searchParams.get('error'))

      if (isExpiredInHash || isExpiredInSearch) {
        setIsLinkExpired(true)
        setIsAuthorized(false)
        setCheckingSession(false)
        // Ensure any local session is signed out so stale profile is not shown
        supabase.auth.signOut({ scope: 'local' }).catch(() => {})
        return
      }

      // Check URL hash for access_token (implicit recovery grant)
      if (typeof window !== 'undefined' && hash.includes('access_token')) {
        try {
          const hashStr = hash.replace(/^#/, '')
          const hashParams = new URLSearchParams(hashStr)
          const accessToken = hashParams.get('access_token')

          if (accessToken) {
            setRecoveryAccessToken(accessToken)
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

      // Check search params for code (PKCE flow)
      const code = searchParams.get('code')
      if (code) {
        try {
          const { data: codeData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
          if (!codeErr && codeData?.session) {
            setIsAuthorized(true)
            setCheckingSession(false)
            return
          }
        } catch (codeErr) {
          console.warn('Error exchanging code:', codeErr)
        }
      }

      // Check search params for token_hash (verifyOtp flow)
      const token_hash = searchParams.get('token_hash')
      const type = (searchParams.get('type') as any) || 'recovery'
      if (token_hash) {
        try {
          const { data: otpData, error: otpErr } = await supabase.auth.verifyOtp({
            type,
            token_hash,
          })
          if (!otpErr && otpData?.session) {
            setIsAuthorized(true)
            setCheckingSession(false)
            return
          }
        } catch (otpErr) {
          console.warn('Error verifying otp token_hash:', otpErr)
        }
      }

      // Check existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsAuthorized(true)
        setCheckingSession(false)
        return
      }

      // If no valid token found, mark link as expired / invalid
      setIsLinkExpired(true)
      setIsAuthorized(false)
      setCheckingSession(false)
    }

    checkSession()

    // Listen to PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        if (hash.includes('error=') || hash.includes('otp_expired')) {
          return // Do not authorize if hash reports error
        }

        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setIsAuthorized(true)
          setCheckingSession(false)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [searchParams])

  // 2. Real-time Password Strength & Advisory Breach Check
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null)
      setPasswordBreach(null)
      return
    }

    const strength = getPasswordStrength(password)
    setPasswordStrength(strength)

    // Debounced advisory breach check (only if 8+ chars)
    if (password.length >= 8) {
      const timer = setTimeout(async () => {
        try {
          const breach = await checkPasswordBreach(password)
          setPasswordBreach(breach)
        } catch {
          setPasswordBreach(null)
        }
      }, 700)
      return () => clearTimeout(timer)
    } else {
      setPasswordBreach(null)
    }
  }, [password])

  // Real-time requirement criteria
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch && !isSubmitting

  const handleBackToHome = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: 'local' })
    } catch {}
    router.push('/')
  }

  // Step D: Force complete Sign-Out immediately after updating password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!isFormValid) {
      setErrorMsg('Please ensure all 4 password requirements are satisfied and passwords match.')
      return
    }

    const validationResult = updatePasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!validationResult.success) {
      setErrorMsg(validationResult.error.errors[0]?.message || 'Please check your password inputs.')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      let updateSucceeded = false

      // Attempt 1: Standard client-side session update
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (!updateError) {
          updateSucceeded = true
        } else {
          console.warn('[ResetPassword] Client updateUser error, engaging server fallback:', updateError.message)
        }
      } catch (clientEx: any) {
        console.warn('[ResetPassword] Client updateUser exception, engaging server fallback:', clientEx?.message)
      }

      // Attempt 2: Server-side API with recovery Bearer token
      if (!updateSucceeded && recoveryAccessToken) {
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${recoveryAccessToken}`,
            },
            body: JSON.stringify({
              newPassword: password,
              confirmPassword: confirmPassword,
            }),
          })

          const result = await response.json()
          if (response.ok && result.success) {
            updateSucceeded = true
          } else {
            throw new Error(result.error || 'Failed to update password.')
          }
        } catch (apiErr: any) {
          setErrorMsg(apiErr.message || 'Failed to update password. Please request a fresh reset link.')
          setIsSubmitting(false)
          return
        }
      }

      if (!updateSucceeded) {
        setErrorMsg('Failed to update password. Please request a fresh reset link.')
        setIsSubmitting(false)
        return
      }

      // CRITICAL SECURITY STEP: Immediately destroy the recovery session
      // so user is logged out everywhere and must log in fresh with new password.
      await supabase.auth.signOut({ scope: 'global' }).catch(() => {})

      // Clear all auth tokens from browser storage
      if (typeof window !== 'undefined') {
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
              localStorage.removeItem(key)
            }
          })
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
              sessionStorage.removeItem(key)
            }
          })
        } catch {}
      }

      isSubmittedSuccessfully.current = true
      setSuccess(true)
      setIsSubmitting(false)

      // Redirect to /login in the SAME tab after showing confirmation
      setTimeout(() => {
        router.replace('/login?reset=success')
      }, 1500)
    } catch (err: any) {
      console.error('Password update error:', err)
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background Gradients and Grid Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      </div>

      {/* Back to Home Button (Same-Tab) */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 md:top-8 md:left-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:bg-muted transition-all text-sm font-medium text-foreground shadow-sm cursor-pointer"
        aria-label="Return to Home"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">
          <Home className="w-4 h-4" />
        </span>
      </button>

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
            {success ? 'Password Reset Complete' : 'Set New Password'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            {success
              ? 'Your password has been updated successfully!'
              : isLinkExpired || !isAuthorized
              ? 'This reset link is expired or invalid.'
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
          ) : isLinkExpired || !isAuthorized ? (
            /* EXPIRED OR INVALID LINK STATE - NO PASSWORD INPUTS SHOWN */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Email link is invalid or has expired</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For your security, password reset links expire after a short period and can only be used once. Please request a fresh link.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/forgot-password"
                  target="_self"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  Request New Reset Link
                </Link>
                <Link
                  href="/login"
                  target="_self"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground text-xs transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : success ? (
            /* SUCCESS STATE */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Your password has been updated successfully!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You have been securely signed out. Redirecting you to sign in...
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login?reset=success"
                  target="_self"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all text-sm"
                >
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
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
                    disabled={isSubmitting}
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
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

                {/* Non-blocking Advisory Breach Notice (Never blocks submit) */}
                {passwordBreach?.isBreached && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {passwordBreach.error || 'This password has appeared in public data breaches. We recommend choosing a unique password.'}
                    </span>
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
                    disabled={isSubmitting}
                    className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
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
                      hasMinLength ? 'text-emerald-500 font-medium' : ''
                    }`}
                  >
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUppercase ? 'text-emerald-500 font-medium' : ''
                    }`}
                  >
                    {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasNumber ? 'text-emerald-500 font-medium' : ''
                    }`}
                  >
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>One number</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSpecial ? 'text-emerald-500 font-medium' : ''
                    }`}
                  >
                    {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              {/* Vibrant solid primary blue Update Password button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  isFormValid
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-blue-500/25 active:scale-[0.99]'
                    : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
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
