"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building,
  Calendar, 
  FileText,
  MessageSquare,
  Tag
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export default function ContactDetailClient({ contact }: { contact: Contact }) {
  const router = useRouter()
  const [status, setStatus] = useState(contact.status)
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setStatus(newStatus)
        router.refresh()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'read': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'responded': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/contacts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contacts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Contact Message Details</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{contact.subject}</h2>
              <div className="flex gap-2">
                {contact.type && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border capitalize">
                    {contact.type}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-foreground">{contact.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-sm font-medium text-primary hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-sm font-medium text-primary hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {contact.company && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Company</p>
                    <p className="text-sm font-medium text-foreground">{contact.company}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Received</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(contact.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-4">Update Status</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={handleStatusUpdate}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
