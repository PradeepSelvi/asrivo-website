'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Handshake,
  Eye,
  Filter,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  AlertCircle,
  File,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Partnership {
  id: number
  company_name: string
  contact_person: string
  email: string
  phone: string
  website: string | null
  partnership_type: string
  company_size: string
  industry: string
  services_offered: string
  message: string
  status: 'new' | 'reviewing' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [newCount, setNewCount] = useState(0)

  const supabase = createClient()

  const fetchPartnerships = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/partnerships' 
        : `/api/partnerships?status=${statusFilter}`
      
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setPartnerships(result.data)
        const newItems = result.data.filter((p: Partnership) => p.status === 'new').length
        setNewCount(newItems)
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartnerships()

    // Set up real-time subscription
    const channel = supabase
      .channel('partnerships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnerships',
        },
        (payload) => {
          console.log('Partnership change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new partnership
            if (Notification.permission === 'granted') {
              new Notification('New Partnership Request', {
                body: `${(payload.new as Partnership).company_name} submitted a partnership request`,
                icon: '/asrivo.png',
              })
            }
          }
          
          // Refresh the list
          fetchPartnerships()
        }
      )
      .subscribe()

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [statusFilter])

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      console.log('Updating partnership status:', { id, newStatus })
      console.log('Making PATCH request to:', `/api/partnerships/${id}`)
      
      const response = await fetch(`/api/partnerships/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response body:', result)

      if (response.ok) {
        console.log('Status updated successfully, refreshing list...')
        await fetchPartnerships()
      } else {
        const errorMsg = result.error || 'Unknown error'
        const details = result.details || ''
        console.error('Failed to update status:', { errorMsg, details, fullResult: result })
        alert(`Failed to update status: ${errorMsg}${details ? ' - ' + details : ''}`)
      }
    } catch (error) {
      console.error('Exception during update:', error)
      if (error instanceof Error) {
        alert(`Failed to update status: ${error.message}`)
      } else {
        alert('Failed to update status. Please check console for details.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'reviewing':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'accepted':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const stats = [
    {
      label: 'Total Requests',
      value: partnerships.length,
      icon: Handshake,
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'New',
      value: partnerships.filter((p) => p.status === 'new').length,
      icon: AlertCircle,
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: 'Under Review',
      value: partnerships.filter((p) => p.status === 'reviewing').length,
      icon: Eye,
      color: 'text-yellow-600 bg-yellow-500/10',
    },
    {
      label: 'Accepted',
      value: partnerships.filter((p) => p.status === 'accepted').length,
      icon: Handshake,
      color: 'text-green-600 bg-green-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Partnership Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage and review partnership applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-extrabold text-foreground mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewing">Under Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {newCount} New
            </Badge>
          )}
        </div>

        <Button onClick={() => fetchPartnerships()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Partnerships Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-4">Loading partnerships...</p>
          </div>
        ) : partnerships.length === 0 ? (
          <div className="p-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground mt-4">No partnership requests found</p>
          </div>
        ) : (
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-muted/50 border-b border-border grid-cols-[2fr_2fr_1.5fr_140px_120px_100px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Company</span>
              <span>Contact</span>
              <span>Type</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {/* Partnerships List */}
            <div>
              {partnerships.map((partnership) => (
                <div key={partnership.id}>
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-[2fr_2fr_1.5fr_140px_120px_100px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm">{partnership.company_name}</p>
                        <p className="text-xs text-muted-foreground">{partnership.industry}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{partnership.contact_person}</p>
                      <p className="text-xs text-muted-foreground">{partnership.email}</p>
                    </div>
                    <span className="text-sm text-foreground capitalize">
                      {partnership.partnership_type.replace('-', ' ')}
                    </span>
                    <Select
                      value={partnership.status}
                      onValueChange={(value) => {
                        updateStatus(partnership.id, value)
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge
                            className={`${getStatusColor(partnership.status)} border`}
                            variant="outline"
                          >
                            {partnership.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {new Date(partnership.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPartnership(partnership)
                        setDetailsOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{partnership.company_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{partnership.industry}</p>
                        <p className="text-xs text-muted-foreground mt-1">{partnership.contact_person}</p>
                        <p className="text-xs text-muted-foreground">{partnership.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full capitalize">
                        {partnership.partnership_type.replace('-', ' ')}
                      </span>
                      <Badge className={`${getStatusColor(partnership.status)} border`} variant="outline">
                        {partnership.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(partnership.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPartnership(partnership)
                          setDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Partnership Details</DialogTitle>
            <DialogDescription>
              Complete information about the partnership request
            </DialogDescription>
          </DialogHeader>

          {selectedPartnership && (
            <div className="space-y-6 mt-4">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company Name</p>
                    <p className="font-semibold">{selectedPartnership.company_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Industry</p>
                    <p className="font-semibold">{selectedPartnership.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company Size</p>
                    <p className="font-semibold">{selectedPartnership.company_size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                    {selectedPartnership.website ? (
                      <a
                        href={selectedPartnership.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        {selectedPartnership.website}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                    <p className="font-semibold">{selectedPartnership.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${selectedPartnership.email}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {selectedPartnership.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <a
                      href={`tel:${selectedPartnership.phone}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedPartnership.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Partnership Type</p>
                    <p className="font-semibold capitalize">
                      {selectedPartnership.partnership_type.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Services Offered
                </h3>
                <p className="text-sm leading-relaxed">{selectedPartnership.services_offered}</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Partnership Proposal
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedPartnership.message}
                </p>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Submitted Documents
                </h3>
                <div className="grid gap-3">
                  {(selectedPartnership as any).agreement_document_url && (
                    <a
                      href={`/api/partnerships/download/${encodeURIComponent((selectedPartnership as any).agreement_document_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Partnership Agreement</p>
                        <p className="text-xs text-muted-foreground">Click to download</p>
                      </div>
                    </a>
                  )}
                  {(selectedPartnership as any).noc_document_url && (
                    <a
                      href={`/api/partnerships/download/${encodeURIComponent((selectedPartnership as any).noc_document_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">NOC Document</p>
                        <p className="text-xs text-muted-foreground">Click to download</p>
                      </div>
                    </a>
                  )}
                  {(selectedPartnership as any).proposal_document_url && (
                    <a
                      href={`/api/partnerships/download/${encodeURIComponent((selectedPartnership as any).proposal_document_url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Proposal Document</p>
                        <p className="text-xs text-muted-foreground">Click to download</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Terms Acceptance */}
              {(selectedPartnership as any).terms_accepted && (
                <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-600">Terms Accepted</p>
                    <p className="text-xs text-muted-foreground">
                      Accepted on {new Date((selectedPartnership as any).terms_accepted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-semibold">Update Status</p>
                  <p className="text-xs text-muted-foreground">Change the partnership status</p>
                </div>
                <Select
                  value={selectedPartnership.status}
                  onValueChange={(value) => {
                    updateStatus(selectedPartnership.id, value)
                    setDetailsOpen(false)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Submitted: {new Date(selectedPartnership.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated: {new Date(selectedPartnership.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
