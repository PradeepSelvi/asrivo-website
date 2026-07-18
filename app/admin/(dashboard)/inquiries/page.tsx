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
      const { data, error } = await supabase
        .from('client_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

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

  const getStatusConfig = (status: string) => {
    const configs = {
      new: { label: 'New', variant: 'default' as const, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      contacted: { label: 'Contacted', variant: 'secondary' as const, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      qualified: { label: 'Qualified', variant: 'secondary' as const, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      converted: { label: 'Converted', variant: 'secondary' as const, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
      rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    }
    return configs[status as keyof typeof configs] || configs.new
  }

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
      <div className="rounded-xl border bg-card shadow-sm">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inquiry) => {
                  const statusConfig = getStatusConfig(inquiry.status)
                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{inquiry.company || 'Individual'}</p>
                            <p className="text-sm text-muted-foreground">{inquiry.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{inquiry.email}</span>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{inquiry.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {inquiry.project_types.slice(0, 2).map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {inquiry.project_types.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{inquiry.project_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{inquiry.budget_range}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/inquiries/${inquiry.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
