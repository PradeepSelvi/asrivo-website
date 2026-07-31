'use client'

import { useState, useEffect } from 'react'
import { getLeads } from '@/lib/supabase/crm-actions'
import { User, Mail, Building, Phone, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


type LeadStatus = 'all' | 'new' | 'contacted' | 'qualified' | 'hot'

export default function CRMLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [filteredLeads, setFilteredLeads] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<LeadStatus>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      const { data } = await getLeads()
      setLeads(data || [])
      setFilteredLeads(data || [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const handleFilter = (filter: LeadStatus) => {
    setActiveFilter(filter)
    
    if (filter === 'all') {
      setFilteredLeads(leads)
    } else if (filter === 'hot') {
      setFilteredLeads(leads.filter(lead => lead.priority === 'hot'))
    } else {
      setFilteredLeads(leads.filter(lead => lead.lead_status === filter))
    }
  }

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
      <div className="flex gap-3 items-center bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <span className="text-sm font-medium text-muted-foreground flex-shrink-0">Filter by:</span>
        <button 
          onClick={() => handleFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            activeFilter === 'all'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          All Leads
        </button>
        <button 
          onClick={() => handleFilter('new')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            activeFilter === 'new'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          New
        </button>
        <button 
          onClick={() => handleFilter('contacted')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            activeFilter === 'contacted'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Contacted
        </button>
        <button 
          onClick={() => handleFilter('qualified')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            activeFilter === 'qualified'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Qualified
        </button>
        <button 
          onClick={() => handleFilter('hot')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            activeFilter === 'hot'
              ? 'bg-primary/10 text-primary'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          Hot Leads
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">Loading leads...</p>
          </div>
        ) : (
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-muted/30 border-b border-border grid-cols-[2fr_1.5fr_110px_90px_80px_120px_120px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Lead</span>
              <span>Company</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Score</span>
              <span>Source</span>
              <span>Created</span>
            </div>

            {filteredLeads && filteredLeads.length > 0 ? (
              <div>
                {filteredLeads.map((lead) => (
                  <div key={lead.id}>
                    {/* Desktop View */}
                    <div className="hidden lg:grid grid-cols-[2fr_1.5fr_110px_90px_80px_120px_120px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/crm/leads/${lead.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                          >
                            {lead.first_name} {lead.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{lead.email}</span>
                          </p>
                          {lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {lead.company_name ? (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{lead.company_name}</p>
                              {lead.job_title && (
                                <p className="text-xs text-muted-foreground truncate">{lead.job_title}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                        lead.lead_status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                        lead.lead_status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500' :
                        lead.lead_status === 'qualified' ? 'bg-green-500/10 text-green-500' :
                        lead.lead_status === 'converted' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {lead.lead_status}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                        lead.priority === 'hot' ? 'bg-red-500/10 text-red-500' :
                        lead.priority === 'warm' ? 'bg-orange-500/10 text-orange-500' :
                        lead.priority === 'cold' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {lead.priority || 'medium'}
                      </span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{lead.lead_score || 0}</span>
                      </div>
                      <span className="text-sm text-muted-foreground capitalize">
                        {lead.lead_source?.replace('-', ' ') || '—'}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/admin/crm/leads/${lead.id}`}
                            className="font-semibold text-foreground text-sm block"
                          >
                            {lead.first_name} {lead.last_name}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            {lead.email}
                          </p>
                          {lead.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {lead.company_name && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{lead.company_name}</p>
                            {lead.job_title && (
                              <p className="text-xs text-muted-foreground">{lead.job_title}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lead.lead_status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                          lead.lead_status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500' :
                          lead.lead_status === 'qualified' ? 'bg-green-500/10 text-green-500' :
                          lead.lead_status === 'converted' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {lead.lead_status}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          lead.priority === 'hot' ? 'bg-red-500/10 text-red-500' :
                          lead.priority === 'warm' ? 'bg-orange-500/10 text-orange-500' :
                          lead.priority === 'cold' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {lead.priority || 'medium'}
                        </span>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-primary" />
                          <span className="font-bold text-primary">{lead.lead_score || 0}</span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {lead.lead_source?.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <User className="w-12 h-12 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    {activeFilter === 'all' ? 'No leads found' : `No ${activeFilter} leads found`}
                  </p>
                  {activeFilter === 'all' && (
                    <Link
                      href="/admin/crm/leads/new"
                      className="text-sm text-primary hover:underline font-semibold"
                    >
                      Add your first lead
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && filteredLeads && filteredLeads.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredLeads.length}</span> 
            {activeFilter !== 'all' ? ` ${activeFilter}` : ''} lead{filteredLeads.length !== 1 ? 's' : ''}
            {leads.length !== filteredLeads.length && (
              <span className="text-muted-foreground/70"> out of {leads.length} total</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Tip: Click on a lead name to view full details and activity history
          </p>
        </div>
      )}
    </div>
  )
}
