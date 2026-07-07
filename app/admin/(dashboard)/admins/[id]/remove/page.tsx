import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin, removeAdmin } from '@/lib/supabase/admin-actions'
import { notFound, redirect } from 'next/navigation'
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RemoveAdminPageProps {
  params: Promise<{ id: string }>
}

export default async function RemoveAdminPage({ params }: RemoveAdminPageProps) {
  const { id } = await params
  
  // Guard access on server-side
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch details
  const { data: profile, error } = await supabase
    .from('admin_profiles')
    .select('id, email, role')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  const handleRemove = async () => {
    'use server'
    const result = await removeAdmin(id)
    if (result.success) {
      redirect('/admin/admins')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/admins" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Revoke Access</span>
      </div>

      <div className="bg-slate-900 border border-red-950/60 rounded-2xl p-6 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 bg-red-950/30 border border-red-900/40 rounded-full flex items-center justify-center mx-auto text-red-500">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Revoke Admin Access?</h1>
          <p className="text-sm text-slate-400">
            Are you sure you want to remove <strong className="text-slate-200">{profile.email}</strong>? 
            They will lose all administrative privileges and will be permanently deleted from the auth database.
          </p>
        </div>

        <form action={handleRemove} className="flex gap-3">
          <Link href="/admin/admins" className="flex-1 bg-slate-850 hover:bg-slate-850/80 text-slate-300 text-sm font-semibold py-2.5 rounded-xl border border-slate-700 transition-all text-center block">
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Confirm
          </button>
        </form>
      </div>
    </div>
  )
}
