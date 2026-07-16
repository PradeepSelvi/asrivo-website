import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin, updateAdminRole } from '@/lib/supabase/admin-actions'
import { notFound, redirect } from 'next/navigation'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ChangeRolePageProps {
  params: Promise<{ id: string }>
}

export default async function ChangeRolePage({ params }: ChangeRolePageProps) {
  const { id } = await params
  
  // Guard access on server-side
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch admin profile details
  const { data: profile, error } = await supabase
    .from('admin_profiles')
    .select('id, email, role')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const handleSave = async (formData: FormData) => {
    'use server'
    const newRole = formData.get('role') as 'high' | 'low'
    const result = await updateAdminRole(id, newRole)
    if (result.success) {
      redirect('/admin/admins')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/admins" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Update Privileges</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Change Admin Role</h1>
          <p className="text-sm text-muted-foreground">
            Modify permissions for <strong className="text-foreground">{profile.email}</strong>.
          </p>
        </div>

        <form action={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Role</label>
            <select
              name="role"
              defaultValue={profile.role}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="low">Low (Editor Access - Read & Edit Only)</option>
              <option value="high">High (Super Admin Access - Full Control)</option>
            </select>
          </div>

          <div className="border border-primary/20 bg-primary/10 rounded-xl p-4 flex gap-3 text-xs text-primary">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>
              Changing the role to Low limits the user to content editing only, and blocks them from settings or adding other admins.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/admins" className="flex-1 bg-muted hover:bg-muted text-foreground text-sm font-semibold py-2.5 rounded-xl border border-border transition-all text-center">
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold py-2.5 rounded-xl transition-all"
            >
              Save Role
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
