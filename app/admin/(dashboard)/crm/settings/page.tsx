'use client'

import { useState, useEffect } from 'react'
import { Settings, DollarSign, Save, Plus, X, AlertCircle, Edit, Check } from 'lucide-react'
import { getCurrencies } from '@/lib/crm/currency-utils'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


interface Currency {
  code: string
  symbol: string
  name: string
  isDefault: boolean
  exchangeRate?: number
}

export default function CRMSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Currency settings
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const [newCurrency, setNewCurrency] = useState({ code: '', symbol: '', name: '', exchangeRate: '1.0' })
  const [showAddCurrency, setShowAddCurrency] = useState(false)
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [tempRate, setTempRate] = useState('')

  // Load currencies on mount
  useEffect(() => {
    const loadedCurrencies = getCurrencies()
    setCurrencies(loadedCurrencies)
  }, [])

  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.symbol || !newCurrency.name) {
      setErrorMsg('All currency fields are required')
      return
    }

    // Check if currency code already exists
    if (currencies.some(c => c.code === newCurrency.code.toUpperCase())) {
      setErrorMsg('Currency code already exists')
      return
    }

    const exchangeRate = parseFloat(newCurrency.exchangeRate)
    if (isNaN(exchangeRate) || exchangeRate <= 0) {
      setErrorMsg('Exchange rate must be a positive number')
      return
    }

    setCurrencies([
      ...currencies,
      {
        code: newCurrency.code.toUpperCase(),
        symbol: newCurrency.symbol,
        name: newCurrency.name,
        isDefault: false,
        exchangeRate,
      }
    ])

    setNewCurrency({ code: '', symbol: '', name: '', exchangeRate: '1.0' })
    setShowAddCurrency(false)
    setErrorMsg('')
  }

  const handleRemoveCurrency = (code: string) => {
    // Don't allow removing the default currency
    const currency = currencies.find(c => c.code === code)
    if (currency?.isDefault) {
      setErrorMsg('Cannot remove the default currency')
      return
    }

    setCurrencies(currencies.filter(c => c.code !== code))
    setErrorMsg('')
  }

  const handleSetDefault = (code: string) => {
    setCurrencies(currencies.map(c => ({
      ...c,
      isDefault: c.code === code,
      // Set default currency exchange rate to 1.0
      exchangeRate: c.code === code ? 1.0 : c.exchangeRate
    })))
  }

  const handleStartEditRate = (code: string, currentRate: number) => {
    setEditingRate(code)
    setTempRate(currentRate.toString())
  }

  const handleSaveRate = (code: string) => {
    const rate = parseFloat(tempRate)
    if (isNaN(rate) || rate <= 0) {
      setErrorMsg('Exchange rate must be a positive number')
      return
    }

    setCurrencies(currencies.map(c =>
      c.code === code ? { ...c, exchangeRate: rate } : c
    ))
    setEditingRate(null)
    setTempRate('')
    setErrorMsg('')
  }

  const handleCancelEditRate = () => {
    setEditingRate(null)
    setTempRate('')
    setErrorMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // Save to localStorage for now (you can implement backend storage later)
      localStorage.setItem('crm_currencies', JSON.stringify(currencies))
      
      setSuccessMsg('Currency settings saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setErrorMsg('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure currency options and other CRM settings
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-green-500">{successMsg}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{errorMsg}</p>
        </div>
      )}

      {/* Currency Settings */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Currency Management</h2>
          </div>
          <button
            onClick={() => setShowAddCurrency(!showAddCurrency)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Manage the currencies available in deal forms. The default currency will be pre-selected when creating new deals.
        </p>

        {/* Add Currency Form */}
        {showAddCurrency && (
          <div className="bg-background border border-border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-foreground">Add New Currency</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Currency Code *
                </label>
                <input
                  type="text"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                  placeholder="e.g., CAD"
                  maxLength={3}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  value={newCurrency.symbol}
                  onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  placeholder="e.g., C$"
                  maxLength={5}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Currency Name *
                </label>
                <input
                  type="text"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  placeholder="e.g., Canadian Dollar"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Exchange Rate *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newCurrency.exchangeRate}
                  onChange={(e) => setNewCurrency({ ...newCurrency, exchangeRate: e.target.value })}
                  placeholder="1.0"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">vs default currency</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddCurrency}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Add Currency
              </button>
              <button
                onClick={() => {
                  setShowAddCurrency(false)
                  setNewCurrency({ code: '', symbol: '', name: '', exchangeRate: '1.0' })
                  setErrorMsg('')
                }}
                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Currency List */}
        <div className="space-y-3">
          {currencies.map((currency) => (
            <div
              key={currency.code}
              className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{currency.symbol}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{currency.code}</p>
                    {currency.isDefault && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-bold uppercase rounded">
                        Default (Base Currency)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currency.name}</p>
                  
                  {/* Exchange Rate */}
                  <div className="flex items-center gap-2 mt-2">
                    {editingRate === currency.code ? (
                      <>
                        <input
                          type="number"
                          step="0.01"
                          value={tempRate}
                          onChange={(e) => setTempRate(e.target.value)}
                          className="w-32 px-2 py-1 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRate(currency.code)}
                          className="p-1 hover:bg-green-500/10 rounded transition-all"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={handleCancelEditRate}
                          className="p-1 hover:bg-red-500/10 rounded transition-all"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">
                          Rate: <span className="font-semibold text-foreground">{currency.exchangeRate || 1.0}</span>
                        </span>
                        {!currency.isDefault && (
                          <button
                            onClick={() => handleStartEditRate(currency.code, currency.exchangeRate || 1.0)}
                            className="p-1 hover:bg-primary/10 rounded transition-all"
                          >
                            <Edit className="w-3 h-3 text-primary" />
                          </button>
                        )}
                        {currency.isDefault && (
                          <span className="text-xs text-muted-foreground italic">(base = 1.0)</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!currency.isDefault && (
                  <button
                    onClick={() => handleSetDefault(currency.code)}
                    className="text-sm text-primary hover:underline font-semibold"
                  >
                    Set as Default
                  </button>
                )}
                {!currency.isDefault && (
                  <button
                    onClick={() => handleRemoveCurrency(currency.code)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
      
      </div>

      {/* Additional Settings (Future) */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Additional Settings</h2>
        <p className="text-sm text-muted-foreground">
          More CRM settings coming soon: lead stages, deal pipeline stages, custom fields, and more.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-4 border-t border-border justify-end sticky bottom-0 bg-background pb-4">
        <Link
          href="/admin/crm"
          className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2.5 rounded-lg font-semibold text-sm"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
