'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Inquiry {
  id: number
  name: string
  company: string
  status: string
  createdAt: string
  projectTypes: string[] | string
  budgetRange?: string
  timeline?: string
}

export function InquiryStatusChecker() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; inquiries?: Inquiry[]; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/inquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
      contacted: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
      qualified: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
      converted: 'bg-green-500/10 border-green-500/30 text-green-500',
      rejected: 'bg-red-500/10 border-red-500/30 text-red-500'
    }
    return colors[status as keyof typeof colors] || colors.new
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      new: '🆕 New',
      contacted: '📞 Contacted',
      qualified: '✅ Qualified',
      converted: '🎉 Converted',
      rejected: '❌ Rejected'
    }
    return labels[status as keyof typeof labels] || status.toUpperCase()
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-8 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your email address"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {result.error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm font-medium">{result.error}</p>
            </div>
          ) : result.inquiries && result.inquiries.length > 0 ? (
            <>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-500 text-sm font-semibold">
                  ✓ Found {result.inquiries.length} inquiry{result.inquiries.length > 1 ? '(ies)' : ''}
                </p>
              </div>
              
              <div className="space-y-3">
                {result.inquiries.map((inquiry) => (
                  <div 
                    key={inquiry.id}
                    className="p-5 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{inquiry.company}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(inquiry.status)}`}>
                        {getStatusLabel(inquiry.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {inquiry.projectTypes && (
                        <div className="flex gap-2">
                          <span className="font-medium text-foreground min-w-[80px]">Project:</span>
                          <span className="text-muted-foreground">
                            {Array.isArray(inquiry.projectTypes) 
                              ? inquiry.projectTypes.join(', ') 
                              : inquiry.projectTypes}
                          </span>
                        </div>
                      )}
                      {inquiry.budgetRange && (
                        <div className="flex gap-2">
                          <span className="font-medium text-foreground min-w-[80px]">Budget:</span>
                          <span className="text-muted-foreground">{inquiry.budgetRange}</span>
                        </div>
                      )}
                      {inquiry.timeline && (
                        <div className="flex gap-2">
                          <span className="font-medium text-foreground min-w-[80px]">Timeline:</span>
                          <span className="text-muted-foreground">{inquiry.timeline}</span>
                        </div>
                      )}
                    </div>

                    {inquiry.status === 'new' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          We'll review your inquiry and get back to you within 24 hours
                        </p>
                      </div>
                    )}
                    {inquiry.status === 'contacted' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          📧 We've reached out to you. Please check your email
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
