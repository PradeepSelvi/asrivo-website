'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  Building2,
  Mail,
  Loader2,
  AlertCircle,
} from 'lucide-react'

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

export default function PartnershipStatusPage() {
  const [email, setEmail] = useState('')
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (partnerships.length === 0) return

    // Set up real-time subscription for status updates
    const channel = supabase
      .channel('partnership-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partnerships',
          filter: `email=eq.${email}`,
        },
        (payload) => {
          console.log('Partnership status updated:', payload)
          // Update the partnership in the list
          setPartnerships((prev) =>
            prev.map((p) =>
              p.id === (payload.new as Partnership).id
                ? (payload.new as Partnership)
                : p
            )
          )

          // Show browser notification if status changed
          if (Notification.permission === 'granted') {
            const newPartnership = payload.new as Partnership
            new Notification('Partnership Status Updated', {
              body: `Your partnership request status is now: ${newPartnership.status}`,
              icon: '/asrivo.png',
            })
          }
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
  }, [partnerships, email])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/partnerships/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setPartnerships(result.data)
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-5 h-5" />
      case 'reviewing':
        return <Eye className="w-5 h-5" />
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'new':
        return 'Your partnership request has been received and is awaiting review.'
      case 'reviewing':
        return 'Our team is currently reviewing your partnership proposal.'
      case 'accepted':
        return 'Congratulations! Your partnership request has been accepted. Our team will contact you soon.'
      case 'rejected':
        return 'Thank you for your interest. Unfortunately, we cannot proceed with this partnership at this time.'
      default:
        return 'Status unknown'
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="mx-auto max-w-4xl px-4 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Track Your Partnership Status
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Enter your email address to check the status of your partnership application
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 text-base bg-white"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-cyan-600 hover:bg-cyan-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 lg:py-28 flex-1">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {searched && !loading && (
            <>
              {partnerships.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Partnership Requests Found
                  </h3>
                  <p className="text-muted-foreground">
                    We couldn't find any partnership requests associated with this email address.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Partnership Requests
                    </h2>
                    <Badge variant="outline" className="text-sm">
                      {partnerships.length} {partnerships.length === 1 ? 'Request' : 'Requests'}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {partnerships.map((partnership) => (
                      <div
                        key={partnership.id}
                        className="bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-foreground">
                                {partnership.company_name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {partnership.industry} • {partnership.partnership_type.replace('-', ' ')}
                              </p>
                            </div>
                          </div>

                          <Badge
                            className={`${getStatusColor(partnership.status)} border px-4 py-2 text-sm font-semibold capitalize flex items-center gap-2`}
                          >
                            {getStatusIcon(partnership.status)}
                            {partnership.status}
                          </Badge>
                        </div>

                        {/* Status Message */}
                        <div className="bg-muted/30 rounded-xl p-6 mb-6">
                          <p className="text-sm leading-relaxed text-foreground">
                            {getStatusMessage(partnership.status)}
                          </p>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Submitted:</span>
                            <span className="font-medium text-foreground">
                              {new Date(partnership.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span className="font-medium text-foreground">
                              {new Date(partnership.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Real-time indicator */}
                        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Real-time updates enabled</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Request ID: #{partnership.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!searched && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Enter Your Email to Get Started
              </h3>
              <p className="text-muted-foreground">
                Use the search box above to track your partnership request status
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
