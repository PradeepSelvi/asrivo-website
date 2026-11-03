'use client'

import React, { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import {
  CheckSquare,
  Square,
  Calendar,
  AlertCircle,
  User,
  Clock,
  Phone,
  Mail,
  Video,
  FileText,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  X,
  Building,
  Briefcase,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import {
  CRMTask,
  completeTask,
  reopenTask,
  deleteTask,
  createTask,
  updateTask,
} from '@/lib/supabase/crm-actions'

interface CRMTasksClientProps {
  initialPendingTasks: CRMTask[]
  initialOverdueTasks: CRMTask[]
  initialCompletedTasks: CRMTask[]
  leads: Array<{ id: number; first_name: string; last_name: string; company_name?: string }>
  deals: Array<{ id: number; deal_name: string }>
}

const typeIcons: Record<string, any> = {
  'follow-up': Clock,
  call: Phone,
  email: Mail,
  meeting: Video,
  demo: Video,
  proposal: FileText,
  other: CheckSquare,
}

export default function CRMTasksClient({
  initialPendingTasks,
  initialOverdueTasks,
  initialCompletedTasks,
  leads = [],
  deals = [],
}: CRMTasksClientProps) {
  // Combine all unique tasks into a single master state
  const [tasks, setTasks] = useState<CRMTask[]>(() => {
    const map = new Map<number, CRMTask>()
    // Add completed
    initialCompletedTasks.forEach((t) => t.id && map.set(t.id, t))
    // Add pending
    initialPendingTasks.forEach((t) => t.id && map.set(t.id, t))
    // Add overdue (with flag)
    initialOverdueTasks.forEach((t) => {
      if (t.id) {
        map.set(t.id, { ...t, is_overdue: true })
      }
    })
    return Array.from(map.values())
  })

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Async transitions / loading
  const [isPending, startTransition] = useTransition()
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState('follow-up')
  const [formPriority, setFormPriority] = useState('medium')
  const [formDueDate, setFormDueDate] = useState('')
  const [formReminderDate, setFormReminderDate] = useState('')
  const [formLeadId, setFormLeadId] = useState<string>('')
  const [formDealId, setFormDealId] = useState<string>('')
  const [formStatus, setFormStatus] = useState<string>('pending')
  const [formError, setFormError] = useState('')

  // Show auto-dismiss notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr))
    }, 3500)
  }

  // Derived counts
  const pendingTasksList = useMemo(
    () => tasks.filter((t) => t.status !== 'completed'),
    [tasks]
  )
  const overdueTasksList = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status !== 'completed' &&
          Boolean(t.due_date && new Date(t.due_date) < new Date())
      ),
    [tasks]
  )
  const completedTasksList = useMemo(
    () => tasks.filter((t) => t.status === 'completed'),
    [tasks]
  )

  // Filtered tasks for the main list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      const isOverdue =
        task.status !== 'completed' &&
        Boolean(task.due_date && new Date(task.due_date) < new Date())

      if (activeTab === 'pending' && task.status === 'completed') return false
      if (activeTab === 'overdue' && !isOverdue) return false
      if (activeTab === 'completed' && task.status !== 'completed') return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = task.title?.toLowerCase().includes(query)
        const matchDesc = task.description?.toLowerCase().includes(query)
        const matchType = task.task_type?.toLowerCase().includes(query)
        if (!matchTitle && !matchDesc && !matchType) return false
      }

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false
      }

      // Type filter
      if (filterType !== 'all' && task.task_type !== filterType) {
        return false
      }

      return true
    })
  }, [tasks, activeTab, searchQuery, filterPriority, filterType])

  // Open modal for new task
  const openCreateModal = () => {
    setEditingTask(null)
    setFormTitle('')
    setFormDescription('')
    setFormType('follow-up')
    setFormPriority('medium')
    // Default due date to today
    setFormDueDate(new Date().toISOString().split('T')[0])
    setFormReminderDate('')
    setFormLeadId('')
    setFormDealId('')
    setFormStatus('pending')
    setFormError('')
    setIsAddModalOpen(true)
  }

  // Open modal for editing
  const openEditModal = (task: CRMTask) => {
    setEditingTask(task)
    setFormTitle(task.title || '')
    setFormDescription(task.description || '')
    setFormType(task.task_type || 'follow-up')
    setFormPriority(task.priority || 'medium')
    setFormDueDate(
      task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    )
    setFormReminderDate(
      task.reminder_date
        ? new Date(task.reminder_date).toISOString().split('T')[0]
        : ''
    )
    setFormLeadId(task.lead_id ? String(task.lead_id) : '')
    setFormDealId(task.deal_id ? String(task.deal_id) : '')
    setFormStatus(task.status || 'pending')
    setFormError('')
    setIsAddModalOpen(true)
  }

  // Handle Complete Task
  const handleComplete = async (taskId: number) => {
    setLoadingTaskId(taskId)
    startTransition(async () => {
      const result = await completeTask(taskId)
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  is_overdue: false,
                }
              : t
          )
        )
        showToast('success', 'Task marked as completed!')
      } else {
        showToast('error', result.error || 'Failed to complete task')
      }
      setLoadingTaskId(null)
    })
  }

  // Handle Reopen Task
  const handleReopen = async (taskId: number) => {
    setLoadingTaskId(taskId)
    startTransition(async () => {
      const result = await reopenTask(taskId)
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'pending',
                  completed_at: null,
                  is_overdue: t.due_date ? new Date(t.due_date) < new Date() : false,
                }
              : t
          )
        )
        showToast('success', 'Task reopened!')
      } else {
        showToast('error', result.error || 'Failed to reopen task')
      }
      setLoadingTaskId(null)
    })
  }

  // Handle Delete Task
  const handleDelete = async (taskId: number) => {
    setLoadingTaskId(taskId)
    startTransition(async () => {
      const result = await deleteTask(taskId)
      if (result.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
        showToast('success', 'Task deleted successfully!')
        setDeletingTaskId(null)
      } else {
        showToast('error', result.error || 'Failed to delete task')
      }
      setLoadingTaskId(null)
    })
  }

  // Save Task (Create or Edit)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formTitle.trim()) {
      setFormError('Task title is required')
      return
    }

    if (!formDueDate) {
      setFormError('Due date is required')
      return
    }

    const payload: CRMTask = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      task_type: formType,
      priority: formPriority,
      due_date: new Date(formDueDate).toISOString(),
      reminder_date: formReminderDate ? new Date(formReminderDate).toISOString() : null,
      lead_id: formLeadId ? parseInt(formLeadId, 10) : null,
      deal_id: formDealId ? parseInt(formDealId, 10) : null,
      status: formStatus,
    }

    startTransition(async () => {
      if (editingTask?.id) {
        const result = await updateTask(editingTask.id, payload)
        if (result.success && result.data) {
          const updated = result.data
          const isOverdue =
            updated.status !== 'completed' &&
            Boolean(updated.due_date && new Date(updated.due_date) < new Date())
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTask.id ? { ...updated, is_overdue: isOverdue } : t))
          )
          showToast('success', 'Task updated successfully!')
          setIsAddModalOpen(false)
        } else {
          setFormError(result.error || 'Failed to update task')
        }
      } else {
        const result = await createTask(payload)
        if (result.success && result.data) {
          const created = result.data
          const isOverdue =
            created.status !== 'completed' &&
            Boolean(created.due_date && new Date(created.due_date) < new Date())
          setTasks((prev) => [{ ...created, is_overdue: isOverdue }, ...prev])
          showToast('success', 'Task created successfully!')
          setIsAddModalOpen(false)
        } else {
          setFormError(result.error || 'Failed to create task')
        }
      }
    })
  }

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Due today'
    if (days === 1) return '1 day overdue'
    return `${days} days overdue`
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Follow-ups, reminders, and action items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Card */}
        <button
          onClick={() => setActiveTab('pending')}
          className={`text-left bg-card border rounded-xl p-4 transition-all hover:shadow-sm ${
            activeTab === 'pending'
              ? 'border-primary ring-2 ring-primary/20 shadow-sm'
              : 'border-border hover:border-primary/40'
          }`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Pending
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-foreground">
              {pendingTasksList.length}
            </p>
            <span className="text-xs text-muted-foreground">Open items</span>
          </div>
        </button>

        {/* Overdue Card */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`text-left bg-card border rounded-xl p-4 transition-all hover:shadow-sm ${
            activeTab === 'overdue'
              ? 'border-red-500 ring-2 ring-red-500/20 shadow-sm'
              : 'border-border hover:border-red-400'
          }`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Overdue
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-red-500">
              {overdueTasksList.length}
            </p>
            <span className="text-xs text-red-500/80 font-medium">Needs attention</span>
          </div>
        </button>

        {/* Completed Card */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`text-left bg-card border rounded-xl p-4 transition-all hover:shadow-sm ${
            activeTab === 'completed'
              ? 'border-green-500 ring-2 ring-green-500/20 shadow-sm'
              : 'border-border hover:border-green-400'
          }`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Completed
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold text-green-500">
              {completedTasksList.length}
            </p>
            <span className="text-xs text-muted-foreground">Finished</span>
          </div>
        </button>
      </div>

      {/* Navigation Tabs & Search / Filter Controls */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Pending ({pendingTasksList.length})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'overdue'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
              }`}
            >
              Overdue ({overdueTasksList.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-green-600 hover:bg-green-500/10'
              }`}
            >
              Completed ({completedTasksList.length})
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Task Types</option>
              <option value="follow-up">Follow-up</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="demo">Demo</option>
              <option value="proposal">Proposal</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* OVERDUE TASKS BANNER (When on 'all' or 'overdue' tab and overdue tasks exist) */}
      {(activeTab === 'all' || activeTab === 'overdue') && overdueTasksList.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-500">Overdue Tasks</h3>
              <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">
                {overdueTasksList.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {overdueTasksList.map((task) => {
              const Icon = task.task_type ? typeIcons[task.task_type] || Clock : Clock
              const isTaskLoading = loadingTaskId === task.id

              return (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 p-4 bg-background/80 hover:bg-background rounded-lg border border-red-500/20 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => task.id && handleComplete(task.id)}
                      disabled={isTaskLoading}
                      title="Click to mark as complete"
                      className="mt-1 w-5 h-5 rounded border-2 border-red-400 hover:border-green-500 flex items-center justify-center transition-colors group shrink-0"
                    >
                      <Check className="w-3.5 h-3.5 text-transparent group-hover:text-green-500 transition-colors" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-base truncate">
                          {task.title}
                        </p>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-muted-foreground">
                        {task.due_date && (
                          <span className="flex items-center gap-1 font-semibold text-red-500">
                            <Calendar className="w-3.5 h-3.5 text-red-500" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                            <span className="font-normal text-red-500/80">
                              ({getDaysOverdue(task.due_date)})
                            </span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 capitalize">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          {task.task_type || 'Follow-up'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            task.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-500'
                              : task.priority === 'high'
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}
                        >
                          {task.priority || 'medium'}
                        </span>

                        {task.lead && (
                          <span className="flex items-center gap-1 text-primary">
                            <User className="w-3 h-3" />
                            {task.lead.first_name} {task.lead.last_name}
                          </span>
                        )}

                        {task.deal && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Briefcase className="w-3 h-3" />
                            {task.deal.deal_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => task.id && handleComplete(task.id)}
                      disabled={isTaskLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isTaskLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Complete
                    </button>

                    <button
                      onClick={() => openEditModal(task)}
                      title="Edit Task"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => task.id && setDeletingTaskId(task.id)}
                      title="Delete Task"
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MAIN TASKS LIST */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {activeTab === 'all'
              ? 'All Tasks'
              : activeTab === 'pending'
              ? 'Pending Tasks'
              : activeTab === 'overdue'
              ? 'Overdue Tasks'
              : 'Completed Tasks'}
          </h3>

          <span className="text-xs text-muted-foreground font-medium">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed'
              const isOverdue =
                !isCompleted &&
                Boolean(task.due_date && new Date(task.due_date) < new Date())
              const Icon = task.task_type ? typeIcons[task.task_type] || Clock : Clock
              const isTaskLoading = loadingTaskId === task.id

              return (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-muted/30 border-border opacity-70 hover:opacity-100'
                      : isOverdue
                      ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                      : 'bg-background border-border hover:border-primary/40 shadow-sm'
                  }`}
                >
                  {/* Left: Checkbox & Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        if (!task.id) return
                        if (isCompleted) {
                          handleReopen(task.id)
                        } else {
                          handleComplete(task.id)
                        }
                      }}
                      disabled={isTaskLoading}
                      title={isCompleted ? 'Click to reopen' : 'Click to complete'}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : isOverdue
                          ? 'border-red-400 hover:border-green-500'
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      {isTaskLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                      ) : isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : null}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-semibold text-foreground text-base ${
                            isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </p>

                        {isOverdue && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          className={`text-sm mt-1 line-clamp-2 ${
                            isCompleted ? 'text-muted-foreground/80 line-through' : 'text-muted-foreground'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center gap-3 sm:gap-4 mt-2.5 flex-wrap text-xs text-muted-foreground">
                        {task.due_date && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue
                                ? 'text-red-500 font-semibold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}

                        <span className="flex items-center gap-1 capitalize">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          {task.task_type || 'Follow-up'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-red-500/10 text-red-500'
                              : task.priority === 'high'
                              ? 'bg-orange-500/10 text-orange-500'
                              : task.priority === 'low'
                              ? 'bg-slate-500/10 text-slate-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {task.priority || 'medium'}
                        </span>

                        {task.lead && (
                          <span className="flex items-center gap-1 text-primary">
                            <User className="w-3 h-3" />
                            {task.lead.first_name} {task.lead.last_name}
                          </span>
                        )}

                        {task.deal && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Briefcase className="w-3 h-3" />
                            {task.deal.deal_name}
                          </span>
                        )}

                        {isCompleted && task.completed_at && (
                          <span className="text-green-600 font-medium">
                            Completed: {new Date(task.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted ? (
                      <button
                        onClick={() => task.id && handleReopen(task.id)}
                        disabled={isTaskLoading}
                        className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {isTaskLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        Reopen
                      </button>
                    ) : (
                      <button
                        onClick={() => task.id && handleComplete(task.id)}
                        disabled={isTaskLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isTaskLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Complete
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(task)}
                      title="Edit Task"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => task.id && setDeletingTaskId(task.id)}
                      title="Delete Task"
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery
                ? 'No tasks matched your search'
                : activeTab === 'pending'
                ? 'No pending tasks! All caught up.'
                : activeTab === 'overdue'
                ? 'No overdue tasks! Great job.'
                : activeTab === 'completed'
                ? 'No completed tasks yet.'
                : 'No tasks found.'}
            </p>
            <button
              onClick={openCreateModal}
              className="text-sm text-primary hover:underline mt-2 inline-block font-semibold"
            >
              + Create a new task
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {editingTask
                      ? 'Update the details for this task'
                      : 'Create a reminder or follow-up item'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2.5 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Follow up on proposal"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Task Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Reminder Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Reminder Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formReminderDate}
                      onChange={(e) => setFormReminderDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Link to Lead / Deal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Link to Lead (Optional)
                  </label>
                  <select
                    value={formLeadId}
                    onChange={(e) => setFormLeadId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Link to Deal (Optional)
                  </label>
                  <select
                    value={formDealId}
                    onChange={(e) => setFormDealId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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

              {/* Status (If editing) */}
              {editingTask && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Task</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to permanently delete this task?
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This action cannot be undone and will permanently remove this task from your CRM.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingTaskId)}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

