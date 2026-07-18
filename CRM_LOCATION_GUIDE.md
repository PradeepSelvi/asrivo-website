# Where is the CRM? 📍

## In Your Admin Panel

### Sidebar Navigation
After logging into your admin panel at `/admin/login`, look for the **"CRM & Sales"** section in the left sidebar:

```
📊 CRM Dashboard  → /admin/crm
👤 Leads          → /admin/crm/leads
💼 Deals Pipeline → /admin/crm/deals
💬 Activities     → /admin/crm/activities
✅ Tasks          → /admin/crm/tasks
```

## Direct URLs

- **Dashboard**: `http://localhost:3000/admin/crm`
- **Leads**: `http://localhost:3000/admin/crm/leads`
- **Deals**: `http://localhost:3000/admin/crm/deals`
- **Activities**: `http://localhost:3000/admin/crm/activities`
- **Tasks**: `http://localhost:3000/admin/crm/tasks`

## What's Working Right Now

### ✅ CRM Dashboard (`/admin/crm`)
- Stats cards showing: Total Leads, Active Deals, Pipeline Value, Tasks Due Today
- Lead status breakdown chart
- Deal pipeline summary
- Recent leads list
- Upcoming tasks preview
- Quick action buttons

### ✅ Leads Page (`/admin/crm/leads`)
- Complete leads table
- Filter buttons (status, priority)
- Lead details: name, email, phone, company
- Lead scoring display
- Priority badges
- Source tracking
- Creation dates

### ⏳ Other Pages (Placeholder)
- Deals, Activities, and Tasks show "Under Construction" messages
- These are next to be built

## Files Created

### Pages:
- `app/admin/(dashboard)/crm/page.tsx` - CRM Dashboard
- `app/admin/(dashboard)/crm/leads/page.tsx` - Leads Management
- `app/admin/(dashboard)/crm/deals/page.tsx` - Deals (placeholder)
- `app/admin/(dashboard)/crm/activities/page.tsx` - Activities (placeholder)
- `app/admin/(dashboard)/crm/tasks/page.tsx` - Tasks (placeholde