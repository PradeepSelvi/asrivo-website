'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Home, Loader2, User, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { validateEmail, checkPasswordBreach, getPasswordStrength } from '@/lib/utils/security-validation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Security validation states
  const [emailValidating, setEmailValidating] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string } | null>(null)
  const [passwordChecking, setPasswordChecking] = useState(false)
  const [passwordBreach, setPasswordBreach] = useState<{ isBreached: boolean; error?: string } | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[]; isStrong: boolean } | null>(null)

  // Validate email when user finishes typing (debounced)
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailValidation(null)
      return
    }

    const timer = setTimeout(async () => {
      setEmailValidating(true)
      const result = await validateEmail(email)
      setEmailValidation(result)
      setEmailValidating(false)
    }, 800) // Wait 800ms after user stops typing

    return () => clearTimeout(timer)
  }, [email])

  // Check password strength and breaches when user types
  useEffect(() => {
    if (!password || password.length < 3) {
      setPasswordStrength(null)
      setPasswordBreach(null)
      return
    }

    // Calculate strength immediately
    const strength = getPasswordStrength(password)
    setPasswordStrength(strength)

    // Check breaches with debounce
    const timer = setTimeout(async () => {
      if (password.length >= 8) {
        setPasswordChecking(true)
        const result = await checkPasswordBreach(password)
        setPasswordBreach(result)
        setPasswordChecking(false)
      }
    }, 1000) // Wait 1s after user stops typing

    return () => clearTimeout(timer)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.')
      setLoading(false)
      return
    }

    // Check email validation
    if (emailValidation && !emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Please use a valid email address.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    // Check password breach
    if (passwordBreach && passwordBreach.isBreached) {
      setErrorMsg(passwordBreach.error || 'This password has been compromised. Please choose a different password.')
      setLoading(false)
      return
    }

    // Warn if password is weak
    if (passwordStrength && !passwordStrength.isStrong) {
      setErrorMsg('Password is too weak. Please create a stronger password with a mix of uppercase, lowercase, numbers, and special characters.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (authError) {
        setErrorMsg(authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Check if email is already registered
        if (authData.user.identities && authData.user.identities.length === 0) {
          setErrorMsg('This email is already registered. Please login instead.')
          setLoading(false)
          return
        }

        // Profile will be created automatically by database trigger
        // Check if email confirmation is required
        const session = authData.session
        if (!session) {
          // Email confirmation is required
          setErrorMsg('Registration successful! Please check your email and click the confirmation link before logging in.')
          setLoading(false)
          // Wait 3 seconds then redirect to login
          setTimeout(() => {
            router.push('/login')
          }, 3000)
          return
        }

        // Success - user is logged in immediately (email confirmation disabled)
        // Redirect to profile page to complete setup
        router.push('/profile')
        router.refresh()
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrorMsg('An unexpected error occurred. Please try again.')
      setLoading(false)
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
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-2">Join Asrivo Tech today</p>
        </div>

        <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
              <div className="text-destructive text-sm">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
              </div>
            </div>

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
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
                {emailValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                )}
                {!emailValidating && emailValidation && email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValidation.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {!emailValidating && emailValidation && !emailValidation.isValid && (
                <p className="text-xs text-destructive mt-1">{emailValidation.error}</p>
              )}
              {!emailValidating && emailValidation && emailValidation.isValid && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Email verified as valid
                </p>
              )}
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
                  minLength={8}
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
              
              {/* Password Strength Indicator */}
              {passwordStrength && password.length >= 3 && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score === 0 ? 'w-1/5 bg-red-500' :
                          passwordStrength.score === 1 ? 'w-2/5 bg-orange-500' :
                          passwordStrength.score === 2 ? 'w-3/5 bg-yellow-500' :
                          passwordStrength.score === 3 ? 'w-4/5 bg-lime-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 1 ? 'text-red-600' :
                      passwordStrength.score === 2 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.score <= 1 ? 'Weak' :
                       passwordStrength.score === 2 ? 'Fair' :
                       passwordStrength.score === 3 ? 'Good' :
                       'Strong'}
                    </span>
                  </div>
                  
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {passwordStrength.feedback.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-yellow-600">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {/* Password Breach Check */}
              {passwordChecking && password.length >= 8 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking password security...
                </p>
              )}
              
              {!passwordChecking && passwordBreach && password.length >= 8 && (
                <div className="mt-1">
                  {passwordBreach.isBreached ? (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {passwordBreach.error}
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Password not found in breach databases
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">Minimum 8 characters, mix of letters, numbers, and symbols</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
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
