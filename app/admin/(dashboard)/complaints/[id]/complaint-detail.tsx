"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Tag, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Download
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

export default function ComplaintDetailClient({ 
  complaint, 
  isHigh 
}: { 
  complaint: Complaint
  isHigh: boolean 
}) {
  const router = useRouter()
  const [status, setStatus] = useState(complaint.status)
  const [priority, setPriority] = useState(complaint.priority)
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
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

  const handlePriorityUpdate = async (newPriority: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      })

      if (response.ok) {
        setPriority(newPriority)
        router.refresh()
      } else {
        alert('Failed to update priority')
      }
    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Failed to update priority')
    } finally {
      setUpdating(false)
    }
  }

  const getProofDocumentUrl = () => {
    if (!complaint.proof_document_url) return null
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proof%20of%20complain/${complaint.proof_document_url}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-blue-500 bg-blue-500/20 border-blue-500/30'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'in_progress': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      case 'resolved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'closed': return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'closed': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/admin/complaints">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Complaints
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Complaint Details</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Info Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">{complaint.subject}</h2>
              <div className="flex gap-2">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  {status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.category && (
              <div className="mt-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium bg-muted px-2 py-1 rounded">{complaint.category}</span>
              </div>
            )}
          </div>

          {/* Proof Document */}
          {complaint.proof_document_url && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proof Document
              </h3>
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Supporting Evidence</p>
                    <p className="text-xs text-muted-foreground">Click to view or download</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={getProofDocumentUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    View
                  </a>
                </Button>
              </div>
            </div>
          )}
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
                  <p className="text-sm font-medium text-foreground">{complaint.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <a href={`mailto:${complaint.email}`} className="text-sm font-medium text-primary hover:underline">
                    {complaint.email}
                  </a>
                </div>
              </div>
              {complaint.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                    <a href={`tel:${complaint.phone}`} className="text-sm font-medium text-primary hover:underline">
                      {complaint.phone}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(complaint.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(complaint.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management Card (Only for high-level admins) */}
          {isHigh && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-4">Manage Complaint</h3>
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
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    Priority
                  </label>
                  <Select
                    value={priority}
                    onValueChange={handlePriorityUpdate}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
