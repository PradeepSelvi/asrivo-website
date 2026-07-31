import React from 'react'
import { getDeals } from '@/lib/supabase/crm-actions'
import { Building2, Eye } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function CRMDealsPage() {
  const { data: deals } = await getDeals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track sales opportunities</p>
        </div>
        <Link href="/admin/crm/deals/new" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">
          + New Deal
        </Link>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden p-6">
        {deals && deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors">
                <Link href={`/admin/crm/deals/${deal.id}`} className="flex-1">
                  <div className="font-semibold text-foreground">{deal.deal_name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {deal.company_name && <span>{deal.company_name} • </span>}
                    {deal.currency} {deal.deal_value?.toLocaleString()} • {deal.stage}
                  </div>
                </Link>
                <Link 
                  href={`/admin/crm/deals/${deal.id}`}
                  className="ml-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground">No deals found</p>
          </div>
        )}
      </div>
    </div>
  )
}
