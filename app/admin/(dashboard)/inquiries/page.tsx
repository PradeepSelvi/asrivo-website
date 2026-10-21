'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Eye,
  Filter,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Briefcase,
  DollarSign,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import type { StatusVariant } from '@/lib/utils/status-config'


interface ClientInquiry {
  id: number
  name: string
  company: string | null
  email: string
  phone: string
  preferred_contact: string
  project_types: string[]
  project_description: string
  has_existing: boolean
  existing_link: string | null
  target_platform: string[]
  key_features: string[]
  budget_range: string
  timeline: string
  target_audience: string | null
  pain_points: string | null
  reference_links: string | null
  hear_about_us: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'
  created_at: string
  updated_at: string
}

export default function ServiceInquiriesPage() {
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newCount, setNewCount] = useState(0)

  const supabase = createClient()

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      // Fetch via API route using service role to bypass RLS restrictions
      const response = await fetch('/api/inquiries')
      const result = await response.json()
      let data: ClientInquiry[] = result.success ? result.data : null

      // Fallback to direct supabase client if needed
      if (!data) {
        const { data: directData, error } = await supabase
          .from('client_inquiries')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        data = directData
      }

      const filtered = statusFilter === 'all' 
        ? data 
        : data?.filter(i => i.status === statusFilter)

      setInquiries(filtered || [])
      const newItems = data?.filter((i: ClientInquiry) => i.status === 'new').length || 0
      setNewCount(newItems)
    } catch (error) {
      console.error('Error fetching inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()

    // Set up real-time subscription
    const channel = supabase
      .channel('inquiries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_inquiries',
        },
        (payload) => {
          console.log('Inquiry change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new inquiry
            if (Notification.permission === 'granted') {
              new Notification('New Service Inquiry', {
                body: `${(payload.new as ClientInquiry).name} submitted an inquiry`,
                icon: '/asrivo.png',
              })
            }
          }
          
          // Refresh the list
          fetchInquiries()
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

  const stats = [
    {
      label: 'Total Requests',
      value: inquiries.length,
      icon: Briefcase,
      color: 'text-blue-500',
    },
    {
      label: 'New',
      value: inquiries.filter(i => i.status === 'new').length,
      icon: AlertCircle,
      color: 'text-blue-600',
    },
    {
      label: 'Contacted',
      value: inquiries.filter(i => i.status === 'contacted').length,
      icon: Phone,
      color: 'text-yellow-600',
    },
    {
      label: 'Qualified',
      value: inquiries.filter(i => i.status === 'qualified').length,
      icon: Eye,
      color: 'text-purple-600',
    },
    {
      label: 'Converted',
      value: inquiries.filter(i => i.status === 'converted').length,
      icon: Clock,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review service inquiry submissions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {newCount > 0 && (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            {newCount} New
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInquiries}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No inquiries found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === 'all' 
                ? 'Service inquiries will appear here when submitted'
                : `No inquiries with status "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[minmax(180px,1.8fr)_minmax(200px,2fr)_minmax(180px,1.5fr)_minmax(110px,0.8fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(100px,0.7fr)] gap-4 px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Company</span>
              <span>Contact</span>
              <span>Type</span>
              <span>Budget</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {/* Inquiries List */}
            <div>
              {inquiries.map((inquiry) => {
                return (
                  <div key={inquiry.id}>
                    {/* Desktop View */}
                    <div className="hidden lg:grid grid-cols-[minmax(180px,1.8fr)_minmax(200px,2fr)_minmax(180px,1.5fr)_minmax(110px,0.8fr)_minmax(100px,0.7fr)_minmax(110px,0.8fr)_minmax(100px,0.7fr)] gap-4 items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate" title={inquiry.company || 'Individual'}>
                            {inquiry.company || 'Individual'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={inquiry.name}>
                            {inquiry.name}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm min-w-0">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={inquiry.email}>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate" title={inquiry.phone}>{inquiry.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {inquiry.project_types.slice(0, 2).map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs whitespace-nowrap">
                            {type}
                          </Badge>
                        ))}
                        {inquiry.project_types.length > 2 && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            +{inquiry.project_types.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium truncate" title={inquiry.budget_range}>
                          {inquiry.budget_range}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <StatusBadge status={inquiry.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/inquiries/${inquiry.id}`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{inquiry.company || 'Individual'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{inquiry.name}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {inquiry.project_types.slice(0, 3).map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {inquiry.project_types.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{inquiry.project_types.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          {inquiry.budget_range}
                        </div>
                        <StatusBadge status={inquiry.status} size="sm" />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Link href={`/admin/inquiries/${inquiry.id}`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
