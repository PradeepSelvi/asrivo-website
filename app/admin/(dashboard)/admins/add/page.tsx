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
        <Link href="/admin/admins" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Add Administrator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Register a new administrator profile.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            placeholder="admin@asrivotech.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Permission Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'high' | 'low')}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
          >
            <option value="low">Low (Editor Access - Read & Edit Only)</option>
            <option value="high">High (Super Admin Access - Full Control)</option>
          </select>
        </div>

       

        <div className="flex gap-3">
          <Link href="/admin/admins" className="flex-1 bg-muted hover:bg-slate-750 text-foreground text-sm font-semibold py-2.5 rounded-xl border border-border transition-all text-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create Admin
          </button>
        </div>
      </form>
    </div>
  )
}
