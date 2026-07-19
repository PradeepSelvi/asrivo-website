'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInquiryStatus, updateInquiryNotes, deleteInquiry } from '@/lib/supabase/content-actions'
import { ArrowLeft, Clock, Building, Mail, Phone, User, Trash2, Loader2, AlertTriangle, CheckCircle, Save, DollarSign, Timer, Briefcase } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'qualified', label: 'Qualified', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'rejected', label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20' },
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
          <Link href="/admin/inquiries" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inquiry Detail</h1>
            <p className="text-xs text-muted-foreground mt-0.5">View and manage this service inquiry.</p>
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

      {/* Inquiry Info Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> {inquiry.name}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${inquiry.email}`} className="text-primary hover:text-primary/80">{inquiry.email}</a>
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" /> {inquiry.phone || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600" /> 
              {inquiry.whatsapp ? (
                <a href={`https://wa.me/${inquiry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-500">
                  {inquiry.whatsapp}
                </a>
              ) : '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" /> {inquiry.company || '—'}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Types</label>
            <div className="flex flex-wrap gap-1">
              {inquiry.project_types?.map((type: string, idx: number) => (
                <span key={idx} className="text-xs font-medium bg-primary/10 text-primary/80 border border-primary/20 px-2 py-0.5 rounded-full">
                  {type}
                </span>
              ))}
              {inquiry.other_project_type && (
                <span className="text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {inquiry.other_project_type}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Range</label>
            <p className="text-sm text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> {inquiry.budget_range || '—'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</label>
            <p className="text-sm text-foreground flex items-center gap-2 capitalize">
              <Timer className="w-4 h-4 text-amber-400" /> {inquiry.timeline?.replace(/-/g, ' ') || '—'}
            </p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Platform</label>
            <div className="flex flex-wrap gap-1">
              {inquiry.target_platform?.length > 0 ? inquiry.target_platform.map((platform: string, idx: number) => (
                <span key={idx} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {platform}
                </span>
              )) : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Features</label>
            <div className="flex flex-wrap gap-1">
              {inquiry.key_features?.length > 0 ? inquiry.key_features.map((feature: string, idx: number) => (
                <span key={idx} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  {feature}
                </span>
              )) : <span className="text-sm text-muted-foreground">—</span>}
              {inquiry.other_key_feature && (
                <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full">
                  {inquiry.other_key_feature}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Description</label>
            <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 rounded-xl p-4 border border-border">
              {inquiry.project_description || '—'}
            </p>
          </div>
          
          {inquiry.target_audience && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Audience</label>
              <p className="text-sm text-foreground bg-background/50 rounded-xl p-3 border border-border">
                {inquiry.target_audience}
              </p>
            </div>
          )}
          
          {inquiry.pain_points && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pain Points / Goals</label>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 rounded-xl p-3 border border-border">
                {inquiry.pain_points}
              </p>
            </div>
          )}
          
          {inquiry.reference_links && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference Links</label>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-background/50 rounded-xl p-3 border border-border">
                {inquiry.reference_links}
              </p>
            </div>
          )}
          
          {inquiry.prd_file_url && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PRD Document (Uploaded)</label>
              <a
                href={inquiry.prd_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 bg-primary/10 border border-primary/20 rounded-xl p-3 transition-all hover:bg-primary/20"
              >
                <Briefcase className="w-4 h-4" />
                <span>{inquiry.prd_file_name || 'Download PRD'}</span>
              </a>
            </div>
          )}
          
          {inquiry.prd_text && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PRD (Written)</label>
              <div className="text-sm text-foreground bg-background/50 rounded-xl p-4 border border-border prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-2 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-2 text-foreground">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                    code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-2 text-muted-foreground">{children}</blockquote>,
                  }}
                >
                  {inquiry.prd_text}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border">
          <Clock className="w-3.5 h-3.5" />
          Submitted: {new Date(inquiry.created_at).toLocaleString()}
        </div>
      </div>

      {/* Status Update Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Status Pipeline</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              disabled={isPending || inquiry.status === opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 ${opt.color} ${
                inquiry.status === opt.value ? 'ring-2 ring-offset-1 ring-offset-card ring-primary' : 'hover:scale-105'
              }`}
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Internal Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-32 resize-none placeholder-muted-foreground"
          placeholder="Add internal notes about this inquiry (only visible to admins)..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}
