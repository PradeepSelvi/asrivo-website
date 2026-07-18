# CRM Implementation Guide

## Overview
This guide walks you through implementing the complete CRM system for Asrivo Tech's admin panel.

## Files Created
1. **CRM_DATABASE_SCHEMA.sql** - Complete database structure
2. **lib/supabase/crm-actions.ts** - Server actions for CRM operations
3. **CRM_IMPLEMENTATION_PLAN.md** - High-level planning document

## Step 1: Database Setup

### Run the CRM Schema
```bash
# In your Supabase SQL Editor, run:
CRM_DATABASE_SCHEMA.sql
```

This creates:
- 9 new tables (leads, deals, activities, tasks, notes, tags, templates, pipeline stages, settings)
- Indexes for performance
- Row Level Security policies
- Default data (pipeline stages, email templates, tags)
- Useful views for reporting
- Migration function to import existing contacts

### Migrate Existing Data (Optional)
```sql
-- Run this to convert your existing contacts to CRM leads
SELECT migrate_contacts_to_crm_leads();
```

## Step 2: UI Components to Build

### Priority 1: CRM Dashboard
**File**: `app/admin/(dashboard)/crm/page.tsx`

Features:
- Key metrics cards (leads, deals, pipeline value, tasks due)
- Lead funnel visualization
- Deal pipeline by stage chart
- Recent activities feed
- Quick actions (add lead, add deal, create task)

```tsx
import { getCRMStats, getLeadsByStatus, getDealsByStage } from '@/lib/supabase/crm-actions'
```

### Priority 2: Leads Management
**File**: `app/admin/(dashboard)/crm/leads/page.tsx`

Features:
- Table view of all leads
- Filters (status, priority, assigned to)
- Search by name/email/company
- Quick actions (assign, change status, add note)
- Lead score badges
- Click to view detail page

**File**: `app/admin/(dashboard)/crm/leads/[id]/page.tsx`

Features:
- Full lead profile
- Activity timeline
- Notes section
- Tasks list
- Quick actions (email, call, schedule meeting)
- Convert to deal button

### Priority 3: Deal Pipeline
**File**: `app/admin/(dashboard)/crm/deals/page.tsx`

Features:
- Kanban board view by stage
- Drag-and-drop to move deals between stages
- Deal cards showing: name, value, probability, owner
- Filter by owner, date range, value
- Add new deal modal

### Priority 4: Activities & Timeline
**File**: `app/admin/(dashboard)/crm/activities/page.tsx`

Features:
- Chronological activity feed
- Filter by type (email, call, meeting, note)
- Filter by team member
- Log new activity modal
- Quick actions from activity items

### Priority 5: Tasks & Reminders
**File**: `app/admin/(dashboard)/crm/tasks/page.tsx`

Features:
- Task list with due dates
- Overdue tasks highlighted
- Group by: Today, This Week, Later, Completed
- Filter by assigned user
- Quick complete/reschedule actions
- Add new task modal

## Step 3: Navigation Updates

### Update Admin Layout Sidebar
**File**: `app/admin/(dashboard)/layout.tsx`

Add CRM navigation section:
```tsx
{
  name: 'CRM',
  icon: Users,
  children: [
    { name: 'Dashboard', href: '/admin/crm', icon: LayoutDashboard },
    { name: 'Leads', href: '/admin/crm/leads', icon: UserPlus },
    { name: 'Deals', href: '/admin/crm/deals', icon: DollarSign },
    { name: 'Activities', href: '/admin/crm/activities', icon: Activity },
    { name: 'Tasks', href: '/admin/crm/tasks', icon: CheckSquare },
  ]
}
```

## Step 4: Reusable Components

### Create CRM Component Library
**Folder**: `components/admin/crm/`

Components to build:
1. **LeadCard.tsx** - Display lead summary
2. **DealCard.tsx** - Display deal in kanban
3. **ActivityItem.tsx** - Timeline activity item
4. **TaskItem.tsx** - Task list item
5. **AddLeadModal.tsx** - Form to create lead
6. **AddDealModal.tsx** - Form to create deal
7. **AddActivityModal.tsx** - Form to log activity
8. **AddTaskModal.tsx** - Form to create task
9. **LeadScoreBadge.tsx** - Visual lead score indicator
10. **PriorityBadge.tsx** - Priority level badge
11. **StatusBadge.tsx** - Status indicator
12. **AssignUserDropdown.tsx** - Assign to team member

## Step 5: Key Features Implementation

### A. Lead Scoring Algorithm
Implement in `lib/crm/lead-scoring.ts`:
```typescript
export function calculateLeadScore(lead: CRMLead): number {
  let score = 0
  
  // Company size
  if (lead.company_size === 'enterprise') score += 30
  else if (lead.company_size === 'medium') score += 20
  else if (lead.company_size === 'small') score += 10
  
  // Engagement
  if (lead.contact_attempts > 0) score += 10
  if (lead.last_contacted_at) score += 5
  
  // Completeness
  if (lead.phone) score += 5
  if (lead.company_name) score += 5
  if (lead.job_title) score += 5
  if (lead.company_website) score += 5
  
  // Source quality
  if (lead.lead_source === 'referral') score += 20
  else if (lead.lead_source === 'website') score += 10
  
  return Math.min(100, score)
}
```

### B. Email Templates System
**File**: `app/admin/(dashboard)/crm/templates/page.tsx`

Features:
- List all templates
- Create/edit templates
- Variable insertion ({{first_name}}, {{company_name}})
- Preview with sample data
- Usage statistics

### C. Task Reminders
Implement cron job or scheduled function to send reminders:
```typescript
// Supabase Edge Function or Next.js cron route
export async function sendTaskReminders() {
  const tasks = await getTasks({
    status: 'pending',
    reminder_date: today,
  })
  
  // Send email/notification for each task
}
```

### D. Pipeline Stage Customization
**File**: `app/admin/(dashboard)/crm/settings/pipeline/page.tsx`

Features:
- Edit stage names
- Reorder stages
- Set default probability per stage
- Add/remove stages
- Color coding

### E. Reporting Dashboard
**File**: `app/admin/(dashboard)/crm/reports/page.tsx`

Charts to build:
- Lead source breakdown (pie chart)
- Conversion funnel (funnel chart)
- Revenue forecast (line chart)
- Team performance (bar chart)
- Win/loss ratio (donut chart)
- Average deal size (metric card)

Use libraries:
- **recharts** for charts
- **date-fns** for date handling
- **Export to CSV** functionality

## Step 6: Advanced Features

### A. Email Integration (Future)
- BCC email forwarding to CRM
- Automatic activity logging from emails
- Send emails directly from CRM
- Email tracking (opens, clicks)

### B. Calendar Integration (Future)
- Sync tasks with Google Calendar
- Schedule meetings from CRM
- Automatic activity logging from calendar

### C. Automation Rules (Future)
- Auto-assign leads based on rules
- Automated follow-up sequences
- Lead scoring auto-updates
- Notification triggers

### D. Mobile Responsive
- Ensure all CRM pages work on mobile
- Consider simplified mobile views
- Quick action buttons optimized for touch

## Step 7: Testing Checklist

### Functional Testing:
- [ ] Create new lead
- [ ] Update lead status
- [ ] Assign lead to user
- [ ] Convert lead to deal
- [ ] Move deal through pipeline
- [ ] Close deal (won/lost)
- [ ] Log activity
- [ ] Create task
- [ ] Complete task
- [ ] Add notes
- [ ] Filter and search
- [ ] View reports

### Performance Testing:
- [ ] Load 100+ leads quickly
- [ ] Pipeline drag-and-drop smooth
- [ ] Search responds instantly
- [ ] Charts load without lag

### Security Testing:
- [ ] RLS policies working
- [ ] Only admins can access CRM
- [ ] Users see only assigned data (if implemented)
- [ ] No SQL injection vulnerabilities

## Step 8: Deployment

### Pre-deployment:
1. Run database migrations on production
2. Test all CRM features in staging
3. Train admin users
4. Create user documentation
5. Set up monitoring

### Post-deployment:
1. Monitor for errors
2. Gather user feedback
3. Track usage metrics
4. Plan iteration improvements

## Recommended Development Order

### Week 1: Foundation
1. ✅ Database schema (DONE)
2. ✅ Server actions (DONE)
3. CRM dashboard page
4. Lead list page
5. Lead detail page

### Week 2: Core Features
1. Deal pipeline kanban
2. Activity logging
3. Task management
4. Basic search/filters

### Week 3: Enhancement
1. Email templates
2. Notes system
3. Tags/categorization
4. Lead scoring

### Week 4: Analytics
1. Reporting dashboard
2. Export functionality
3. Pipeline analytics
4. Team performance metrics

## Resources

### UI Components Libraries
- **shadcn/ui** - Accessible components
- **dnd-kit** - Drag and drop for kanban
- **react-hot-toast** - Notifications
- **recharts** - Charts and graphs

### Icons
- **lucide-react** - Already in use
- Consider: User, UserPlus, Users, DollarSign, TrendingUp, Activity, CheckSquare, Calendar, Mail, Phone, FileText

### Sample Data
Run this to add sample leads for testing:
```sql
INSERT INTO crm_leads (first_name, last_name, email, company_name, lead_status, priority, lead_score)
VALUES 
  ('John', 'Doe', 'john@example.com', 'Acme Corp', 'new', 'hot', 85),
  ('Jane', 'Smith', 'jane@startup.io', 'Startup Inc', 'contacted', 'warm', 65),
  ('Bob', 'Johnson', 'bob@enterprise.com', 'Big Enterprise', 'qualified', 'hot', 95);
```

## Support & Maintenance

### Monitoring:
- Track CRM usage metrics
- Monitor database performance
- Alert on failed operations

### Regular Tasks:
- Clean up old/stale leads
- Archive closed deals
- Backup CRM data
- Update lead scores periodically

### Future Enhancements:
- AI-powered lead scoring
- Predictive analytics
- Automated workflows
- Mobile app
- Third-party integrations (Slack, Zapier)

## Questions?

Refer to:
- CRM_IMPLEMENTATION_PLAN.md for strategy
- CRM_DATABASE_SCHEMA.sql for data structure
- lib/supabase/crm-actions.ts for API functions

Ready to build? Start with the CRM dashboard page!
