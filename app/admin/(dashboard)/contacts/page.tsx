'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Mail,
  Eye,
  Filter,
  RefreshCw,
  Building2,
  Phone,
  Calendar,
  MessageSquare,
  User,
  CheckCircle2,
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

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'responded'
  created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const filtered = statusFilter === 'all' 
        ? data 
        : data?.filter(c => c.status === statusFilter)

      setContacts(filtered || [])
      const unread = data?.filter((c: Contact) => c.status === 'unread').length || 0
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()

    // Set up real-time subscription
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log('Contact change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new contact
            if (Notification.permission === 'granted') {
              new Notification('New Contact Message', {
                body: `${(payload.new as Contact).name} sent a message`,
                icon: '/asrivo.png',
              })
            }
          }
          
          fetchContacts()
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
      unread: { label: 'Unread', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
      read: { label: 'Read', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      responded: { label: 'Responded', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    }
    return configs[status as keyof typeof configs] || configs.unread
  }

  const stats = [
    {
      label: 'Total Messages',
      value: contacts.length,
      icon: MessageSquare,
      color: 'text-blue-500',
    },
    {
      label: 'Unread',
      value: contacts.filter(c => c.status === 'unread').length,
      icon: Mail,
      color: 'text-red-600',
    },
    {
      label: 'Read',
      value: contacts.filter(c => c.status === 'read').length,
      icon: Eye,
      color: 'text-yellow-600',
    },
    {
      label: 'Responded',
      value: contacts.filter(c => c.status === 'responded').length,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to contact form submissions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
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
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {unreadCount > 0 && (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            {unreadCount} Unread
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={fetchContacts}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No contact messages found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === 'all' 
                ? 'Contact messages will appear here when submitted'
                : `No messages with status "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Message
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
                {contacts.map((contact) => {
                  const statusConfig = getStatusConfig(contact.status)
                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {contact.status === 'unread' && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                              <p className="font-medium">{contact.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.company ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{contact.company}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        {contact.subject && (
                          <p className="font-medium text-sm mb-1">{contact.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {contact.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(contact.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/contacts/${contact.id}`}>
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
