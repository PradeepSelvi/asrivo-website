import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { createClient } from '@/lib/supabase/server'

export default async function TestAuthPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  const adminResult = await getCurrentAdmin()
  
  // This page bypasses middleware to show raw auth state
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>
        
        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Server-Side User Check</h2>
          {user ? (
            <div className="space-y-2">
              <div className="text-green-400">✅ User authenticated</div>
              <div className="font-mono text-sm">
                <div>ID: {user.id}</div>
                <div>Email: {user.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-red-400">
              ❌ No user found
              {userError && <div className="mt-2">Error: {userError.message}</div>}
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Profile Check</h2>
          {adminResult.success && adminResult.user ? (
            <div className="space-y-2">
              <div className="text-green-400">✅ Admin profile found</div>
              <div className="font-mono text-sm">
                <div>ID: {adminResult.user.id}</div>
                <div>Email: {adminResult.user.email}</div>
                <div>Role: {adminResult.user.role}</div>
              </div>
            </div>
          ) : (
            <div className="text-red-400">
              ❌ No admin profile found
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <a 
              href="/admin" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded"
            >
              Go to Admin Dashboard
            </a>
            <a 
              href="/admin/login" 
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded"
            >
              Go to Login
            </a>
          </div>
        </div>

        <div className="mt-8 bg-yellow-500/10 border border-yellow-500 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Diagnosis</h2>
          <div className="space-y-2 text-sm">
            {!user && <p>→ Session not found. Clear cookies and re-login.</p>}
            {user && !adminResult.success && <p>→ Admin profile missing. Run SQL to add profile.</p>}
            {user && adminResult.success && <p>→ Everything looks good! Try navigating.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
