'use client'

import React, { useState } from 'react'
import { Loader2, UserPlus, Copy, Check } from 'lucide-react'

interface AddAdminFormProps {
  handleAddAdmin: (formData: FormData) => Promise<{ success: boolean; error?: string; message?: string }>
}

export default function AddAdminForm({ handleAddAdmin }: AddAdminFormProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await handleAddAdmin(formData)

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to add administrator')
        setLoading(false)
      } else if (result.message) {
        setSuccessMsg(result.message)
        setLoading(false)
        // Clear form
        e.currentTarget.reset()
      }
    } catch (error) {
      setErrorMsg('An unexpected error occurred')
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (successMsg) {
      await navigator.clipboard.writeText(successMsg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-2">
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">Admin created successfully!</p>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-3">
            <code className="flex-1 text-xs text-foreground font-mono">{successMsg}</code>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              title="Copy password"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Make sure to save this temporary password. It won't be shown again.
          </p>
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
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Password (Optional)</label>
          <input
            type="password"
            name="password"
            minLength={8}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Leave empty to auto-generate"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 8 characters. If left empty, a secure password will be generated automatically.
          </p>
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
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Note:</strong> {successMsg ? 'Admin created! Share the credentials securely.' : 'Set a strong password or leave empty for auto-generation. Make sure to save and share credentials securely.'}
          </p>
        </div>

        <div className="flex gap-3">
          <a href="/admin/admins" className="flex-1 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold py-2.5 rounded-xl border border-border transition-all text-center">
            Cancel
          </a>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create Admin
          </button>
        </div>
      </form>
    </>
  )
}
