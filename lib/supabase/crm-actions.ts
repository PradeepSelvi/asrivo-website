'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'

// ============================================
// LEAD MANAGEMENT
// ============================================

export interface CRMLead {
  id?: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  company_name?: string
  job_title?: string
  lead_source?: string
  lead_status?: string
  lead_score?: number
  priority?: string
  company_size?: string
  industry?: string
  company_website?: string
  company_revenue?: string
  assigned_to?: string
  last_contacted_at?: string
  next_follow_up?: string
  contact_attempts?: number
  notes?: string
  tags?: string[]
  custom_fields?: any
  converted_to_deal_id?: number
  conversion_date?: string
  created_at?: string
  updated_at?: string
}

export async function getLeads(filters?: {
  status?: string
  assigned_to?: string
  priority?: string
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('lead_status', filters.status)
  }
  
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }
  
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching leads:', error)
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function getLeadById(id: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

export async function createLead(lead: CRMLead) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .insert({
      ...lead,
      created_by: user?.id,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function updateLead(id: number, updates: Partial<CRMLead>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function deleteLead(id: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true }
}

export async function assignLead(leadId: number, userId: string) {
  return updateLead(leadId, {
    assigned_to: userId,
  })
}

export async function updateLeadScore(leadId: number, score: number) {
  return updateLead(leadId, {
    lead_score: Math.max(0, Math.min(100, score)),
  })
}

// ============================================
// DEAL MANAGEMENT
// ============================================

export interface CRMDeal {
  id?: number
  deal_name: string
  lead_id?: number
  contact_email: string
  contact_name: string
  company_name?: string
  stage?: string
  probability?: number
  deal_value?: number
  currency?: string
  expected_close_date?: string
  actual_close_date?: string
  owner_id?: string
  deal_type?: string
  product_service?: string
  is_active?: boolean
  lost_reason?: string
  description?: string
  notes?: string
  tags?: string[]
}

export async function getDeals(filters?: {
  stage?: string
  owner_id?: string
  is_active?: boolean
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_deals')
    .select('*')
    .order('expected_close_date', { ascending: true })
  
  if (filters?.stage) {
    query = query.eq('stage', filters.stage)
  }
  
  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id)
  }
  
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function getDealById(id: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

export async function createDeal(deal: CRMDeal) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_deals')
    .insert({
      ...deal,
      owner_id: deal.owner_id || user?.id,
      created_by: user?.id,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function updateDeal(id: number, updates: Partial<CRMDeal>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_deals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function moveDealStage(dealId: number, newStage: string) {
  return updateDeal(dealId, {
    stage: newStage,
  })
}

export async function closeDeal(dealId: number, won: boolean, reason?: string) {
  const updates: Partial<CRMDeal> = {
    stage: won ? 'closed-won' : 'closed-lost',
    is_active: false,
    actual_close_date: new Date().toISOString().split('T')[0],
    probability: won ? 100 : 0,
  }
  
  if (!won && reason) {
    updates.lost_reason = reason
  }
  
  return updateDeal(dealId, updates)
}

// ============================================
// ACTIVITY TRACKING
// ============================================

export interface CRMActivity {
  id?: number
  lead_id?: number
  deal_id?: number
  contact_email?: string
  activity_type: string
  subject: string
  description?: string
  direction?: string
  duration_minutes?: number
  outcome?: string
  attachment_urls?: string[]
  activity_date?: string
  is_completed?: boolean
}

export async function getActivities(filters?: {
  lead_id?: number
  deal_id?: number
  activity_type?: string
  performed_by?: string
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_activities')
    .select('*')
    .order('activity_date', { ascending: false })
  
  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id)
  }
  
  if (filters?.deal_id) {
    query = query.eq('deal_id', filters.deal_id)
  }
  
  if (filters?.activity_type) {
    query = query.eq('activity_type', filters.activity_type)
  }
  
  if (filters?.performed_by) {
    query = query.eq('performed_by', filters.performed_by)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function createActivity(activity: CRMActivity) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_activities')
    .insert({
      ...activity,
      performed_by: user?.id,
      activity_date: activity.activity_date || new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Update lead's last_contacted_at if this is a lead activity
  if (activity.lead_id) {
    await updateLead(activity.lead_id, {
      last_contacted_at: new Date().toISOString(),
    })
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

// ============================================
// TASK MANAGEMENT
// ============================================

export interface CRMTask {
  id?: number
  title: string
  description?: string
  task_type?: string
  priority?: string
  lead_id?: number
  deal_id?: number
  assigned_to?: string
  due_date?: string
  reminder_date?: string
  status?: string
}

export async function getTasks(filters?: {
  assigned_to?: string
  status?: string
  overdue?: boolean
  lead_id?: number
  deal_id?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_tasks')
    .select('*')
    .order('due_date', { ascending: true })
  
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id)
  }
  
  if (filters?.deal_id) {
    query = query.eq('deal_id', filters.deal_id)
  }
  
  if (filters?.overdue) {
    query = query
      .neq('status', 'completed')
      .lt('due_date', new Date().toISOString())
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  // Add is_overdue flag to each task
  const tasksWithOverdue = data?.map(task => ({
    ...task,
    is_overdue: task.status !== 'completed' && new Date(task.due_date) < new Date()
  }))
  
  return { success: true, data: tasksWithOverdue || [] }
}

export async function createTask(task: CRMTask) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_tasks')
    .insert({
      ...task,
      assigned_by: user?.id,
      assigned_to: task.assigned_to || user?.id,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function updateTask(id: number, updates: Partial<CRMTask>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function completeTask(id: number) {
  return updateTask(id, {
    status: 'completed',
  })
}

// ============================================
// NOTES
// ============================================

export interface CRMNote {
  id?: number
  lead_id?: number
  deal_id?: number
  content: string
  is_pinned?: boolean
}

export async function getNotes(filters?: {
  lead_id?: number
  deal_id?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_notes')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id)
  }
  
  if (filters?.deal_id) {
    query = query.eq('deal_id', filters.deal_id)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function createNote(note: CRMNote) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_notes')
    .insert({
      ...note,
      created_by: user?.id,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

// ============================================
// ANALYTICS
// ============================================

export async function getCRMStats() {
  const supabase = await createClient()
  
  const [
    { count: totalLeads },
    { count: activeDeals },
    { data: pipelineValue },
    { count: tasksDueToday },
  ] = await Promise.all([
    supabase.from('crm_leads').select('*', { count: 'exact', head: true }),
    supabase.from('crm_deals').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('crm_deals').select('deal_value, probability').eq('is_active', true),
    supabase.from('crm_tasks').select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString().split('T')[0])
      .lt('due_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]),
  ])
  
  const weightedPipeline = pipelineValue?.reduce((sum, deal) => {
    return sum + (deal.deal_value || 0) * ((deal.probability || 0) / 100)
  }, 0) || 0
  
  return {
    success: true,
    data: {
      totalLeads: totalLeads || 0,
      activeDeals: activeDeals || 0,
      pipelineValue: weightedPipeline,
      tasksDueToday: tasksDueToday || 0,
    },
  }
}

export async function getLeadsByStatus() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .select('lead_status')
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  const statusCounts = data.reduce((acc: Record<string, number>, lead) => {
    acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1
    return acc
  }, {})
  
  return { success: true, data: statusCounts }
}

export async function getDealsByStage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_deals')
    .select('stage, deal_value')
    .eq('is_active', true)
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  const stageSummary = data.reduce((acc: Record<string, { count: number, value: number }>, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = { count: 0, value: 0 }
    }
    acc[deal.stage].count++
    acc[deal.stage].value += deal.deal_value || 0
    return acc
  }, {})
  
  return { success: true, data: stageSummary }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export interface EmailTemplate {
  id?: number
  name: string
  subject: string
  body: string
  category?: string
  variables?: string[]
  is_active?: boolean
}

export async function getEmailTemplates(category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_email_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function createEmailTemplate(template: EmailTemplate) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('crm_email_templates')
    .insert({
      ...template,
      created_by: user?.id,
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function renderEmailTemplate(templateId: number, variables: Record<string, string>) {
  const supabase = await createClient()
  
  const { data: template, error } = await supabase
    .from('crm_email_templates')
    .select('*')
    .eq('id', templateId)
    .single()
  
  if (error || !template) {
    return { success: false, error: 'Template not found' }
  }
  
  let renderedSubject = template.subject
  let renderedBody = template.body
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), value)
    renderedBody = renderedBody.replace(new RegExp(placeholder, 'g'), value)
  })
  
  return {
    success: true,
    data: {
      subject: renderedSubject,
      body: renderedBody,
    },
  }
}

// ============================================
// TAGS MANAGEMENT
// ============================================

export interface CRMTag {
  id?: number
  name: string
  color?: string
  category?: string
  description?: string
}

export async function getTags(category?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_tags')
    .select('*')
    .order('name')
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function createTag(tag: CRMTag) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_tags')
    .insert(tag)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function deleteTag(id: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('crm_tags')
    .delete()
    .eq('id', id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true }
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function bulkUpdateLeads(leadIds: number[], updates: Partial<CRMLead>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .update(updates)
    .in('id', leadIds)
    .select()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true, data }
}

export async function bulkDeleteLeads(leadIds: number[]) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('crm_leads')
    .delete()
    .in('id', leadIds)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/crm')
  return { success: true }
}

export async function bulkAssignLeads(leadIds: number[], userId: string) {
  return bulkUpdateLeads(leadIds, { assigned_to: userId })
}

export async function bulkUpdateLeadStatus(leadIds: number[], status: string) {
  return bulkUpdateLeads(leadIds, { lead_status: status })
}

// ============================================
// SEARCH & FILTERING
// ============================================

export async function searchLeads(searchTerm: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function searchDeals(searchTerm: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*')
    .or(`deal_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    return { success: false, error: error.message, data: [] }
  }
  
  return { success: true, data }
}

export async function getLeadsAdvanced(filters: {
  status?: string[]
  priority?: string[]
  source?: string[]
  assigned_to?: string
  score_min?: number
  score_max?: number
  created_after?: string
  created_before?: string
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_leads')
    .select('*', { count: 'exact' })
  
  if (filters.status && filters.status.length > 0) {
    query = query.in('lead_status', filters.status)
  }
  
  if (filters.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority)
  }
  
  if (filters.source && filters.source.length > 0) {
    query = query.in('lead_source', filters.source)
  }
  
  if (filters.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }
  
  if (filters.score_min !== undefined) {
    query = query.gte('lead_score', filters.score_min)
  }
  
  if (filters.score_max !== undefined) {
    query = query.lte('lead_score', filters.score_max)
  }
  
  if (filters.created_after) {
    query = query.gte('created_at', filters.created_after)
  }
  
  if (filters.created_before) {
    query = query.lte('created_at', filters.created_before)
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }
  
  if (filters.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`)
  }
  
  query = query.order('created_at', { ascending: false })
  
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return { success: false, error: error.message, data: [], count: 0 }
  }
  
  return { success: true, data, count }
}

// ============================================
// CONVERSION & PIPELINE
// ============================================

export async function convertLeadToDeal(leadId: number, dealData: Partial<CRMDeal>) {
  const supabase = await createClient()
  
  // Get lead details
  const { data: lead } = await getLeadById(leadId)
  
  if (!lead) {
    return { success: false, error: 'Lead not found' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Create deal from lead
  const deal: CRMDeal = {
    deal_name: dealData.deal_name || `${lead.company_name || lead.first_name + ' ' + lead.last_name} - ${dealData.product_service || 'Service'}`,
    lead_id: leadId,
    contact_email: lead.email,
    contact_name: `${lead.first_name} ${lead.last_name}`,
    company_name: lead.company_name,
    owner_id: dealData.owner_id || user?.id,
    ...dealData,
  }
  
  const dealResult = await createDeal(deal)
  
  if (!dealResult.success) {
    return dealResult
  }
  
  // Update lead status
  await updateLead(leadId, {
    lead_status: 'converted',
    converted_to_deal_id: dealResult.data.id,
    conversion_date: new Date().toISOString(),
  })
  
  revalidatePath('/admin/crm')
  return { success: true, data: dealResult.data }
}

export async function getPipelineStats() {
  const supabase = await createClient()
  
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('is_active', true)
  
  if (!deals) {
    return {
      success: true,
      data: {
        totalValue: 0,
        weightedValue: 0,
        avgDealSize: 0,
        totalDeals: 0,
        byStage: {},
      },
    }
  }
  
  const totalValue = deals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0)
  const weightedValue = deals.reduce((sum, deal) => {
    return sum + (deal.deal_value || 0) * ((deal.probability || 0) / 100)
  }, 0)
  const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0
  
  const byStage = deals.reduce((acc: Record<string, any>, deal) => {
    if (!acc[deal.stage]) {
      acc[deal.stage] = {
        count: 0,
        value: 0,
        avgValue: 0,
        probability: 0,
      }
    }
    acc[deal.stage].count++
    acc[deal.stage].value += deal.deal_value || 0
    acc[deal.stage].probability = deal.probability || 0
    return acc
  }, {})
  
  // Calculate averages
  Object.keys(byStage).forEach(stage => {
    byStage[stage].avgValue = byStage[stage].count > 0
      ? byStage[stage].value / byStage[stage].count
      : 0
  })
  
  return {
    success: true,
    data: {
      totalValue,
      weightedValue,
      avgDealSize,
      totalDeals: deals.length,
      byStage,
    },
  }
}

// ============================================
// REPORTING & ANALYTICS
// ============================================

export async function getLeadConversionRate(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_leads')
    .select('lead_status')
  
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  const { data } = await query
  
  if (!data || data.length === 0) {
    return {
      success: true,
      data: {
        total: 0,
        converted: 0,
        conversionRate: 0,
      },
    }
  }
  
  const total = data.length
  const converted = data.filter(lead => lead.lead_status === 'converted').length
  const conversionRate = (converted / total) * 100
  
  return {
    success: true,
    data: {
      total,
      converted,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
  }
}

export async function getDealWinRate(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_deals')
    .select('stage')
    .in('stage', ['closed-won', 'closed-lost'])
  
  if (startDate) {
    query = query.gte('actual_close_date', startDate)
  }
  
  if (endDate) {
    query = query.lte('actual_close_date', endDate)
  }
  
  const { data } = await query
  
  if (!data || data.length === 0) {
    return {
      success: true,
      data: {
        total: 0,
        won: 0,
        lost: 0,
        winRate: 0,
      },
    }
  }
  
  const total = data.length
  const won = data.filter(deal => deal.stage === 'closed-won').length
  const lost = data.filter(deal => deal.stage === 'closed-lost').length
  const winRate = (won / total) * 100
  
  return {
    success: true,
    data: {
      total,
      won,
      lost,
      winRate: Math.round(winRate * 100) / 100,
    },
  }
}

export async function getAverageDealCycleTime() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('crm_deals')
    .select('created_at, actual_close_date')
    .not('actual_close_date', 'is', null)
  
  if (!data || data.length === 0) {
    return {
      success: true,
      data: {
        avgDays: 0,
        totalDeals: 0,
      },
    }
  }
  
  const totalDays = data.reduce((sum, deal) => {
    const created = new Date(deal.created_at)
    const closed = new Date(deal.actual_close_date)
    const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  return {
    success: true,
    data: {
      avgDays: Math.round(totalDays / data.length),
      totalDeals: data.length,
    },
  }
}

export async function getActivityMetrics(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('crm_activities')
    .select('activity_type, performed_by')
  
  if (startDate) {
    query = query.gte('activity_date', startDate)
  }
  
  if (endDate) {
    query = query.lte('activity_date', endDate)
  }
  
  const { data } = await query
  
  if (!data || data.length === 0) {
    return {
      success: true,
      data: {
        total: 0,
        byType: {},
        byUser: {},
      },
    }
  }
  
  const byType = data.reduce((acc: Record<string, number>, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
    return acc
  }, {})
  
  const byUser = data.reduce((acc: Record<string, number>, activity) => {
    if (activity.performed_by) {
      acc[activity.performed_by] = (acc[activity.performed_by] || 0) + 1
    }
    return acc
  }, {})
  
  return {
    success: true,
    data: {
      total: data.length,
      byType,
      byUser,
    },
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export async function exportLeadsToCSV() {
  const { data: leads } = await getLeads()
  
  if (!leads || leads.length === 0) {
    return { success: false, error: 'No leads to export' }
  }
  
  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 
    'Job Title', 'Status', 'Priority', 'Score', 'Source', 'Created At'
  ]
  
  const rows = leads.map(lead => [
    lead.id,
    lead.first_name,
    lead.last_name,
    lead.email,
    lead.phone || '',
    lead.company_name || '',
    lead.job_title || '',
    lead.lead_status,
    lead.priority || '',
    lead.lead_score || 0,
    lead.lead_source || '',
    new Date(lead.created_at).toISOString(),
  ])
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return {
    success: true,
    data: csv,
    filename: `leads-export-${new Date().toISOString().split('T')[0]}.csv`,
  }
}

export async function exportDealsToCSV() {
  const { data: deals } = await getDeals({ is_active: true })
  
  if (!deals || deals.length === 0) {
    return { success: false, error: 'No deals to export' }
  }
  
  const headers = [
    'ID', 'Deal Name', 'Company', 'Contact', 'Stage', 'Value', 
    'Probability', 'Expected Close', 'Type', 'Product/Service', 'Created At'
  ]
  
  const rows = deals.map(deal => [
    deal.id,
    deal.deal_name,
    deal.company_name || '',
    deal.contact_name,
    deal.stage,
    deal.deal_value || 0,
    deal.probability || 0,
    deal.expected_close_date || '',
    deal.deal_type || '',
    deal.product_service || '',
    new Date(deal.created_at).toISOString(),
  ])
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return {
    success: true,
    data: csv,
    filename: `deals-export-${new Date().toISOString().split('T')[0]}.csv`,
  }
}
