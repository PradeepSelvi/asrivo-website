'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileUser,
  Eye,
  Filter,
  RefreshCw,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  GraduationCap,
  CheckCircle2,
  X,
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

interface JobApplication {
  id: number
  full_name: string
  email: string
  phone: string | null
  position_id: number | null
  job_title: string | null
  experience_years: number
  resume_url: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  cover_letter: string | null
  status: 'new' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected'
  created_at: string
}

interface JobPosting {
  id: number
  title: string
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [jobTitleMap, setJobTitleMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newCount, setNewCount] = useState(0)

  const supabase = createClient()

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data: appsData, error: appsError } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('id, title')

      const titleMap: Record<string, string> = {}
      jobsData?.forEach((job: JobPosting) => {
        titleMap[String(job.id)] = job.title
      })
      setJobTitleMap(titleMap)

      const filtered = statusFilter === 'all' 
        ? appsData 
        : appsData?.filter(a => a.status === statusFilter)

      setApplications(filtered || [])
      const newItems = appsData?.filter((a: JobApplication) => a.status === 'new').length || 0
      setNewCount(newItems)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()

    // Set up real-time subscription
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
        },
        (payload) => {
          console.log('Application change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new application
            if (Notification.permission === 'granted') {
              new Notification('New Job Application', {
                body: `${(payload.new as JobApplication).full_name} applied`,
                icon: '/asrivo.png',
              })
            }
          }
          
          fetchApplications()
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
      new: { label: 'New', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: FileUser },
      reviewed: { label: 'Reviewed', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Eye },
      shortlisted: { label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: CheckCircle2 },
      interviewed: { label: 'Interviewed', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', icon: GraduationCap },
      hired: { label: 'Hired', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
      rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: X },
    }
    return configs[status as keyof typeof configs] || configs.new
  }

  const stats = [
    {
      label: 'Total Applications',
      value: applications.length,
      icon: FileUser,
      color: 'text-blue-500',
    },
    {
      label: 'New',
      value: applications.filter(a => a.status === 'new').length,
      icon: FileUser,
      color: 'text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: applications.filter(a => a.status === 'shortlisted').length,
      icon: CheckCircle2,
      color: 'text-purple-600',
    },
    {
      label: 'Interviewed',
      value: applications.filter(a => a.status === 'interviewed').length,
      icon: GraduationCap,
      color: 'text-indigo-600',
    },
    {
      label: 'Hired',
      value: applications.filter(a => a.status === 'hired').length,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review candidate applications
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
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
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
          onClick={fetchApplications}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileUser className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter === 'all' 
                ? 'Job applications will appear here when submitted'
                : `No applications with status "${statusFilter}"`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => {
                  const statusConfig = getStatusConfig(app.status)
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileUser className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{app.full_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{app.email}</span>
                            </div>
                            {app.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{app.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {app.position_id && jobTitleMap[String(app.position_id)]
                              ? jobTitleMap[String(app.position_id)]
                              : app.job_title || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{app.experience_years} years</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {app.resume_url && (
                            <a
                              href={app.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Resume
                            </a>
                          )}
                          {app.linkedin_url && (
                            <a
                              href={app.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                              LinkedIn
                            </a>
                          )}
                          {app.portfolio_url && (
                            <a
                              href={app.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Portfolio
                            </a>
                          )}
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
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
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
