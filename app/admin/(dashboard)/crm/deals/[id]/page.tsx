import { getDealById, getActivities, getTasks, getNotes } from '@/lib/supabase/crm-actions'
import { Briefcase, DollarSign, Calendar, TrendingUp, Mail, Phone, Building2, User, Edit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const dealId = parseInt(params.id)
  
  const [dealResult, activitiesResult, tasksResult, notesResult] = await Promise.all([
    getDealById(dealId),
    getActivities({ deal_id: dealId, limit: 10 }),
    getTasks({ deal_id: dealId, limit: 10 }),
    getNotes({ deal_id: dealId }),
  ])

  if (!dealResult.success || !dealResult.data) {
    notFound()
  }

  const deal = dealResult.data
  const activities = activitiesResult.data || []
  const tasks = tasksResult.data || []
  const notes = notesResult.data || []

  const stageColors: Record<string, string> = {
    'qualification': 'bg-blue-500/10 text-blue-500',
    'proposal': 'bg-purple-500/10 text-purple-500',
    'negotiation': 'bg-orange-500/10 text-orange-500',
    'closed-won': 'bg-green-500/10 text-green-500',
    'closed-lost': 'bg-red-500/10 text-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/crm/deals" className="p-2 bg-card border border-border rounded-lg hover:bg-muted mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{deal.deal_name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{deal.company_name || deal.contact_name}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/admin/crm/deals/${dealId}/edit`}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Deal
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Deal Value</p>
              <p className="text-xl font-bold text-foreground">${(deal.deal_value || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Probability</p>
              <p className="text-xl font-bold text-foreground">{deal.probability || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Expected Close</p>
              <p className="text-sm font-bold text-foreground">
                {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold uppercase ${stageColors[deal.stage] || 'bg-gray-500/10 text-gray-500'}`}>
            {deal.stage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Information */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Deal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Contact Name</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-foreground font-medium">{deal.contact_name}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Contact Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${deal.contact_email}`} className="text-sm text-primary hover:underline">
                    {deal.contact_email}
                  </a>
                </div>
              </div>

              {deal.company_name && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Company</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium">{deal.company_name}</p>
                  </div>
                </div>
              )}

              {deal.deal_type && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Deal Type</p>
                  <p className="text-sm text-foreground capitalize">{deal.deal_type}</p>
                </div>
              )}

              {deal.product_service && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Product/Service</p>
                  <p className="text-sm text-foreground">{deal.product_service}</p>
                </div>
              )}

              {deal.currency && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Currency</p>
                  <p className="text-sm text-foreground uppercase">{deal.currency}</p>
                </div>
              )}
            </div>

            {deal.description && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Description</p>
                <p className="text-sm text-foreground">{deal.description}</p>
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Activities</h3>
              <Link href="/admin/crm/activities/new" className="text-sm text-primary hover:underline font-semibold">
                + Log Activity
              </Link>
            </div>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{activity.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{activity.activity_type}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tasks */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
              <Link href="/admin/crm/tasks/new" className="text-sm text-primary hover:underline font-semibold">
                + Add
              </Link>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 bg-background rounded">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Notes</h3>
            </div>
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-background rounded-lg text-sm text-foreground">
                    {note.content}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
