import React from 'react'
import { getLeads } from '@/lib/supabase/crm-actions'
import { User, Mail, Building, Phone, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function CRMLeadsPage() {
  const { data: leads } = await getLeads()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all your sales leads
          </p>
        </div>
        <Link
          href="/admin/crm/leads/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        >
          + Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center bg-card border border-border rounded-xl p-4">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        <button className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
          All Leads
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          New
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Contacted
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Qualified
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Hot Leads
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Link
                            href={`/admin/crm/leads/${lead.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {lead.first_name} {lead.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </p>
                          {lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.company_name ? (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{lead.company_name}</p>
                            {lead.job_title && (
                              <p className="text-xs text-muted-foreground">{lead.job_title}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        lead.lead_status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                        lead.lead_status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500' :
                        lead.lead_status === 'qualified' ? 'bg-green-500/10 text-green-500' :
                        lead.lead_status === 'converted' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {lead.lead_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        lead.priority === 'hot' ? 'bg-red-500/10 text-red-500' :
                        lead.priority === 'warm' ? 'bg-orange-500/10 text-orange-500' :
                        lead.priority === 'cold' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {lead.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{lead.lead_score || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground capitalize">
                        {lead.lead_source?.replace('-', ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <User className="w-12 h-12 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">No leads found</p>
                      <Link
                        href="/admin/crm/leads/new"
                        className="text-sm text-primary hover:underline font-semibold"
                      >
                        Add your first lead
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      {leads && leads.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{leads.length}</span> leads
          </p>
          <p className="text-xs text-muted-foreground">
            Tip: Click on a lead name to view full details and activity history
          </p>
        </div>
      )}
    </div>
  )
}
