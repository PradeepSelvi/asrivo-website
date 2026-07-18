import React from 'react'
import { getDeals, getDealsByStage } from '@/lib/supabase/crm-actions'
import { Briefcase, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CRMDealsPage() {
  const [dealsResult, stagesResult] = await Promise.all([
    getDeals({ is_active: true }),
    getDealsByStage(),
  ])

  const deals = dealsResult.data || []
  const stages = stagesResult.data || {}

  const totalValue = deals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0)
  const weightedValue = deals.reduce((sum, deal) => {
    return sum + (deal.deal_value || 0) * ((deal.probability || 0) / 100)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deal Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your sales opportunities
            </p>
          </div>
        </div>
        <Link
          href="/admin/crm/deals/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          + Add Deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Active Deals</p>
          <p className="text-2xl font-bold text-foreground">{deals.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Total Value</p>
          <p className="text-2xl font-bold text-green-500">${Math.round(totalValue).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Weighted Value</p>
          <p className="text-2xl font-bold text-purple-500">${Math.round(weightedValue).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Avg Deal Size</p>
          <p className="text-2xl font-bold text-blue-500">
            ${deals.length > 0 ? Math.round(totalValue / deals.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stages).map(([stage, data]: [string, any]) => (
          <div key={stage} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 capitalize">
              {stage.replace('-', ' ')}
            </p>
            <p className="text-xl font-bold text-foreground">{data.count}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${Math.round(data.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Deals Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Deal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Expected Close
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deals.length > 0 ? (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/admin/crm/deals/${deal.id}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {deal.deal_name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">{deal.contact_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{deal.company_name || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        deal.stage === 'qualification' ? 'bg-blue-500/10 text-blue-500' :
                        deal.stage === 'proposal' ? 'bg-purple-500/10 text-purple-500' :
                        deal.stage === 'negotiation' ? 'bg-orange-500/10 text-orange-500' :
                        deal.stage === 'closed-won' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-foreground">
                          ${(deal.deal_value || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {deal.probability || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {deal.expected_close_date ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(deal.expected_close_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">No active deals</p>
                    <Link
                      href="/admin/crm/deals/new"
                      className="text-sm text-primary hover:underline font-semibold"
                    >
                      Create your first deal
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deals.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{deals.length}</span> active deals
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Kanban board view coming soon for drag-and-drop pipeline management
          </p>
        </div>
      )}
    </div>
  )
}
