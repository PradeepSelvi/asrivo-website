'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLead } from '@/lib/supabase/crm-actions'
import { calculateLeadScore, getPriorityFromScore } from '@/lib/crm/lead-scoring'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [leadSource, setLeadSource] = useState('website')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Calculate lead score
    const score = calculateLeadScore({
      company_size: companySize,
      job_title: jobTitle,
      industry,
      lead_source: leadSource,
      phone,
      company_name: companyName,
      company_website: companyWebsite,
      email_domain: email.split('@')[1],
    })

    const priority = getPriorityFromScore(score)

    const result = await createLead({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || undefined,
      company_name: companyName || undefined,
      job_title: jobTitle || undefined,
      company_size: companySize || undefined,
      industry: industry || undefined,
      company_website: companyWebsite || undefined,
      lead_source: leadSource,
      lead_score: score,
      priority,
      notes: notes || undefined,
      lead_status: 'new',
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create lead')
      setLoading(false)
    } else {
      router.push('/admin/crm/leads')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/crm/leads" className="p-2 bg-card border border-border rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Lead</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new lead in your CRM</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. CEO, CTO, Marketing Manager"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select size</option>
                <option value="startup">Startup (1-10)</option>
                <option value="small">Small (11-50)</option>
                <option value="medium">Medium (51-200)</option>
                <option value="enterprise">Enterprise (200+)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Technology, Healthcare"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Lead Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Lead Source
              </label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="linkedin">LinkedIn</option>
                <option value="cold-outreach">Cold Outreach</option>
                <option value="event">Event/Conference</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder="Any additional information about this lead..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link
            href="/admin/crm/leads"
            className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Lead
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
