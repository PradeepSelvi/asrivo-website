'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInquiryStatus, updateInquiryNotes, deleteInquiry } from '@/lib/supabase/content-actions'
import { ArrowLeft, Clock, Building, Mail, Phone, User, Trash2, Loader2, AlertTriangle, CheckCircle, Save, DollarSign, Timer, Briefcase } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
]

export default function InquiryDetailClient({ inquiry, isHigh }: { inquiry: any; isHigh: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [notes, setNotes] = useState(inquiry.notes || '')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleStatusChange = (newStatus: string) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, newStatus)
      if (result.success) {
        setSuccessMsg(`Status updated to "${newStatus}"`)
        router.refresh()
      } else {
        setErrorMsg(result.error || 'Failed to update status')
      }
    })
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    const result = await updateInquiryNotes(inquiry.id, notes)
    if (result.success) {
      setSuccessMsg('Internal notes saved')
    } else {
      setErrorMsg(result.error || 'Failed to save notes')
    }
    setSavingNotes(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this inquiry?')) return
    setDeleting(true)
    const result = await deleteInquiry(inquiry.id)
    if (result.success) {
      router.push('/admin/inquiries')
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
          <Link href="/admin/inquiries" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Inquiry Detail</h1>
            <p className="text-xs text-slate-500 mt-0.5">View and manage this service inquiry.</p>
          </div>
        </div>
        {isHigh && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
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
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Inquiry Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
            <p className="text-sm text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" /> {inquiry.name}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
            <p className="text-sm text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <a href={`mailto:${inquiry.email}`} className="text-indigo-400 hover:text-indigo-300">{inquiry.email}</a>
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" /> {inquiry.phone || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" /> {inquiry.company || '—'}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Type</label>
            <p className="text-sm text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span className="capitalize">{inquiry.service_type?.replace(/-/g, ' ') || '—'}</span>
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</label>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> {inquiry.budget || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</label>
            <p className="text-sm text-slate-300 flex items-center gap-2 capitalize">
              <Timer className="w-4 h-4 text-amber-400" /> {inquiry.timeline?.replace(/-/g, ' ') || '—'}
            </p>
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-1 pt-3 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Description</label>
          <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            {inquiry.project_description || inquiry.message || '—'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-800">
          <Clock className="w-3.5 h-3.5" />
          Submitted: {new Date(inquiry.created_at).toLocaleString()}
        </div>
      </div>

      {/* Status Update Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Status Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={isPending || inquiry.status === opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 ${opt.color} ${
                inquiry.status === opt.value ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-indigo-500' : 'hover:scale-105'
              }`}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Internal Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32 resize-none placeholder-slate-600"
          placeholder="Add internal notes about this inquiry (only visible to admins)..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}
