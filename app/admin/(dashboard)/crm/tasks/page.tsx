import React from 'react'
import { getTasks, getLeads, getDeals } from '@/lib/supabase/crm-actions'
import CRMTasksClient from './tasks-client'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CRMTasksPage() {
  const [
    pendingResult,
    overdueResult,
    completedResult,
    leadsResult,
    dealsResult,
  ] = await Promise.all([
    getTasks({ status: 'pending' }),
    getTasks({ overdue: true }),
    getTasks({ status: 'completed', limit: 50 }),
    getLeads({ limit: 100 }),
    getDeals({ limit: 100 }),
  ])

  const pendingTasks = pendingResult.data || []
  const overdueTasks = overdueResult.data || []
  const completedTasks = completedResult.data || []
  const leads = leadsResult.data || []
  const deals = dealsResult.data || []

  return (
    <CRMTasksClient
      initialPendingTasks={pendingTasks}
      initialOverdueTasks={overdueTasks}
      initialCompletedTasks={completedTasks}
      leads={leads}
      deals={deals}
    />
  )
}
