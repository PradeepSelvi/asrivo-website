'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createTask, getLeads, getDeals } from '@/lib/supabase/crm-actions'
import { CheckSquare, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

function NewTaskForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialLeadId = searchParams.get('lead_id') || ''
  const initialDealId = searchParams.get('deal_id') || ''

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [leads, setLeads] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loadingRelations, setLoadingRelations] = useState(true)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'follow-up',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    reminder_date: '',
    lead_id: initialLeadId,
    deal_id: initialDealId,
    status: 'pending',
  })

  useEffect(() => {
    async function loadRelations() {
      try {
        const [leadsRes, dealsRes] = await Promise.all([
          getLeads({ limit: 100 }),
          getDeals({ limit: 100 }),
        ])
        setLeads(leadsRes.data || [])
        setDeals(dealsRes.data || [])
      } catch (err) {
        console.error('Failed to load leads/deals for task creation:', err)
      } finally {
        setLoadingRelations(false)
      }
    }
    loadRelations()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }

    if (!formData.due_date) {
      setError('Due date is required')
      return
    }

    startTransition(async () => {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: new Date(formData.due_date).toISOString(),
        reminder_date: formData.reminder_date
          ? new Date(formData.reminder_date).toISOString()
          : null,
        lead_id: formData.lead_id ? parseInt(formData.lead_id, 10) : null,
        deal_id: formData.deal_id ? parseInt(formData.deal_id, 10) : null,
        status: formData.status,
      }

      const result = await createTask(payload)

      if (result.success) {
        router.push('/admin/crm/tasks')
        router.refresh()
      } else {
        setError(result.error || 'Failed to create task')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <CheckSquare className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Task</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add a follow-up task or reminder
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

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Follow up with client about proposal"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
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
            placeholder="Add any additional details about this task..."
            rows={4}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
            disabled={isPending}
          />
        </div>

        {/* Task Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Task Type
            </label>
            <select
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              disabled={isPending}
            >
              <option value="follow-up">Follow-up</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="demo">Demo</option>
              <option value="proposal">Proposal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              disabled={isPending}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Reminder Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={formData.reminder_date}
                onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Association with Lead or Deal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Link to Lead (Optional)
            </label>
            <select
              value={formData.lead_id}
              onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              disabled={isPending || loadingRelations}
            >
              <option value="">None</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.first_name} {lead.last_name} {lead.company_name ? `(${lead.company_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Link to Deal (Optional)
            </label>
            <select
              value={formData.deal_id}
              onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              disabled={isPending || loadingRelations}
            >
              <option value="">None</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.deal_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Task'}
          </button>
          <Link
            href="/admin/crm/tasks"
            className="px-6 py-2.5 text-muted-foreground hover:text-foreground font-semibold text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-500">
          💡 <strong>Tip:</strong> Tasks help you stay on top of follow-ups and ensure no lead falls through the cracks.
        </p>
      </div>
    </div>
  )
}

export default function NewTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <NewTaskForm />
    </Suspense>
  )
}
