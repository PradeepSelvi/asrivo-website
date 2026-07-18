"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, User, Building, MessageSquare, Clock, Eye, FileText } from 'lucide-react'
import Link from 'next/link'

interface Contact {
  id: number
  name: string
  email: string
  company: string | null
  phone: string | null
  subject: string
  message: string
  type: string | null
  status: string
  created_at: string
  updated_at: string
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const fetchContacts = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setContacts(data || [])
      } catch (err: any) {
        console.error('Error fetching contacts:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()

    // Subscribe to realtime changes
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
          console.log('Realtime change detected:', payload)

          if (payload.eventType === 'INSERT') {
            setContacts((prev) => [payload.new as Contact, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setContacts((prev) =>
              prev.map((contact) =>
                contact.id === (payload.new as Contact).id
                  ? (payload.new as Contact)
                  : contact
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setContacts((prev) =>
              prev.filter((contact) => contact.id !== (payload.old as Contact).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const statusCounts = {
    unread: contacts.filter((c) => c.status === 'unread').length,
    read: contacts.filter((c) => c.status === 'read').length,
    responded: contacts.filter((c) => c.status === 'responded').length,
  }

  const typeCounts = {
    feedback: contacts.filter((c) => c.type === 'feedback').length,
    query: contacts.filter((c) => c.type === 'query').length,
    contact: contacts.filter((c) => c.type === 'contact').length,
    other: contacts.filter((c) => c.type === 'other').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage contact form submissions with realtime updates.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-blue-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">{statusCounts.unread}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Unread</p>
        </div>
        <div className="bg-card border border-amber-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{statusCounts.read}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Read</p>
        </div>
        <div className="bg-card border border-emerald-900/30 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.responded}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Responded</p>
        </div>
      </div>

      {/* Type Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-purple-500">{typeCounts.feedback}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Feedback</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-blue-500">{typeCounts.query}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Query</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-500">{typeCounts.contact}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Contact</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-500">{typeCounts.other}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Other</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {error && (
          <div className="p-6 text-destructive text-sm">Error: {error}</div>
        )}
        {!error && contacts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">No contact messages yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/60 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                          {contact.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3" />
                              {contact.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{contact.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{contact.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      {contact.type ? (
                        <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{contact.type}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                          contact.status === 'unread'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : contact.status === 'read'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/contacts/${contact.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Realtime Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span>Realtime updates enabled</span>
      </div>
    </div>
  )
}
