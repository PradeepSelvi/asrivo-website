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
  FileText,
  AlertCircle,
  Download,
  Linkedin,
  Globe,
  Clock,
  User,
  MessageSquare,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


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
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'resume'>('details')
  const [previewResume, setPreviewResume] = useState<{
    url: string
    name: string
    position?: string
  } | null>(null)

  const supabase = createClient()

  const getResumeUrl = (rawUrl: string | null): string => {
    if (!rawUrl) return ''
    const trimmed = rawUrl.trim()
    if (trimmed.startsWith('/api/admin/applications/resume/')) {
      return trimmed
    }
    if (trimmed.startsWith('resumes/')) {
      return `/api/admin/applications/resume/${trimmed}`
    }
    if (trimmed.startsWith('/resumes/')) {
      return `/api/admin/applications/resume/${trimmed.substring(1)}`
    }
    if (trimmed.includes('/resumes/')) {
      const path = trimmed.substring(trimmed.indexOf('resumes/'))
      return `/api/admin/applications/resume/${path}`
    }
    if (trimmed.endsWith('.pdf') && !trimmed.startsWith('http')) {
      return `/api/admin/applications/resume/${trimmed}`
    }
    return trimmed
  }

  const handleViewResume = (app: JobApplication) => {
    const url = getResumeUrl(app.resume_url)
    if (!url) return
    const pos =
      (app.position_id && jobTitleMap[String(app.position_id)]) ||
      app.job_title ||
      'Applicant'
    setPreviewResume({
      url,
      name: app.full_name,
      position: pos,
    })
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/job-applications')
      const result = await response.json()
      let appsData: JobApplication[] = result.success ? result.data : null

      if (!appsData) {
        const { data: directData, error: appsError } = await supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false })

        if (appsError) throw appsError
        appsData = directData
      }

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

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const result = await response.json()
      if (result.success) {
        setApplications(prev =>
          prev.map(app => (app.id === id ? { ...app, status: newStatus as any } : app))
        )
      } else {
        alert(result.error?.message || result.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
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
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
          <>
            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[2fr_1.4fr_110px_130px_105px_95px_85px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Applicant</span>
              <span>Position</span>
              <span>Experience</span>
              <span>Documents</span>
              <span>Status</span>
              <span>Date</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Applications List */}
            <div>
              {applications.map((app) => {
                const statusConfig = getStatusConfig(app.status)
                return (
                  <div key={app.id}>
                    {/* Desktop View */}
                    <div className="hidden lg:grid grid-cols-[2fr_1.4fr_110px_130px_105px_95px_85px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileUser className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{app.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {app.position_id && jobTitleMap[String(app.position_id)]
                            ? jobTitleMap[String(app.position_id)]
                            : app.job_title || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{app.experience_years} years</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {app.resume_url ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewResume(app)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline cursor-pointer group"
                              title="Click to view resume in PDF preview"
                            >
                              <FileText className="h-3.5 w-3.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span>View Resume</span>
                            </button>
                            <a
                              href={getResumeUrl(app.resume_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-emerald-600 p-0.5 rounded transition-colors"
                              title="Open resume in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No resume</span>
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
                      <div>
                        <Select
                          value={app.status}
                          onValueChange={(val) => handleStatusChange(app.id, val)}
                        >
                          <SelectTrigger className={`h-7 px-2 text-xs border rounded-md font-medium w-auto ${statusConfig.color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app)
                            setActiveTab('details')
                          }}
                          className="h-7 px-2.5 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          title="View all application information"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileUser className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{app.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {app.position_id && jobTitleMap[String(app.position_id)]
                            ? jobTitleMap[String(app.position_id)]
                            : app.job_title || '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                          {app.experience_years} years
                        </div>
                        <Select
                          value={app.status}
                          onValueChange={(val) => handleStatusChange(app.id, val)}
                        >
                          <SelectTrigger className={`h-6 px-2 text-xs border rounded-md font-medium w-auto ${statusConfig.color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {(app.resume_url || app.linkedin_url || app.portfolio_url) && (
                        <div className="flex flex-wrap gap-2">
                          {app.resume_url && (
                            <button
                              type="button"
                              onClick={() => handleViewResume(app)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              View Resume
                            </button>
                          )}
                          {app.linkedin_url && (
                            <a
                              href={app.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Portfolio
                            </a>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(app)
                            setActiveTab('details')
                          }}
                          className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View All Information</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Full Application Form Details Modal */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) setSelectedApplication(null)
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col bg-background">
          {selectedApplication && (
            <>
              {/* Header */}
              <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                      {selectedApplication.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <DialogTitle className="text-xl font-bold">
                          {selectedApplication.full_name}
                        </DialogTitle>
                        <Badge className={`text-xs ${getStatusConfig(selectedApplication.status).color}`}>
                          {getStatusConfig(selectedApplication.status).label}
                        </Badge>
                      </div>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {(selectedApplication.position_id && jobTitleMap[String(selectedApplication.position_id)]) ||
                            selectedApplication.job_title ||
                            'General Application'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied {new Date(selectedApplication.created_at).toLocaleDateString()}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>

                  {/* Quick Status Selector */}
                  <div className="flex items-center gap-2 pr-6">
                    <span className="text-xs text-muted-foreground font-medium">Status:</span>
                    <Select
                      value={selectedApplication.status}
                      onValueChange={(val) => {
                        handleStatusChange(selectedApplication.id, val)
                        setSelectedApplication((prev) => (prev ? { ...prev, status: val as any } : null))
                      }}
                    >
                      <SelectTrigger className={`h-8 px-2.5 text-xs border rounded-md font-medium w-auto ${getStatusConfig(selectedApplication.status).color}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogHeader>

              {/* Tabs for Details vs Resume PDF */}
              <div className="flex-1 overflow-hidden flex flex-col p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as 'details' | 'resume')}
                  className="w-full flex-1 flex flex-col min-h-0"
                >
                  <TabsList className="mb-4 w-full justify-start border-b rounded-none p-0 bg-transparent h-auto gap-4">
                    <TabsTrigger
                      value="details"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 font-semibold text-sm cursor-pointer"
                    >
                      <FileUser className="h-4 w-4 mr-2" />
                      Application Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="resume"
                      disabled={!selectedApplication.resume_url}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 font-semibold text-sm disabled:opacity-50 cursor-pointer"
                    >
                      <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                      Resume PDF {selectedApplication.resume_url ? '' : '(Not uploaded)'}
                    </TabsTrigger>
                  </TabsList>

                  {/* Application Information Tab Content */}
                  <TabsContent value="details" className="flex-1 overflow-y-auto space-y-6 pr-1 focus-visible:outline-none">
                    {/* Personal & Contact Details Card */}
                    <div className="rounded-xl border bg-card/60 p-5 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Contact & Personal Details
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> Full Name
                          </span>
                          <p className="text-sm font-semibold text-foreground">{selectedApplication.full_name}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> Email Address
                          </span>
                          <p className="text-sm font-medium">
                            <a
                              href={`mailto:${selectedApplication.email}`}
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              {selectedApplication.email}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> Phone Number
                          </span>
                          <p className="text-sm font-medium">
                            {selectedApplication.phone ? (
                              <a
                                href={`tel:${selectedApplication.phone}`}
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {selectedApplication.phone}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground italic">Not provided</span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" /> Position Applied
                          </span>
                          <p className="text-sm font-semibold text-foreground">
                            {(selectedApplication.position_id && jobTitleMap[String(selectedApplication.position_id)]) ||
                              selectedApplication.job_title ||
                              '—'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5 text-blue-600" /> Experience
                          </span>
                          <p className="text-sm font-semibold text-foreground">
                            {selectedApplication.experience_years} {selectedApplication.experience_years === 1 ? 'Year' : 'Years'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Submission Date
                          </span>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(selectedApplication.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Documents & Links Card */}
                    <div className="rounded-xl border bg-card/60 p-5 shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Documents & Profiles
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {/* Resume Card */}
                        <div className="border rounded-lg p-3 bg-background flex flex-col justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">Resume / CV</p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedApplication.resume_url ? 'PDF Document' : 'Not provided'}
                              </p>
                            </div>
                          </div>
                          {selectedApplication.resume_url ? (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs flex-1 gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer"
                                onClick={() => setActiveTab('resume')}
                              >
                                <Eye className="h-3 w-3" />
                                View PDF
                              </Button>
                              <a
                                href={getResumeUrl(selectedApplication.resume_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-7 px-2 border rounded-md text-xs hover:bg-muted"
                                title="Open in new window"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No resume uploaded</span>
                          )}
                        </div>

                        {/* LinkedIn Card */}
                        <div className="border rounded-lg p-3 bg-background flex flex-col justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-md bg-blue-500/10 text-blue-600">
                              <Linkedin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">LinkedIn Profile</p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedApplication.linkedin_url ? 'Professional Profile' : 'Not provided'}
                              </p>
                            </div>
                          </div>
                          {selectedApplication.linkedin_url ? (
                            <a
                              href={selectedApplication.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 h-7 text-xs rounded-md border bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit LinkedIn
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Not provided</span>
                          )}
                        </div>

                        {/* Portfolio Card */}
                        <div className="border rounded-lg p-3 bg-background flex flex-col justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-md bg-purple-500/10 text-purple-600">
                              <Globe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold">Portfolio / Website</p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedApplication.portfolio_url ? 'Online Portfolio' : 'Not provided'}
                              </p>
                            </div>
                          </div>
                          {selectedApplication.portfolio_url ? (
                            <a
                              href={selectedApplication.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 h-7 text-xs rounded-md border bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit Portfolio
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Not provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter Card */}
                    <div className="rounded-xl border bg-card/60 p-5 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Cover Letter / Candidate Statement
                        </h4>
                      </div>
                      {selectedApplication.cover_letter ? (
                        <div className="rounded-lg bg-muted/40 p-4 border border-border/50 text-sm leading-relaxed text-foreground whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                          {selectedApplication.cover_letter}
                        </div>
                      ) : (
                        <div className="rounded-lg bg-muted/20 p-4 border border-dashed border-border/60 text-xs text-muted-foreground italic text-center">
                          Candidate did not provide a cover letter.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Resume PDF Tab Content */}
                  <TabsContent value="resume" className="flex-1 overflow-hidden flex flex-col focus-visible:outline-none">
                    <div className="flex items-center justify-between pb-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground font-medium">
                        Viewing Resume for {selectedApplication.full_name}
                      </span>
                      {selectedApplication.resume_url && (
                        <a
                          href={getResumeUrl(selectedApplication.resume_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open in New Tab
                        </a>
                      )}
                    </div>
                    <div className="flex-1 w-full rounded-lg border bg-muted/20 overflow-hidden min-h-[480px]">
                      {selectedApplication.resume_url ? (
                        <iframe
                          src={getResumeUrl(selectedApplication.resume_url)}
                          className="w-full h-full min-h-[480px] border-none"
                          title={`Resume - ${selectedApplication.full_name}`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                          <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">No resume document uploaded for this applicant.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume PDF Viewer Modal */}
      <Dialog open={!!previewResume} onOpenChange={(open) => !open && setPreviewResume(null)}>
        <DialogContent className="max-w-4xl w-[95vw] sm:max-w-4xl p-0 overflow-hidden flex flex-col h-[88vh] bg-background">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0 flex flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span>{previewResume?.name}&apos;s Resume</span>
                </DialogTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                  PDF Document
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Position: {previewResume?.position || 'Applicant'}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 mr-6">
              {previewResume?.url && (
                <a
                  href={previewResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-secondary/60 hover:bg-secondary text-secondary-foreground transition-colors shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in New Tab</span>
                </a>
              )}
            </div>
          </DialogHeader>

          <div className="relative flex-1 w-full bg-muted/30 overflow-hidden">
            {previewResume?.url ? (
              <iframe
                src={previewResume.url}
                className="w-full h-full border-none"
                title={`Resume - ${previewResume.name}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No resume document available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
