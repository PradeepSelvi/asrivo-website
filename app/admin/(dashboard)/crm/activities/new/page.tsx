'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createActivity } from '@/lib/supabase/crm-actions'
import { MessageSquare, Mail, Phone, Video, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


const activityIcons = {
  email: Mail,
  call: Phone,
  meeting: Video,
  demo: Video,
  note: MessageSquare,
}

export default function NewActivityPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    activity_type: 'call',
    subject: '',
    description: '',
    direction: 'outbound',
    outcome: '',
    duration_minutes: '',
    activity_date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.subject.trim()) {
      setError('Activity subject is required')
      return
    }

    if (!formData.activity_date) {
      setError('Activity date is required')
      return
    }

    const activityData = {
      ...formData,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      is_completed: true,
    }

    startTransition(async () => {
      const result = await createActivity(activityData)
      
      if (result.success) {
        router.push('/admin/crm/activities')
        router.refresh()
      } else {
        setError(result.error || 'Failed to log activity')
      }
    })
  }

  const Icon = activityIcons[formData.activity_type as keyof typeof activityIcons] || MessageSquare

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log New Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record an interaction with a lead or customer
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Activity Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.activity_type}
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isPending}
          >
            <option value="call">Phone Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
            <option value="demo">Demo</option>
            <option value="note">Note</option>
            <option value="proposal-sent">Proposal Sent</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="e.g., Initial discovery call"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isPending}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add notes about what was discussed, next steps, key takeaways..."
            rows={5}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            disabled={isPending}
          />
        </div>

        {/* Direction and Outcome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Direction
            </label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isPending}
            >
              <option value="outbound">Outbound (I initiated)</option>
              <option value="inbound">Inbound (They initiated)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Outcome
            </label>
            <select
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isPending}
            >
              <option value="">Select outcome...</option>
              <option value="success">Successful</option>
              <option value="no-answer">No Answer</option>
              <option value="voicemail">Left Voicemail</option>
              <option value="follow-up-needed">Follow-up Needed</option>
              <option value="meeting-scheduled">Meeting Scheduled</option>
              <option value="not-interested">Not Interested</option>
            </select>
          </div>
        </div>

        {/* Date and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Activity Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={formData.activity_date}
                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              placeholder="e.g., 30"
              min="1"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Logging...' : 'Log Activity'}
          </button>
          <Link
            href="/admin/crm/activities"
            className="px-6 py-2.5 text-muted-foreground hover:text-foreground font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-500">
          💡 <strong>Tip:</strong> Logging activities helps track engagement history and improves lead scoring accuracy.
        </p>
      </div>
    </div>
  )
}
