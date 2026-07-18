'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>({
    loading: true,
    session: null,
    user: null,
    cookies: [],
    error: null,
  })

  useEffect(() => {
    async function runDiagnostics() {
      try {
        const supabase = createClient()
        
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Get cookies
        const cookies = document.cookie.split(';').map(c => c.trim())
        const supabaseCookies = cookies.filter(c => c.startsWith('sb-'))
        
        setDiagnostics({
          loading: false,
          session: session ? {
            user_id: session.user.id,
            email: session.user.email,
            expires_at: session.expires_at,
            access_token: session.access_token ? 'Present (hidden)' : 'Missing',
            refresh_token: session.refresh_token ? 'Present (hidden)' : 'Missing',
          } : null,
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
          } : null,
          cookies: supabaseCookies,
          sessionError: sessionError?.message,
          userError: userError?.message,
          env: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
          }
        })
      } catch (error: any) {
        setDiagnostics({
          loading: false,
          error: error.message,
        })
      }
    }
    
    runDiagnostics()
  }, [])

  if (diagnostics.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Running diagnostics...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Auth Diagnostics</h1>
        
        {diagnostics.error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="font-mono text-sm">{diagnostics.error}</p>
          </div>
        )}
        
        {/* Environment */}
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>NEXT_PUBLIC_SUPABASE_URL: <span className={diagnostics.env?.supabaseUrl === 'Set' ? 'text-green-400' : 'text-red-400'}>{diagnostics.env?.supabaseUrl}</span></div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: <span className={diagnostics.env?.supabaseKey === 'Set' ? 'text-green-400' : 'text-red-400'}>{diagnostics.env?.supabaseKey}</span></div>
          </div>
        </div>

        {/* Session */}
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Session Status</h2>
          {diagnostics.sessionError && (
            <div className="text-red-400 mb-4">Error: {diagnostics.sessionError}</div>
          )}
          {diagnostics.session ? (
            <div className="space-y-2 font-mono text-sm">
              <div>✅ Session exists</div>
              <div>User ID: {diagnostics.session.user_id}</div>
              <div>Email: {diagnostics.session.email}</div>
              <div>Expires: {new Date(diagnostics.session.expires_at * 1000).toLocaleString()}</div>
              <div>Access Token: <span className={diagnostics.session.access_token === 'Present (hidden)' ? 'text-green-400' : 'text-red-400'}>{diagnostics.session.access_token}</span></div>
              <div>Refresh Token: <span className={diagnostics.session.refresh_token === 'Present (hidden)' ? 'text-green-400' : 'text-red-400'}>{diagnostics.session.refresh_token}</span></div>
            </div>
          ) : (
            <div className="text-red-400">❌ No session found</div>
          )}
        </div>

        {/* User */}
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User Status</h2>
          {diagnostics.userError && (
            <div className="text-red-400 mb-4">Error: {diagnostics.userError}</div>
          )}
          {diagnostics.user ? (
            <div className="space-y-2 font-mono text-sm">
              <div>✅ User authenticated</div>
              <div>ID: {diagnostics.user.id}</div>
              <div>Email: {diagnostics.user.email}</div>
              <div>Created: {new Date(diagnostics.user.created_at).toLocaleString()}</div>
              <div>Last Sign In: {new Date(diagnostics.user.last_sign_in_at).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-red-400">❌ No user found</div>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Supabase Cookies</h2>
          {diagnostics.cookies.length > 0 ? (
            <div className="space-y-2">
              <div className="text-green-400 mb-2">✅ {diagnostics.cookies.length} cookie(s) found</div>
              <div className="space-y-1 font-mono text-xs">
                {diagnostics.cookies.map((cookie: string, i: number) => (
                  <div key={i} className="text-slate-400">{cookie.split('=')[0]}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-red-400">❌ No Supabase cookies found</div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-slate-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Refresh Diagnostics
            </button>
            <button
              onClick={() => {
                document.cookie.split(";").forEach(c => {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                window.location.href = '/admin/login';
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Clear Cookies & Re-login
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 cl