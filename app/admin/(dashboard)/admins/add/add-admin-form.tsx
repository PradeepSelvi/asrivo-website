'use client'

import React, { useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'

interface AddAdminFormProps {
  handleAddAdmin: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export default function AddAdminForm({ handleAddAdmin }: AddAdminFormProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await handleAddAdmin(formData)

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to add administrator')
        setLoading(false)
      }
      // On success, the server action will redirect automatically
    } catch (error) {
      setErrorMsg('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            name="email"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="admin@asrivotech.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Permission Role</label>
          <select
            name="role"
            defaultValue="low"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low (Editor Access - Read & Edit Only)</option>
            <option value="high">High (Super Admin Access - Full Control)</option>
          </select>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> A temporary password will be generated and sent to the admin's email address.
          </p>
        </div>

        <div className="flex gap-3">
          <a href="/admin/admins" className="flex-1 bg-muted hover:bg-slate-750 text-foreground text-sm font-semibold py-2.5 rounded-xl border border-border transition-all text-center">
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create Admin
          </button>
        </div>
      </form>
    </>
  )
}
