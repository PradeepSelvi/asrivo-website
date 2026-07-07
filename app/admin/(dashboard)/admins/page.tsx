import React from 'react'
import { getCurrentAdmin, getAdmins } from '@/lib/supabase/admin-actions'
import { redirect } from 'next/navigation'
import { Shield, ShieldCheck, ShieldOff, UserPlus, Trash2, User, AlertTriangle } from 'lucide-react'

export default async function AdminManageAdminsPage() {
  // Server-side gate: only high admins can reach this page
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin')
  }

  const adminsResult = await getAdmins()
  const currentUserId = adminResult.user!.id
  const admins = adminsResult.success ? adminsResult.data : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Admins</h1>
          <p className="text-slate-400 text-sm mt-1">Add, remove, and manage admin user roles.</p>
        </div>
      </div>

      {/* Security Warning */}
      <div className="border border-amber-900/40 bg-amber-950/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-300">High Security Area</p>
          <p className="text-xs text-amber-500/80 mt-0.5">
            Only <strong>High role</strong> admins can access this section. Actions taken here affect user authentication.
          </p>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Current Admin Accounts ({admins?.length || 0})
          </h2>
          <a
            href="/admin/admins/add"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Admin
          </a>
        </div>
        <div className="divide-y divide-slate-800/60">
          {!admins || admins.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Shield className="w-8 h-8 mx-auto mb-2 text-slate-700" />
              <p>No admins found.</p>
            </div>
          ) : (
            admins.map((admin: any) => (
              <div key={admin.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-100">{admin.email}</p>
                      {admin.id === currentUserId && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{admin.id.slice(0, 16)}…</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    admin.role === 'high'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {admin.role === 'high' ? <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> : <Shield className="w-3.5 h-3.5 inline mr-1" />}
                    {admin.role} role
                  </span>
                  {admin.id !== currentUserId && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/admins/${admin.id}/change-role`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        title="Change role"
                      >
                        <ShieldOff className="w-4 h-4" />
                      </a>
                      <a
                        href={`/admin/admins/${admin.id}/remove`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Remove admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
