# CRM Functions Reference Guide

Complete reference for all CRM functions available in `lib/supabase/crm-actions.ts`

## 📊 Analytics & Reporting

### `getCRMStats()`
Get key CRM metrics
```typescript
const { data } = await getCRMStats()
// Returns: { totalLeads, activeDeals, pipelineValue, tasksDueToday }
```

### `getLeadsByStatus()`
Get lead count breakdown by status
```typescript
const { data } = await getLeadsByStatus()
// Returns: { new: 5, contacted: 3, qualified: 2, ... }
```

### `getDealsByStage()`
Get deal summary by pipeline stage
```typescript
const { data } = await getDealsByStage()
// Returns: { qualification: { count: 3, value: 15000 }, ... }
```

### `getPipelineStats()`
Detailed pipeline analytics
```typescript
const { data } = await getPipelineStats()
// Returns: { totalValue, weightedValue, avgDealSize, byStage }
```

### `getLeadConversionRate(startDate?, endDate?)`
Calculate lead-to-deal conversion rate
```typescript
const { data } = await getLeadConversionRate('2024-01-01', '2024-12-31')
// Returns: { total, converted, conversionRate }
```

### `getDealWinRate(startDate?, endDate?)`
Calculate deal win/loss rate
```typescript
const { data } = await getDealWinRate()
// Returns: { total, won, lost, winRate }
```

### `getAverageDealCycleTime()`
Get average days from deal creation to close
```typescript
const { data } = await getAverageDealCycleTime()
// Returns: { avgDays, totalDeals }
```

### `getActivityMetrics(startDate?, endDate?)`
Activity statistics by type and user
```typescript
const { data } = await getActivityMetrics()
// Returns: { total, byType: {...}, byUser: {...} }
```

## 👤 Lead Management

### `getLeads(filters?)`
Get all leads with optional filters
```typescript
const { data } = await getLeads({
  status: 'new',
  assigned_to: userId,
  priority: 'hot',
  limit: 10
})
```

### `getLeadById(id)`
Get single lead by ID
```typescript
const { data } = await getLeadById(123)
```

### `createLead(lead)`
Create new lead
```typescript
const { data } = await createLead({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  company_name: 'Acme Corp',
  lead_source: 'website'
})
```

### `updateLead(id, updates)`
Update lead information
```typescript
await updateLead(123, {
  lead_status: 'contacted',
  lead_score: 85
})
```

### `deleteLead(id)`
Delete a lead
```typescript
await deleteLead(123)
```

### `assignLead(leadId, userId)`
Assign lead to team member
```typescript
await assignLead(123, userId)
```

### `updateLeadScore(leadId, score)`
Update lead score (0-100)
```typescript
await updateLeadScore(123, 85)
```

### `searchLeads(searchTerm)`
Search leads by name, email, or company
```typescript
const { data } = await searchLeads('acme')
```

### `getLeadsAdvanced(filters)`
Advanced filtering with multiple criteria
```typescript
const { data, count } = await getLeadsAdvanced({
  status: ['new', 'contacted'],
  priority: ['hot', 'warm'],
  score_min: 70,
  created_after: '2024-01-01',
  search: 'john',
  limit: 20,
  offset: 0
})
```

### `convertLeadToDeal(leadId, dealData)`
Convert lead to deal
```typescript
const { data } = await convertLeadToDeal(123, {
  deal_name: 'Acme Corp - Web Development',
  deal_value: 50000,
  product_service: 'web-development'
})
```

## 💼 Deal Management

### `getDeals(filters?)`
Get all deals with optional filters
```typescript
const { data } = await getDeals({
  stage: 'proposal',
  owner_id: userId,
  is_active: true,
  limit: 10
})
```

### `getDealById(id)`
Get single deal by ID
```typescript
const { data } = await getDealById(456)
```

### `createDeal(deal)`
Create new deal
```typescript
const { data } = await createDeal({
  deal_name: 'Acme Corp Project',
  contact_email: 'john@acme.com',
  contact_name: 'John Doe',
  deal_value: 50000,
  stage: 'qualification'
})
```

### `updateDeal(id, updates)`
Update deal information
```typescript
await updateDeal(456, {
  stage: 'negotiation',
  probability: 75
})
```

### `moveDealStage(dealId, newStage)`
Move deal to different pipeline stage
```typescript
await moveDealStage(456, 'proposal')
```

### `closeDeal(dealId, won, reason?)`
Close deal as won or lost
```typescript
await closeDeal(456, true) // Won
await closeDeal(456, false, 'Budget constraints') // Lost
```

### `searchDeals(searchTerm)`
Search deals by name or company
```typescript
const { data } = await searchDeals('acme')
```

## 📝 Activity Tracking

### `getActivities(filters?)`
Get activities with optional filters
```typescript
const { data } = await getActivities({
  lead_id: 123,
  deal_id: 456,
  limit: 20
})
```

### `createActivity(activity)`
Log new activity
```typescript
await createActivity({
  lead_id: 123,
  activity_type: 'call',
  subject: 'Discovery call',
  description: 'Discussed project requirements',
  direction: 'outbound',
  duration_minutes: 30,
  outcome: 'success'
})
```

## ✅ Task Management

### `getTasks(filters?)`
Get tasks with optional filters
```typescript
const { data } = await getTasks({
  assigned_to: userId,
  status: 'pending',
  overdue: true,
  limit: 10
})
```

### `createTask(task)`
Create new task
```typescript
await createTask({
  title: 'Follow up with lead',
  description: 'Send proposal',
  task_type: 'follow-up',
  priority: 'high',
  lead_id: 123,
  due_date: '2024-12-31',
  assigned_to: userId
})
```

### `updateTask(id, updates)`
Update task
```typescript
await updateTask(789, {
  status: 'in-progress',
  due_date: '2025-01-15'
})
```

### `completeTask(id)`
Mark task as completed
```typescript
await completeTask(789)
```

## 📌 Notes

### `getNotes(filters?)`
Get notes for lead or deal
```typescript
const { data } = await getNotes({
  lead_id: 123,
  deal_id: 456
})
```

### `createNote(note)`
Add new note
```typescript
await createNote({
  lead_id: 123,
  content: 'Very interested in our services',
  is_pinned: true
})
```

## 📧 Email Templates

### `getEmailTemplates(category?)`
Get all email templates
```typescript
const { data } = await getEmailTemplates('follow-up')
```

### `createEmailTemplate(template)`
Create new template
```typescript
await createEmailTemplate({
  name: 'Initial Outreach',
  subject: 'Quick question for {{company_name}}',
  body: 'Hi {{first_name}}, ...',
  category: 'prospecting',
  variables: ['first_name', 'company_name']
})
```

### `renderEmailTemplate(templateId, variables)`
Render template with variables
```typescript
const { data } = await renderEmailTemplate(1, {
  first_name: 'John',
  company_name: 'Acme Corp'
})
// Returns: { subject: '...', body: '...' }
```

## 🏷️ Tags Management

### `getTags(category?)`
Get all tags
```typescript
const { data } = await getTags('priority')
```

### `createTag(tag)`
Create new tag
```typescript
await createTag({
  name: 'Enterprise',
  color: '#8b5cf6',
  category: 'company-size',
  description: 'Enterprise-level clients'
})
```

### `deleteTag(id)`
Delete tag
```typescript
await deleteTag(10)
```

## 🔄 Bulk Operations

### `bulkUpdateLeads(leadIds, updates)`
Update multiple leads at once
```typescript
await bulkUpdateLeads([1, 2, 3], {
  lead_status: 'contacted',
  priority: 'warm'
})
```

### `bulkDeleteLeads(leadIds)`
Delete multiple leads
```typescript
await bulkDeleteLeads([1, 2, 3])
```

### `bulkAssignLeads(leadIds, userId)`
Assign multiple leads to user
```typescript
await bulkAssignLeads([1, 2, 3], userId)
```

### `bulkUpdateLeadStatus(leadIds, status)`
Update status for multiple leads
```typescript
await bulkUpdateLeadStatus([1, 2, 3], 'qualified')
```

## 📤 Export Functions

### `exportLeadsToCSV()`
Export all leads to CSV
```typescript
const { data, filename } = await exportLeadsToCSV()
// Returns CSV string and suggested filename
```

### `exportDealsToCSV()`
Export all deals to CSV
```typescript
const { data, filename } = await exportDealsToCSV()
// Returns CSV string and suggested filename
```

## 🎯 Lead Scoring (lib/crm/lead-scoring.ts)

### `calculateLeadScore(lead)`
Calculate 0-100 score for a lead
```typescript
import { calculateLeadScore } from '@/lib/crm/lead-scoring'

const score = calculateLeadScore({
  company_size: 'enterprise',
  job_title: 'CEO',
  lead_source: 'referral',
  phone: '+1234567890',
  company_name: 'Acme Corp'
})
// Returns: 85
```

### `getPriorityFromScore(score)`
Get priority level from score
```typescript
import { getPriorityFromScore } from '@/lib/crm/lead-scoring'

const priority = getPriorityFromScore(85)
// Returns: 'hot' | 'warm' | 'cold' | 'medium'
```

### `getScoreBreakdown(lead)`
Get detailed scoring breakdown
```typescript
import { getScoreBreakdown } from '@/lib/crm/lead-scoring'

const breakdown = getScoreBreakdown(lead)
// Returns: Array of { category, points, max, reason }
```

### `getRecommendedActions(score, status)`
Get recommended next actions
```typescript
import { getRecommendedActions } from '@/lib/crm/lead-scoring'

const actions = getRecommendedActions(85, 'new')
// Returns: ['Make first contact within 24 hours', ...]
```

## 🔍 Usage Examples

### Complete Lead Management Flow
```typescript
// 1. Create lead
const { data: lead } = await createLead({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@acme.com',
  company_name: 'Acme Corp',
  lead_source: 'website'
})

// 2. Calculate score
const score = calculateLeadScore(lead)
await updateLeadScore(lead.id, score)

// 3. Assign to team member
await assignLead(lead.id, userId)

// 4. Create follow-up task
await createTask({
  title: 'Initial contact',
  lead_id: lead.id,
  due_date: '2024-12-20',
  priority: 'high'
})

// 5. Log activity
await createActivity({
  lead_id: lead.id,
  activity_type: 'email',
  subject: 'Welcome email sent',
  description: 'Sent initial outreach'
})

// 6. Convert to deal
const { data: deal } = await convertLeadToDeal(lead.id, {
  deal_name: 'Acme Corp - Web Development',
  deal_value: 50000
})
```

### Pipeline Reporting
```typescript
// Get all key metrics
const stats = await getCRMStats()
const conversion = await getLeadConversionRate()
const winRate = await getDealWinRate()
const cycleTime = await getAverageDealCycleTime()
const pipeline = await getPipelineStats()

console.log({
  leads: stats.data.totalLeads,
  deals: stats.data.activeDeals,
  pipelineValue: stats.data.pipelineValue,
  conversionRate: conversion.data.conversionRate,
  winRate: winRate.data.winRate,
  avgCycleTime: cycleTime.data.avgDays
})
```

### Advanced Search & Filter
```typescript
// Find high-value leads
const { data: hotLeads } = await getLeadsAdvanced({
  priority: ['hot'],
  score_min: 80,
  status: ['new', 'contacted'],
  created_after: '2024-01-01',
  limit: 50
})

// Search across all fields
const { data: searchResults } = await searchLeads('enterprise')

// Get overdue tasks
const { data: overdueTasks } = await getTasks({
  overdue: true,
  assigned_to: userId
})
```

## 🔐 Security Notes

All functions:
- ✅ Use Row Level Security (RLS)
- ✅ Require authentication
- ✅ Track user actions with `created_by`
- ✅ Auto-update timestamps
- ✅ Revalidate cache paths

## 📚 Type Definitions

All interfaces are exported from `lib/supabase/crm-actions.ts`:
- `CRMLead`
- `CRMDeal`
- `CRMActivity`
- `CRMTask`
- `CRMNote`
- `EmailTemplate`
- `CRMTag`

Import them for TypeScript support:
```typescript
import type { CRMLead, CRMDeal } from '@/lib/supabase/crm-actions'
```

## 🎯 Best Practices

1. **Always check success**: All functions return `{ success, data?, error? }`
2. **Use filters**: Paginate large datasets with `limit` and `offset`
3. **Bulk operations**: Use bulk functions for multiple updates
4. **Calculate scores**: Run lead scoring after creating/updating leads
5. **Track activities**: Log all customer interactions
6. **Export regularly**: Backup data with CSV exports

## 🆘 Error Handling

```typescript
const result = await createLead(leadData)

if (!result.success) {
  console.error('Error:', result.error)
  // Handle error
  return
}

// Use result.data safely
const lead = result.data
```

---

**Total Functions**: 50+
**Categories**: 10
**Status**: Production Ready ✅
