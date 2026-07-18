'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Mail,
  Filter,
  RefreshCw,
  Calendar,
  Download,
  UserCheck,
  Users,
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

interface Subscriber {
  id: number
  email: string
  created_at: string
  status: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [exporting, setExporting] = useState(false)

  const supabase = createClient()

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const filtered = statusFilter === 'all' 
        ? data 
        : data?.filter(s => s.status === statusFilter)

      setSubscribers(filtered || [])
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()

    // Set up real-time subscription
    const channel = supabase
      .channel('subscribers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'newsletter_subscribers',
        },
        (payload) => {
          console.log('Subscriber change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new subscriber
            if (Notification.permission === 'granted') {
              new Notification('New Newsletter Subscriber', {
                body: `${(payload.new as Subscriber).email} subscribed`,
                icon: '/asrivo.png',
              })
            }
          }
          
          fetchSubscribers()
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

  const exportToCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/subscribers/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const stats = [
    {
      label: 'Total Subscribers',
      value: subscribers.length,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Active',
      value: subscribers.filter(s => s.status === 'active').length,
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      label: 'This Month',
      value: subscribers.filter(s => {
        const date = new Date(s.created_at)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your email newsletter subscribers
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={exporting || subscribers.length === 0}
          >
            <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-pulse' : ''}`} />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscribers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No subscribers found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === 'all' 
                ? 'Newsletter subscribers will appear here'
                : `No subscribers with status "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Subscribed Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{subscriber.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        className={
                          subscriber.status === 'active'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      >
                        {subscriber.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(subscriber.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
