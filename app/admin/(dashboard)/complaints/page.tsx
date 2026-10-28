'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Clock, Eye, User, FileText, RefreshCw, Filter } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusVariant, PriorityVariant } from '@/lib/utils/status-config'

interface Complaint {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  description: string
  category: string | null
  priority: string
  status: string
  proof_document_url: string | null
  created_at: string
  updated_at: string
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints?limit=200')
      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setComplaints(result.data)
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()

    const supabase = createClient()
    const channel = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
        },
        () => {
          fetchComplaints()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const previous = [...complaints]
    setUpdatingId(id)
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )

    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const result = await response.json()
        setComplaints(previous)
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      setComplaints(previous)
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusCounts = {
    new: complaints.filter((c) => c.status === 'new').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
    closed: complaints.filter((c) => c.status === 'closed').length,
  }

  const priorityCounts = {
    urgent: complaints.filter((c) => c.priority === 'urgent').length,
    high: complaints.filter((c) => c.priority === 'high').length,
    medium: complaints.filter((c) => c.priority === 'medium').length,
    low: complaints.filter((c) => c.priority === 'low').length,
  }

  const filteredComplaints =
    statusFilter === 'all'
      ? complaints
      : complaints.filter((c) => c.status === statusFilter)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Complaints Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage customer complaints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setLoading(true)
              fetchComplaints()
            }}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-red-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-destructive">{statusCounts.new}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            New
          </p>
        </div>
        <div className="bg-card border border-amber-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{statusCounts.in_progress}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            In Progress
          </p>
        </div>
        <div className="bg-card border border-emerald-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.resolved}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            Resolved
          </p>
        </div>
        <div className="bg-card border border-slate-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-400">{statusCounts.closed}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            Closed
          </p>
        </div>
      </div>

      {/* Priority Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-red-500">{priorityCounts.urgent}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Urgent
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-orange-500">{priorityCounts.high}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            High
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-yellow-500">{priorityCounts.medium}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Medium
          </p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-blue-500">{priorityCounts.low}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            Low
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses ({complaints.length})</SelectItem>
            <SelectItem value="new">New ({statusCounts.new})</SelectItem>
            <SelectItem value="in_progress">In Progress ({statusCounts.in_progress})</SelectItem>
            <SelectItem value="resolved">Resolved ({statusCounts.resolved})</SelectItem>
            <SelectItem value="closed">Closed ({statusCounts.closed})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-slate-700" />
            <p className="font-semibold">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">
              {statusFilter === 'all'
                ? 'No complaints yet.'
                : `No complaints with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[2fr_2fr_100px_80px_90px_130px_110px_80px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id}>
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-[2fr_2fr_100px_80px_90px_130px_110px_80px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{complaint.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{complaint.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{complaint.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {complaint.description}
                      </p>
                    </div>
                    <div>
                      {complaint.category ? (
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full">
                          {complaint.category}
                        </span>
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
                      <PriorityBadge
                        priority={complaint.priority as PriorityVariant}
                        size="sm"
                      />
                    </div>
                    <div>
                      <Select
                        value={complaint.status}
                        onValueChange={(val) => updateStatus(complaint.id, val)}
                        disabled={updatingId === complaint.id}
                      >
                        <SelectTrigger className="w-[125px] h-8 text-xs">
                          <SelectValue>
                            <StatusBadge
                              status={complaint.status as StatusVariant}
                              size="sm"
                            />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {complaint.category && (
                        <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full">
                          {complaint.category}
                        </span>
                      )}
                      <PriorityBadge
                        priority={complaint.priority as PriorityVariant}
                        size="sm"
                      />
                      <Select
                        value={complaint.status}
                        onValueChange={(val) => updateStatus(complaint.id, val)}
                        disabled={updatingId === complaint.id}
                      >
                        <SelectTrigger className="w-[125px] h-8 text-xs">
                          <SelectValue>
                            <StatusBadge
                              status={complaint.status as StatusVariant}
                              size="sm"
                            />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
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
