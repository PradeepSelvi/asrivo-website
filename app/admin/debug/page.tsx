import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-actions'

export default async function DebugPage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  let adminProfile = null
  let adminProfileError = null
  let adminProfiles = null

  if (user) {
    // Try to get admin profile with regular client
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    adminProfile = data
    adminProfileError = error

    // Try with admin client
    try {
      const adminSupabase = await createAdminClient()
      const { data: allProfiles } = await adminSupabase
        .from('admin_profiles')
        .select('*')
      adminProfiles = allProfiles
    } catch (e) {
      adminProfiles = { error: String(e) }
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded">
          <h2 className="font-bold mb-2">Current User (from auth.getUser())</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({ user, userError }, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded">
          <h2 className="font-bold mb-2">Admin Profile (regular client with RLS)</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({ adminProfile, adminProfileError }, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded">
          <h2 className="font-bold mb-2">All Admin Profiles (service role - bypass RLS)</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(adminProfiles, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
