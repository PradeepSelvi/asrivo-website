'use client'

import { useState } from 'react'
import { Search, Mail, ShieldCheck, RefreshCw } from 'lucide-react'

interface Inquiry {
  id: number
  company: string
  project_types: string[] | string
  budget_range?: string
  timeline?: string
  status: string
  created_at: string
}

interface Complaint {
  id: number
  subject: string
  category: string
  status: string
  created_at: string
}

type Step = 'email' | 'otp' | 'results'

const STATUS_COLORS: Record<string, string> = {
  new:        'bg-blue-500/10 border-blue-500/30 text-blue-600',
  contacted:  'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
  qualified:  'bg-purple-500/10 border-purple-500/30 text-purple-600',
  converted:  'bg-green-500/10 border-green-500/30 text-green-600',
  resolved:   'bg-green-500/10 border-green-500/30 text-green-600',
  rejected:   'bg-red-500/10 border-red-500/30 text-red-600',
  pending:    'bg-orange-500/10 border-orange-500/30 text-orange-600',
  reviewing:  'bg-indigo-500/10 border-indigo-500/30 text-indigo-600',
}

const STATUS_LABELS: Record<string, string> = {
  new:        'New',
  contacted:  'Contacted',
  qualified:  'Qualified',
  converted:  'Converted',
  resolved:   'Resolved',
  rejected:   'Rejected',
  pending:    'Pending',
  reviewing:  'Under Review',
}

function statusColor(s: string) {
  return STATUS_COLORS[s] ?? 'bg-muted/40 border-border text-foreground'
}
function statusLabel(s: string) {
  return STATUS_LABELS[s] ?? s.replace(/_/g, ' ').toUpperCase()
}

export function InquiryStatusChecker() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])

  // Step 1 — request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/status/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Failed to send verification code.')
      } else {
        setMessage(data.message)
        setStep('otp')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify OTP and fetch results
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/status/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Invalid verification code.')
      } else {
        setInquiries(data.inquiries ?? [])
        setComplaints(data.complaints ?? [])
        setMessage(data.message ?? null)
        setStep('results')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
    setEmail('')
    setOtp('')
    setError(null)
    setMessage(null)
    setInquiries([])
    setComplaints([])
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-8 shadow-lg">

      {/* Step 1 — Email entry */}
      {step === 'email' && (
        <form onSubmit={handleRequestOTP} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a secure verification code.
            </p>
          </div>
          <div>
            <label htmlFor="status-email" className="block text-sm font-semibold text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="status-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 pl-12 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* Step 2 — OTP entry */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              {message ?? `A 6-digit code was sent to ${email}.`}
            </p>
          </div>
          <div>
            <label htmlFor="status-otp" className="block text-sm font-semibold text-foreground mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="status-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="000000"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & View Status'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Step 3 — Results */}
      {step === 'results' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing results for <span className="font-medium text-foreground">{email}</span>
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Search again
            </button>
          </div>

          {message && inquiries.length === 0 && complaints.length === 0 && (
            <div className="p-4 bg-muted/40 border border-border rounded-lg text-sm text-muted-foreground text-center">
              {message}
            </div>
          )}

          {/* Inquiries */}
          {inquiries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Service Inquiries
              </h3>
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{inquiry.company || 'Inquiry'}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(inquiry.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor(inquiry.status)}`}>
                      {statusLabel(inquiry.status)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    {inquiry.project_types && (
                      <p>
                        <span className="font-medium text-foreground">Type: </span>
                        {Array.isArray(inquiry.project_types) ? inquiry.project_types.join(', ') : inquiry.project_types}
                      </p>
                    )}
                    {inquiry.timeline && (
                      <p><span className="font-medium text-foreground">Timeline: </span>{inquiry.timeline}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Complaints */}
          {complaints.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Complaints
              </h3>
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/40 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{complaint.subject}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {complaint.category} · {new Date(complaint.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColor(complaint.status)}`}>
                      {statusLabel(complaint.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
