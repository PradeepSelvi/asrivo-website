'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createDeal, getLeadById } from '@/lib/supabase/crm-actions'
import { getCurrencies, getDefaultCurrency } from '@/lib/crm/currency-utils'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewDealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead_id')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currencies, setCurrencies] = useState<Array<{ code: string; symbol: string; name: string }>>([])

  // Form state
  const [dealName, setDealName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [dealValue, setDealValue] = useState('')
  const [currency, setCurrency] = useState('')
  const [stage, setStage] = useState('qualification')
  const [probability, setProbability] = useState('50')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [dealType, setDealType] = useState('new-business')
  const [productService, setProductService] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  // Load currencies on mount
  useEffect(() => {
    const loadedCurrencies = getCurrencies()
    setCurrencies(loadedCurrencies)
    setCurrency(getDefaultCurrency())
  }, [])

  // Load lead data if lead_id is provided
  React.useEffect(() => {
    if (leadId) {
      getLeadById(parseInt(leadId)).then(result => {
        if (result.success && result.data) {
          const lead = result.data
          setContactName(`${lead.first_name} ${lead.last_name}`)
          setContactEmail(lead.email)
          setCompanyName(lead.company_name || '')
          setDealName(`${lead.company_name || lead.first_name + ' ' + lead.last_name} - Project`)
        }
      })
    }
  }, [leadId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await createDeal({
      deal_name: dealName,
      contact_name: contactName,
      contact_email: contactEmail,
      company_name: companyName || undefined,
      deal_value: dealValue ? parseFloat(dealValue) : undefined,
      currency,
      stage,
      probability: parseInt(probability),
      expected_close_date: expectedCloseDate || undefined,
      deal_type: dealType,
      product_service: productService || undefined,
      description: description || undefined,
      notes: notes || undefined,
      lead_id: leadId ? parseInt(leadId) : undefined,
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create deal')
      setLoading(false)
    } else {
      router.push('/admin/crm/deals')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/crm/deals" className="p-2 bg-card border border-border rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Deal</h1>
          <p className="text-sm text-muted-foreground mt-1">Add a new sales opportunity to your pipeline</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Deal Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Deal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Deal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Acme Corp - Web Development Project"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="md:col-span-2">
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
          </div>
        </div>

        {/* Deal Value */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Deal Value</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Deal Value
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="50000"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol}) - {curr.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                <Link href="/admin/crm/settings" className="text-primary hover:underline">
                  Manage currencies
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="qualification">Qualification</option>
                <option value="meeting-scheduled">Meeting Scheduled</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Probability (%)
              </label>
              <input
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Deal Type
              </label>
              <select
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="new-business">New Business</option>
                <option value="upsell">Upsell</option>
                <option value="renewal">Renewal</option>
                <option value="cross-sell">Cross-Sell</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Product/Service
              </label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Web Development, Mobile App"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder="Brief description of the opportunity..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder="Internal notes (not visible to client)..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link
            href="/admin/crm/deals"
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
                Create Deal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
