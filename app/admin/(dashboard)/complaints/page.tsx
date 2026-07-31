import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AlertCircle, Clock, Eye, User, FileText } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function AdminComplaintsPage() {
  const supabase = await createClient()

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })

  const statusCounts = {
    new: complaints?.filter(c => c.status === 'new').length || 0,
    in_progress: complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaints?.filter(c => c.status === 'resolved').length || 0,
    closed: complaints?.filter(c => c.status === 'closed').length || 0,
  }

  const priorityCounts = {
    urgent: complaints?.filter(c => c.priority === 'urgent').length || 0,
    high: complaints?.filter(c => c.priority === 'high').length || 0,
    medium: complaints?.filter(c => c.priority === 'medium').length || 0,
    low: complaints?.filter(c => c.priority === 'low').length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Complaints Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage customer complaints.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-red-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-destructive">{statusCounts.new}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">New</p>
        </div>
        <div className="bg-card border border-amber-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{statusCounts.in_progress}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">In Progress</p>
        </div>
        <div className="bg-card border border-emerald-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.resolved}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Resolved</p>
        </div>
        <div className="bg-card border border-slate-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-400">{statusCounts.closed}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Closed</p>
        </div>
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-500">{priorityCounts.urgent}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Urgent</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-orange-500">{priorityCounts.high}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">High</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-yellow-500">{priorityCounts.medium}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Medium</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-blue-500">{priorityCounts.low}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Low</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-destructive text-sm">Error: {error.message}</div>}
        {!error && (!complaints || complaints.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">No complaints yet.</p>
          </div>
        ) : (
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[2fr_2fr_100px_80px_90px_90px_120px_80px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>User</span>
              <span>Subject</span>
              <span>Category</span>
              <span>Proof</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {/* Complaints List */}
            <div>
              {complaints?.map((complaint) => (
                <div key={complaint.id}>
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-[2fr_2fr_100px_80px_90px_90px_120px_80px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{complaint.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{complaint.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{complaint.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{complaint.description}</p>
                    </div>
                    <div>
                      {complaint.category ? (
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full">{complaint.category}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                    <div>
                      {complaint.proof_document_url ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proof%20of%20complain/${complaint.proof_document_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                        complaint.priority === 'urgent' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        complaint.priority === 'high' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                        complaint.status === 'new' ? 'bg-red-500/10 text-destructive border border-red-500/20' :
                        complaint.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        complaint.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/admin/complaints/${complaint.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{complaint.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{complaint.email}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-foreground text-sm">{complaint.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{complaint.description}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {complaint.category && (
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full">{complaint.category}</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        complaint.priority === 'urgent' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        complaint.priority === 'high' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      }`}>
                        {complaint.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        complaint.status === 'new' ? 'bg-red-500/10 text-destructive border border-red-500/20' :
                        complaint.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        complaint.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      {complaint.proof_document_url && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proof%20of%20complain/${complaint.proof_document_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Proof
                        </a>
                      )}
                      <Link
                        href={`/admin/complaints/${complaint.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
