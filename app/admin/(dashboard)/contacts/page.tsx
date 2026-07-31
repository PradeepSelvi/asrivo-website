"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, User, Building, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


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
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[2fr_2fr_100px_90px_120px_80px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Contact</span>
              <span>Subject</span>
              <span>Type</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>

            {/* Contacts List */}
            <div>
              {contacts.map((contact) => (
                <div key={contact.id}>
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-[2fr_2fr_100px_90px_120px_80px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
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
                    <div>
                      <p className="font-medium text-foreground text-sm">{contact.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{contact.message}</p>
                    </div>
                    <div>
                      {contact.type ? (
                        <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full capitalize w-fit">
                          {contact.type}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
                          contact.status === 'unread'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : contact.status === 'read'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <Link
                        href={`/admin/contacts/${contact.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-semibold text-foreground text-sm">{contact.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5">{contact.phone}</p>
                        )}
                        {contact.company && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" />
                            {contact.company}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-foreground text-sm">{contact.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.message}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {contact.type && (
                        <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full capitalize">
                          {contact.type}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          contact.status === 'unread'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : contact.status === 'read'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {contact.status}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/admin/contacts/${contact.id}`}
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

      {/* Realtime Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span>Realtime updates enabled</span>
      </div>
    </div>
  )
}
