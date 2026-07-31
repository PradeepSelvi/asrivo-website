import React from 'react'
import { getActivities } from '@/lib/supabase/crm-actions'
import { MessageSquare, Mail, Phone, Video, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


const activityIcons: Record<string, any> = {
  email: Mail,
  call: Phone,
  meeting: Video,
  note: FileText,
  task: FileText,
  demo: Video,
  'proposal-sent': FileText,
}

export default async function CRMActivitiesPage() {
  const { data: activities } = await getActivities({ limit: 50 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all interactions with leads and customers
            </p>
          </div>
        </div>
        <Link
          href="/admin/crm/activities/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          + Log Activity
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center bg-card border border-border rounded-xl p-4">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        <button className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
          All Activities
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Emails
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Calls
        </button>
        <button className="px-3 py-1.5 bg-background text-muted-foreground hover:bg-muted rounded-lg text-xs font-semibold">
          Meetings
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        {activities && activities.length > 0 ? (
          <div className="space-y-6">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.activity_type] || MessageSquare
              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.activity_type === 'email' ? 'bg-blue-500/10' :
                      activity.activity_type === 'call' ? 'bg-green-500/10' :
                      activity.activity_type === 'meeting' ? 'bg-purple-500/10' :
                      'bg-gray-500/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        activity.activity_type === 'email' ? 'text-blue-500' :
                        activity.activity_type === 'call' ? 'text-green-500' :
                        activity.activity_type === 'meeting' ? 'text-purple-500' :
                        'text-gray-500'
                      }`} />
                    </div>
                    <div className="w-px h-full bg-border mt-2" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{activity.subject}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize">{activity.activity_type}</span>
                          {activity.direction && (
                            <span className="capitalize">• {activity.direction}</span>
                          )}
                          {activity.duration_minutes && (
                            <span>• {activity.duration_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.activity_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-foreground bg-background p-3 rounded-lg border border-border mt-3">
                        {activity.description}
                      </p>
                    )}

                    {activity.outcome && (
                      <div className="mt-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          activity.outcome === 'success' ? 'bg-green-500/10 text-green-500' :
                          activity.outcome === 'no-answer' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          Outcome: {activity.outcome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Activities Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Start tracking your interactions with leads and customers
            </p>
            <Link
              href="/admin/crm/activities/new"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Log Your First Activity
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
