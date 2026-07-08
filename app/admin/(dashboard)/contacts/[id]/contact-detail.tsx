'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateContactStatus, deleteContact } from '@/lib/supabase/content-actions'
import { ArrowLeft, Clock, Building, Mail, Phone, User, Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'unread', label: 'Unread', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { value: 'read', label: 'Read', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'responded', label: 'Responded', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'archived', label: 'Archived', color: 'bg-muted/50 text-muted-foreground border-border' },
]

export default function ContactDetailClient({ contact, isHigh }: { contact: any; isHigh: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStatusChange = (newStatus: string) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    startTransition(async () => {
      const result = await updateContactStatus(contact.id, newStatus)
      if (result.success) {
        setSuccessMsg(`Status updated to "${newStatus}"`)
        router.refresh()
      } else {
        setErrorMsg(result.error || 'Failed to update status')
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this contact message?')) return
    setDeleting(true)
    const result = await deleteContact(contact.id)
    if (result.success) {
      router.push('/admin/contacts')
      router.refresh()
    } else {
      setErrorMsg(result.error || 'Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/contacts" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Detail</h1>
            <p className="text-xs text-muted-foreground mt-0.5">View and manage this contact submission.</p>
          </div>
        </div>
        {isHigh && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Contact Info Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> {contact.name}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:text-primary/80">{contact.email}</a>
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" /> {contact.phone || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" /> {contact.company || '—'}
            </p>
          </div>
        </div>

        {contact.subject && (
          <div className="space-y-1 pt-3 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label>
            <p className="text-sm text-foreground font-medium">{contact.subject}</p>
          </div>
        )}

        <div className="space-y-1 pt-3 border-t border-border">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
          <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 rounded-xl p-4 border border-border">
            {contact.message}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
          <Clock className="w-3.5 h-3.5" />
          Submitted: {new Date(contact.created_at).toLocaleString()}
        </div>
      </div>

      {/* Status Update Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={isPending || contact.status === opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 ${opt.color} ${
                contact.status === opt.value ? 'ring-2 ring-offset-1 ring-offset-card ring-primary' : 'hover:scale-105'
              }`}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
