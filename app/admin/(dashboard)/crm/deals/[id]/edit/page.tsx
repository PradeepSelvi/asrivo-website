'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDealById, updateDeal } from '@/lib/supabase/crm-actions'
import { getCurrencies } from '@/lib/crm/currency-utils'
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function EditDealPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currencies, setCurrencies] = useState<Array<{ code: string; symbol: string; name: string }>>([])

  // Form state
  const [dealName, setDealName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [stage, setStage] = useState('qualification')
  const [dealValue, setDealValue] = useState('')
  const [probability, setProbability] = useState('')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [dealType, setDealType] = useState('')
  const [productService, setProductService] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    // Load currencies
    const loadedCurrencies = getCurrencies()
    setCurrencies(loadedCurrencies)

    // Load deal data
    async function loadDeal() {
      const result = await getDealById(parseInt(params.id))
      if (result.success && result.data) {
        const deal = result.data
        setDealName(deal.deal_name || '')
        setContactName(deal.contact_name || '')
        setContactEmail(deal.contact_email || '')
        setCompanyName(deal.company_name || '')
        setStage(deal.stage || 'qualification')
        setDealValue(deal.deal_value?.toString() || '')
        setProbability(deal.probability?.toString() || '')
        setExpectedCloseDate(deal.expected_close_date || '')
        setDealType(deal.deal_type || '')
        setProductService(deal.product_service || '')
        setCurrency(deal.currency || 'USD')
        setDescription(deal.description || '')
        setNotes(deal.notes || '')
      } else {
        setErrorMsg('Failed to load deal')
      }
      setLoading(false)
    }
    loadDeal()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)

    // Validation
    if (!dealName.trim()) {
      setErrorMsg('Deal name is required')
      setSaving(false)
      return
    }

    if (!contactEmail.trim()) {
      setErrorMsg('Contact email is required')
      setSaving(false)
      return
    }

    const result = await updateDeal(parseInt(params.id), {
      deal_name: dealName,
      contact_name: contactName,
      contact_email: contactEmail,
      company_name: companyName || undefined,
      stage,
      deal_value: dealValue ? parseFloat(dealValue) : undefined,
      probability: probability ? parseInt(probability) : undefined,
      expected_close_date: expectedCloseDate || undefined,
      deal_type: dealType || undefined,
      product_service: productService || undefined,
      currency,
      description: description || undefined,
      notes: notes || undefined,
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update deal')
      setSaving(false)
    } else {
      router.push(`/admin/crm/deals/${params.id}`)
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/crm/deals/${params.id}`} className="p-2 bg-card border border-border rounded-lg hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Deal</h1>
          <p className="text-sm text-muted-foreground mt-1">Update deal information</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Deal Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Deal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Deal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed-won">Closed Won</option>
                  <option value="closed-lost">Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Deal Type
                </label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select type...</option>
                  <option value="new-business">New Business</option>
                  <option value="existing-customer">Existing Customer</option>
                  <option value="renewal">Renewal</option>
                  <option value="upsell">Upsell</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

        {/* Deal Value & Dates */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Value & Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Deal Value
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="50000"
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
                placeholder="50"
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
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Product/Service
              </label>
              <input
                type="text"
                value={productService}
                onChange={(e) => setProductService(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g., Enterprise Software License"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder="Deal overview and key details..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                placeholder="Internal notes about this deal..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link
            href={`/admin/crm/deals/${params.id}`}
            className="bg-muted hover:bg-muted/80 text-foreground px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
