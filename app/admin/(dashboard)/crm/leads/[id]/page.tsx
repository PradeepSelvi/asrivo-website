import React from 'react'
import { getLeadById, getActivities, getNotes, getTasks } from '@/lib/supabase/crm-actions'
import { getScoreBreakdown, getRecommendedActions } from '@/lib/crm/lead-scoring'
import { ArrowLeft, Mail, Phone, Building, Globe, TrendingUp, Calendar, User, MessageSquare, CheckSquare, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const leadId = parseInt(params.id)
  
  const [
    leadResult,
    activitiesResult,
    notesResult,
    tasksResult,
  ] = await Promise.all([
    getLeadById(leadId),
    getActivities({ lead_id: leadId }),
    getNotes({ lead_id: leadId }),
    getTasks({ lead_id: leadId }),
  ])

  if (!leadResult.success || !leadResult.data) {
    notFound()
  }

  const lead = leadResult.data
  const activities = activitiesResult.data || []
  const notes = notesResult.data || []
  const tasks = tasksResult.data || []

  const scoreBreakdown = getScoreBreakdown(lead)
  const recommendedActions = getRecommendedActions(lead.lead_score || 0, lead.lead_status)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/crm/leads" className="p-2 bg-card border border-border rounded-lg hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lead.job_title && `${lead.job_title} at `}
              {lead.company_name || 'Individual Lead'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/crm/leads/${leadId}/edit`}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Edit Lead
          </Link>
          <Link
            href={`/admin/crm/deals/new?lead_id=${leadId}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Convert to Deal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm text-foreground hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.company_name && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm text-foreground">{lead.company_name}</p>
                  </div>
                </div>
              )}

              {lead.company_website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a href={lead.company_website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {lead.company_website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
              <Link
                href={`/admin/crm/activities/new?lead_id=${leadId}`}
                className="text-sm text-primary hover:underline font-semibold"
              >
                + Log Activity
              </Link>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">{activity.subject}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 capitalize">
                        {activity.activity_type} • {activity.direction}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-foreground">{activity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-8">
                No activities yet. Log your first interaction!
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Notes</h3>
              <Link
                href={`/admin/crm/notes/new?lead_id=${leadId}`}
                className="text-sm text-primary hover:underline font-semibold"
              >
                + Add Note
              </Link>
            </div>

            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">No notes yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Score */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Lead Score</h3>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{lead.lead_score || 0}</span>
              </div>
            </div>

            <div className="space-y-2">
              {scoreBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="text-foreground font-semibold">{item.points}/{item.max}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Priority */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lead Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  lead.lead_status === 'new' ? 'bg-blue-500/10 text-blue-500' :
                  lead.lead_status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500' :
                  lead.lead_status === 'qualified' ? 'bg-green-500/10 text-green-500' :
                  'bg-gray-500/10 text-gray-500'
                }`}>
                  {lead.lead_status}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  lead.priority === 'hot' ? 'bg-red-500/10 text-red-500' :
                  lead.priority === 'warm' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {lead.priority || 'medium'}
                </span>
              </div>

              {lead.lead_source && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source</p>
                  <p className="text-sm text-foreground capitalize">{lead.lead_source.replace('-', ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Actions</h3>
            <ul className="space-y-2">
              {recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tasks */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
              <Link
                href={`/admin/crm/tasks/new?lead_id=${leadId}`}
                className="text-sm text-primary hover:underline font-semibold"
              >
                + Add
              </Link>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">No tasks</p>
            )}
          </div>

          {/* Lead Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Lead Information</h3>
            <div className="space-y-3 text-sm">
              {lead.company_size && (
                <div>
                  <p className="text-xs text-muted-foreground">Company Size</p>
                  <p className="text-foreground capitalize">{lead.company_size}</p>
                </div>
              )}
              {lead.industry && (
                <div>
                  <p className="text-xs text-muted-foreground">Industry</p>
                  <p className="text-foreground">{lead.industry}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-foreground">{new Date(lead.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
