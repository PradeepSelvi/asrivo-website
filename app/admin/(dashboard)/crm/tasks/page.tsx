import React from 'react'
import { getTasks } from '@/lib/supabase/crm-actions'
import { CheckSquare, Calendar, AlertCircle, User, Clock } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function CRMTasksPage() {
  const [
    pendingResult,
    overdueResult,
    completedResult,
  ] = await Promise.all([
    getTasks({ status: 'pending' }),
    getTasks({ overdue: true }),
    getTasks({ status: 'completed', limit: 10 }),
  ])

  const pendingTasks = pendingResult.data || []
  const overdueTasks = overdueResult.data || []
  const completedTasks = completedResult.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Follow-ups, reminders, and action items
            </p>
          </div>
        </div>
        <Link
          href="/admin/crm/tasks/new"
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          + Add Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pending</p>
          <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Overdue</p>
          <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Completed</p>
          <p className="text-2xl font-bold text-green-500">{completedTasks.length}</p>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-500">Overdue Tasks</h3>
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                      task.priority === 'urgent' ? 'bg-red-500/20 text-red-500' :
                      task.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold">
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Tasks</h3>
        {pendingTasks.length > 0 ? (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-5 h-5 rounded border-2 border-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {task.task_type || 'Task'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {task.priority || 'medium'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Complete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending tasks</p>
            <Link href="/admin/crm/tasks/new" className="text-sm text-primary hover:underline mt-2 inline-block">
              Create your first task
            </Link>
          </div>
        )}
      </div>

      {/* Recently Completed */}
      {completedTasks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recently Completed</h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-background rounded-lg opacity-60">
                <CheckSquare className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-foreground line-through">{task.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {task.completed_at && new Date(task.completed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
