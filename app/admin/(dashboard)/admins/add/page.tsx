'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addAdmin } from '@/lib/supabase/admin-actions'
import { ArrowLeft, Loader2, UserPlus, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AddAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'high' | 'low'>('low')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await addAdmin(email, role)

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to add administrator')
      setLoading(false)
    } else {
      router.push('/admin/admins')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/admins" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Add Administrator</h1>
          <p className="text-xs text-slate-500 mt-0.5">Register a new administrator profile.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            placeholder="admin@asrivotech.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Permission Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'high' | 'low')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="low">Low (Editor Access - Read & Edit Only)</option>
            <option value="high">High (Super Admin Access - Full Control)</option>
          </select>
        </div>

        <div className="border border-indigo-950 bg-indigo-950/20 rounded-xl p-4 flex gap-3 text-xs text-indigo-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>
            New administrators will be created with a default password of <strong className="text-indigo-300">AdminPassword123!</strong>. 
            They should log in and change their password using standard account controls.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/admins" className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-semibold py-2.5 rounded-xl border border-slate-700 transition-all text-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create Admin
          </button>
        </div>
      </form>
    </div>
  )
}
