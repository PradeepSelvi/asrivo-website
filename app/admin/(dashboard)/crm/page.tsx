import React from 'react'
import { getCRMStats, getLeadsByStatus, getDealsByStage, getLeads, getDeals, getTasks } from '@/lib/supabase/crm-actions'
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckSquare,
  User,
  Briefcase,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

export default async function CRMDashboard() {
  const [
    statsResult,
    leadStatusResult,
    dealStageResult,
    recentLeadsResult,
    activeDealsResult,
    upcomingTasksResult,
  ] = await Promise.all([
    getCRMStats(),
    getLeadsByStatus(),
    getDealsByStage(),
    getLeads({ limit: 5 }),
    getDeals({ is_active: true, limit: 5 }),
    getTasks({ status: 'pending', limit: 5 }),
  ])

  const stats = statsResult.data || { totalLeads: 0, activeDeals: 0, pipelineValue: 0, tasksDueToday: 0 }
  const leadsByStatus = leadStatusResult.data || {}
  const dealsByStage = dealStageResult.data || {}
  const recentLeads = recentLeadsResult.data || []
  const activeDeals = activeDealsResult.data || []
  const upcomingTasks = upcomingTasksResult.data || []

  const statCards = [
    { name: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-blue-500 bg-blue-500/10', href: '/admin/crm/leads' },
    { name: 'Active Deals', value: stats.activeDeals, icon: Briefcase, color: 'text-green-500 bg-green-500/10', href: '/admin/crm/deals' },
    { name: 'Pipeline Value', value: `$${Math.round(stats.pipelineValue).toLocaleString()}`, icon: DollarSign, color: 'text-purple-500 bg-purple-500/10', href: '/admin/crm/deals' },
    { name: 'Tasks Due Today', value: stats.tasksDueToday, icon: CheckSquare, color: 'text-orange-500 bg-orange-500/10', href: '/admin/crm/tasks' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Manage leads, track deals, and drive sales pipeline.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.name}
                  </p>
                  <h3 className="text-3xl font-extrabold text-foreground mt-2 tracking-tight group-hover:text-primary transition-colors">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} transition-all group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Lead Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Leads by Status
            </h2>
            <Link href="/admin/crm/leads" className="text-xs text-primary hover:text-primary/80 font-semibold">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {Object.entries(leadsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-foreground capitalize">{status.replace('-', ' ')}</span>
                <span className="text-sm font-bold text-primary">{count}</span>
              </div>
            ))}
            {Object.keys(leadsByStatus).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No leads yet</p>
            )}
          </div>
        </div>

        {/* Deal Pipeline Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Deal Pipeline
            </h2>
            <Link href="/admin/crm/deals" className="text-xs text-primary hover:text-primary/80 font-semibold">
              View pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {Object.entries(dealsByStage).map(([stage, data]: [string, any]) => (
              <div key={stage} className="p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground capitalize">{stage.replace('-', ' ')}</span>
                  <span className="text-xs font-bold text-muted-foreground">{data.count} deals</span>
                </div>
                <div className="text-sm font-bold text-primary">${Math.round(data.value).toLocaleString()}</div>
              </div>
            ))}
            {Object.keys(dealsByStage).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No active deals</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads & Upcoming Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Recent Leads
            </h2>
            <Link href="/admin/crm/leads" className="text-xs text-primary hover:text-primary/80 font-semibold">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/crm/leads/${lead.id}`}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  {lead.company_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{lead.company_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    lead.priority === 'hot' ? 'bg-red-500/10 text-red-500' :
                    lead.priority === 'warm' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {lead.priority || 'medium'}
                  </span>
                  {lead.lead_score > 0 && (
                    <span className="text-xs font-bold text-primary">{lead.lead_score}</span>
                  )}
                </div>
              </Link>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No leads yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Tasks
            </h2>
            <Link href="/admin/crm/tasks" className="text-xs text-primary hover:text-primary/80 font-semibold">
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.is_overdue && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {task.priority || 'medium'}
                  </span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No pending tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/crm/leads?action=new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 text-center font-semibold transition-all"
        >
          + Add New Lead
        </Link>
        <Link
          href="/admin/crm/deals?action=new"
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 text-center font-semibold transition-all"
        >
          + Create Deal
        </Link>
        <Link
          href="/admin/crm/activities?action=new"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-4 text-center font-semibold transition-all"
        >
          + Log Activity
        </Link>
        <Link
          href="/admin/crm/tasks?action=new"
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl p-4 text-center font-semibold transition-all"
        >
          + Add Task
        </Link>
      </div>
    </div>
  )
}
