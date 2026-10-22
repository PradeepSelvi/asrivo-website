'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lock, LogIn, UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthGateProps {
  children: React.ReactNode
  /** Message shown above the sign-in prompt */
  message?: string
}

/**
 * Wraps a form/page that requires the user to be signed in.
 * Shows a sign-in prompt if the session is missing; renders children otherwise.
 * The login link passes `?redirectTo=<current-path>` so the user lands back
 * on this page after authenticating.
 */
export function AuthGate({
  children,
  message = 'You need to be signed in to access this page.',
}: AuthGateProps) {
  const pathname = usePathname()
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    const supabase = createClient()

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    // Listen for auth state changes (login/logout in another tab, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const redirectTo = encodeURIComponent(pathname)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{message}</p>

          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" asChild>
              <Link href={`/login?redirectTo=${redirectTo}`}>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href={`/register?redirectTo=${redirectTo}`}>
                <UserPlus className="mr-2 h-5 w-5" />
                Create an Account
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Looking for the{' '}
            <Link href="/services/inquiry" className="text-primary hover:underline font-medium">
              Service Inquiry form
            </Link>
            ? That one doesn&apos;t require an account.
          </p>
        </div>
      </div>
    )
  }

  // Authenticated — render the form as normal
  return <>{children}</>
}
