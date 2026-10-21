# Implementation Plan - Code Refactoring

**Project:** Asrivo Tech Website  
**Goal:** Eliminate duplicate logic, create reusable utilities and components, improve maintainability

---

## Pre-Implementation Checklist

- [ ] Create a feature branch: `git checkout -b refactor/eliminate-duplicates`
- [ ] Ensure dev server is running: `pnpm dev`
- [ ] Verify build works before starting: `pnpm build`
- [ ] Run type check: `pnpm type-check`

---

## Phase 1: Foundation - Utilities & Helpers (Priority 1-2)

### ✅ Step 1: Create Unified API Supabase Client Factory

**What:** Create a centralized factory function for Supabase clients in API routes to eliminate inconsistent client creation patterns.

**Files to Create:**
- `lib/supabase/api-client.ts`

**Implementation:**
```typescript
// lib/supabase/api-client.ts
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for API routes (server-side)
 * Uses anon key for public routes, service role key for admin routes
 */
export function createApiClient(options?: { useServiceRole?: boolean }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = options?.useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
```

**Files to Modify:**
- `app/api/complaints/route.ts` - Replace direct `createSupabaseClient()` with `createApiClient()`
- `app/api/complaints/status/route.ts` - Same
- `app/api/consultations/route.ts` - Replace mixed usage
- `app/api/partnerships/route.ts` - Replace direct instantiation
- And all other API routes using direct instantiation (see analysis)

**Verify:**
```bash
pnpm type-check
pnpm build
# Test each affected API endpoint manually or with curl
```

---

### ✅ Step 2: Create Status Badge Utility & Component

**What:** Extract repeated status badge logic into a utility function and reusable component.

**Files to Create:**
- `lib/utils/status-config.ts`
- `components/ui/status-badge.tsx`
- `components/ui/priority-badge.tsx`

**Implementation:**

```typescript
// lib/utils/status-config.ts
export type StatusVariant = 'contact' | 'inquiry' | 'complaint' | 'consultation' | 'lead' | 'deal' | 'partnership'

export interface StatusConfig {
  label: string
  className: string
}

const statusConfigs: Record<StatusVariant, Record<string, StatusConfig>> = {
  contact: {
    unread: { label: 'Unread', className: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
    read: { label: 'Read', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    responded: { label: 'Responded', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  },
  complaint: {
    new: { label: 'New', className: 'bg-red-500/10 text-destructive border border-red-500/20' },
    in_progress: { label: 'In Progress', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    resolved: { label: 'Resolved', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    closed: { label: 'Closed', className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
  },
  inquiry: {
    new: { label: 'New', className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
    contacted: { label: 'Contacted', className: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' },
    qualified: { label: 'Qualified', className: 'bg-purple-500/10 text-purple-600 border border-purple-500/20' },
    converted: { label: 'Converted', className: 'bg-green-500/10 text-green-600 border border-green-500/20' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-600 border border-red-500/20' },
  },
  lead: {
    new: { label: 'New', className: 'bg-blue-500/10 text-blue-500' },
    contacted: { label: 'Contacted', className: 'bg-yellow-500/10 text-yellow-500' },
    qualified: { label: 'Qualified', className: 'bg-green-500/10 text-green-500' },
    lost: { label: 'Lost', className: 'bg-red-500/10 text-red-500' },
  },
  // Add other variants as needed
}

export function getStatusConfig(status: string, variant: StatusVariant): StatusConfig {
  const variantConfigs = statusConfigs[variant]
  return variantConfigs?.[status] || { label: status, className: 'bg-slate-500/10 text-slate-400' }
}

// Priority badge configs
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

const priorityConfigs: Record<Priority, StatusConfig> = {
  low: { label: 'Low', className: 'bg-blue-500/20 text-blue-500 border border-blue-500/30' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' },
  high: { label: 'High', className: 'bg-orange-500/20 text-orange-500 border border-orange-500/30' },
  urgent: { label: 'Urgent', className: 'bg-red-500/20 text-red-500 border border-red-500/30' },
}

export function getPriorityConfig(priority: Priority): StatusConfig {
  return priorityConfigs[priority] || priorityConfigs.medium
}
```

```typescript
// components/ui/status-badge.tsx
import { cn } from '@/lib/utils'
import { getStatusConfig, type StatusVariant } from '@/lib/utils/status-config'

interface StatusBadgeProps {
  status: string
  variant: StatusVariant
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, variant, className, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(status, variant)
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider',
        size === 'sm' && 'text-[10px] px-2 py-0.5',
        size === 'md' && 'text-xs px-3 py-1',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

```typescript
// components/ui/priority-badge.tsx
import { cn } from '@/lib/utils'
import { getPriorityConfig, type Priority } from '@/lib/utils/status-config'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)
  
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

**Files to Modify:**
- `app/admin/(dashboard)/contacts/page.tsx` - Replace status badge logic (2 places)
- `app/admin/(dashboard)/complaints/page.tsx` - Replace status badge logic (2 places)
- `app/admin/(dashboard)/inquiries/page.tsx` - Replace with `<StatusBadge>` component
- `app/admin/(dashboard)/crm/leads/page.tsx` - Replace status badge logic (2 places)
- `app/admin/(dashboard)/crm/leads/[id]/page.tsx` - Replace
- `app/contact/contact-client.tsx` - Replace
- All other pages with status badges (see analysis report)

**Verify:**
```bash
pnpm type-check
# Visit each admin page and verify badges render correctly
# Check complaints, inquiries, contacts, leads pages
```

---

### ✅ Step 3: Create API Route Wrapper for Common Patterns

**What:** Create a higher-order function that wraps API routes with common error handling, rate limiting, and validation.

**Files to Create:**
- `lib/api/route-wrapper.ts`

**Implementation:**

```typescript
// lib/api/route-wrapper.ts
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
import { RateLimiter } from '@/lib/utils/rate-limit'
import { verifyCaptcha } from '@/lib/utils/captcha'
import { apiError, apiSuccess } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { logError } from '@/lib/utils/error-handler'

interface RouteHandlerOptions<TBody = any, TParams = any> {
  rateLimit?: RateLimiter
  captchaAction?: string
  validationSchema?: ZodSchema<TBody>
  requireAuth?: boolean
  logContext?: string
}

type RouteHandler<TBody = any, TParams = any, TResult = any> = (
  request: NextRequest,
  context: {
    body?: TBody
    params?: TParams
    validated?: TBody
  }
) => Promise<NextResponse<TResult>>

/**
 * Wraps an API route handler with common middleware:
 * - Rate limiting
 * - CAPTCHA verification
 * - Request body validation
 * - Error handling
 * - Logging
 */
export function withApiHandler<TBody = any, TParams = any, TResult = any>(
  handler: RouteHandler<TBody, TParams, TResult>,
  options: RouteHandlerOptions<TBody, TParams> = {}
) {
  return async (request: NextRequest, context?: { params?: TParams }): Promise<NextResponse> => {
    const {
      rateLimit,
      captchaAction,
      validationSchema,
      logContext = request.url,
    } = options

    try {
      // 1. Apply rate limiting
      if (rateLimit) {
        const limited = await applyRateLimit(request, rateLimit)
        if (limited) return limited
      }

      // 2. Parse body if method is not GET
      let body: any
      let validated: TBody | undefined

      if (request.method !== 'GET') {
        body = await request.json()

        // 3. Validate with Zod schema
        if (validationSchema) {
          try {
            validated = validationSchema.parse(body)
          } catch (error) {
            if (error instanceof ZodError) {
              const firstError = error.errors[0]
              return NextResponse.json(
                apiError(
                  `Validation failed: ${firstError.path.join('.')}: ${firstError.message}`,
                  'VALIDATION_ERROR'
                ),
                { status: HTTP_STATUS.BAD_REQUEST }
              )
            }
            throw error
          }
        }

        // 4. Verify CAPTCHA
        if (captchaAction && body.captchaToken) {
          const captchaResult = await verifyCaptcha(body.captchaToken, captchaAction)
          if (!captchaResult.success) {
            return NextResponse.json(
              apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
              { status: HTTP_STATUS.FORBIDDEN }
            )
          }
        }
      }

      // 5. Call the actual handler
      return await handler(request, {
        body,
        validated,
        params: context?.params,
      })

    } catch (error) {
      // Centralized error handling
      logError(logContext, error)
      
      return NextResponse.json(
        apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  }
}

/**
 * Simplified wrapper for simple GET handlers
 */
export function withGetHandler<TResult = any>(
  handler: (request: NextRequest) => Promise<TResult>,
  options: Pick<RouteHandlerOptions, 'rateLimit' | 'logContext'> = {}
) {
  return withApiHandler<never, never, TResult>(
    async (request) => {
      const data = await handler(request)
      return NextResponse.json(apiSuccess(data))
    },
    options
  )
}
```

**Files to Modify (Convert to use wrapper):**
- `app/api/contacts/route.ts` - POST handler
- `app/api/inquiries/route.ts` - POST handler
- `app/api/complaints/route.ts` - POST handler
- `app/api/consultations/route.ts` - POST handler
- `app/api/newsletter/route.ts` - POST handler

**Example Refactored Route:**

```typescript
// app/api/contacts/route.ts (AFTER refactoring)
import { withApiHandler, withGetHandler } from '@/lib/api/route-wrapper'
import { contactFormRateLimit } from '@/lib/utils/rate-limit'
import { contactFormSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess } from '@/lib/types/api'
import { HTTP_STATUS } from '@/lib/constants'
import { sendEmail } from '@/lib/mail'

export const GET = withGetHandler(async (request) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
})

export const POST = withApiHandler(
  async (request, { validated }) => {
    const { email, name, message, company, subject, type } = validated!
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        email,
        name,
        message,
        company: company || null,
        subject: subject || null,
        type: type || 'contact',
        created_at: new Date().toISOString(),
      }])
      .select()
    
    if (error) throw error
    
    // Send admin notification
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Message: ${subject || 'No Subject'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      })
    }
    
    return NextResponse.json(apiSuccess(data), { status: HTTP_STATUS.CREATED })
  },
  {
    rateLimit: contactFormRateLimit,
    captchaAction: 'contact_form',
    validationSchema: contactFormSchema,
    logContext: 'POST /api/contacts',
  }
)
```

**Verify:**
```bash
pnpm type-check
# Test each refactored API endpoint
curl -X POST http://localhost:3000/api/contacts -H "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test","message":"Test message"}'
```

---

## Phase 2: Shared Components (Priority 2)

### ✅ Step 4: Create Stats Card Components

**What:** Extract repeated stats grid patterns into reusable components.

**Files to Create:**
- `components/admin/stats-card.tsx`
- `components/admin/stats-grid.tsx`

**Implementation:**

```typescript
// components/admin/stats-card.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number
  color?: string
  borderColor?: string
  icon?: LucideIcon
  className?: string
}

export function StatsCard({
  label,
  value,
  color = 'text-blue-500',
  borderColor = 'border-blue-900/30',
  icon: Icon,
  className
}: StatsCardProps) {
  return (
    <div className={cn('bg-card border rounded-xl p-4', borderColor, className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-2xl font-bold', color)}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            {label}
          </p>
        </div>
        {Icon && <Icon className={cn('h-8 w-8', color)} />}
      </div>
    </div>
  )
}
```

```typescript
// components/admin/stats-grid.tsx
import { LucideIcon } from 'lucide-react'
import { StatsCard } from './stats-card'

export interface StatItem {
  label: string
  value: number
  color?: string
  borderColor?: string
  icon?: LucideIcon
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 5
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <StatsCard key={`${stat.label}-${index}`} {...stat} />
      ))}
    </div>
  )
}
```

**Files to Modify:**
- `app/admin/(dashboard)/contacts/page.tsx` - Replace stats grid JSX
- `app/admin/(dashboard)/inquiries/page.tsx` - Replace stats grid JSX
- `app/admin/(dashboard)/complaints/page.tsx` - Replace stats grid JSX
- `app/admin/(dashboard)/consultations/page.tsx` - Replace stats grid JSX
- `app/admin/(dashboard)/partnerships/page.tsx` - Replace stats grid JSX

**Example Usage:**

```typescript
// app/admin/(dashboard)/contacts/page.tsx (stats section AFTER)
import { StatsGrid } from '@/components/admin/stats-grid'

const statusStats: StatItem[] = [
  {
    label: 'Unread',
    value: statusCounts.unread,
    color: 'text-blue-400',
    borderColor: 'border-blue-900/30',
  },
  {
    label: 'Read',
    value: statusCounts.read,
    color: 'text-amber-400',
    borderColor: 'border-amber-900/30',
  },
  {
    label: 'Responded',
    value: statusCounts.responded,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-900/30',
  },
]

// In JSX:
<StatsGrid stats={statusStats} columns={3} />
```

**Verify:**
```bash
pnpm type-check
# Visit admin pages and verify stats grids render correctly
```

---

### ✅ Step 5: Create Realtime Subscription Hook

**What:** Extract repeated realtime subscription logic into a custom React hook.

**Files to Create:**
- `hooks/use-realtime-subscription.ts`

**Implementation:**

```typescript
// hooks/use-realtime-subscription.ts
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeSubscriptionOptions<T> {
  table: string
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (record: T) => void
  filter?: string
  enabled?: boolean
}

/**
 * Custom hook to subscribe to Supabase realtime changes
 * Automatically handles cleanup on unmount
 */
export function useRealtimeSubscription<T = any>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    let channel: RealtimeChannel

    const subscribe = () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            ...(filter && { filter }),
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && onInsert) {
              onInsert(payload.new as T)
            } else if (payload.eventType === 'UPDATE' && onUpdate) {
              onUpdate(payload.new as T)
            } else if (payload.eventType === 'DELETE' && onDelete) {
              onDelete(payload.old as T)
            }
          }
        )
        .subscribe()
    }

    subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter, enabled, onInsert, onUpdate, onDelete])
}

/**
 * Simplified hook for list state management with realtime updates
 */
export function useRealtimeList<T extends { id: number | string }>(
  table: string,
  initialData: T[] = []
) {
  const [items, setItems] = React.useState<T[]>(initialData)

  useRealtimeSubscription<T>({
    table,
    onInsert: (record) => {
      setItems((prev) => [record, ...prev])
    },
    onUpdate: (record) => {
      setItems((prev) =>
        prev.map((item) => (item.id === record.id ? record : item))
      )
    },
    onDelete: (record) => {
      setItems((prev) => prev.filter((item) => item.id !== record.id))
    },
  })

  return { items, setItems }
}
```

**Files to Modify:**
- `app/admin/(dashboard)/contacts/page.tsx` - Replace realtime subscription
- `app/admin/(dashboard)/inquiries/page.tsx` - Replace realtime subscription

**Example Usage:**

```typescript
// app/admin/(dashboard)/contacts/page.tsx (AFTER)
import { useRealtimeList } from '@/hooks/use-realtime-subscription'

export default function AdminContactsPage() {
  const [initialContacts, setInitialContacts] = useState<Contact[]>([])
  const { items: contacts, setItems: setContacts } = useRealtimeList<Contact>(
    'contacts',
    initialContacts
  )

  useEffect(() => {
    async function fetchContacts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setInitialContacts(data)
        setContacts(data)
      }
    }
    fetchContacts()
  }, [])

  // ... rest of component
}
```

**Verify:**
```bash
pnpm type-check
# Test realtime updates by submitting a contact form in another tab
```

---

## Phase 3: Advanced Components (Priority 2-3)

### ✅ Step 6: Create Admin Data Table Component

**What:** Create a comprehensive data table component that handles desktop table view + mobile card view, eliminating the largest source of duplication.

**Files to Create:**
- `components/admin/data-table.tsx`
- `components/admin/data-table-mobile-card.tsx`
- `types/admin-table.ts`

**Note:** This is a large component. Start with a minimal version and expand.

**Implementation (Simplified):**

```typescript
// types/admin-table.ts
import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  width?: string // e.g., '2fr', '100px', 'minmax(180px, 1.8fr)'
  hideOnMobile?: boolean
  render?: (item: T) => ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  mobileCardRenderer?: (item: T) => ReactNode
  emptyMessage?: string
  emptyIcon?: ReactNode
  loading?: boolean
}
```

```typescript
// components/admin/data-table.tsx
import { ReactNode } from 'react'
import type { Column, DataTableProps } from '@/types/admin-table'

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  mobileCardRenderer,
  emptyMessage = 'No items found',
  emptyIcon,
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        {emptyIcon}
        <p className="font-semibold mt-2">{emptyMessage}</p>
      </div>
    )
  }

  // Calculate grid columns for desktop
  const gridCols = columns.map(col => col.width || '1fr').join(' ')

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      {/* Desktop Table Header */}
      <div 
        className="hidden lg:grid bg-background/60 border-b border-border px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider gap-4"
        style={{ gridTemplateColumns: gridCols }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.label}</span>
        ))}
      </div>

      {/* Table Body */}
      <div>
        {data.map((item) => (
          <div key={item.id}>
            {/* Desktop Row */}
            <div 
              className="hidden lg:grid items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors gap-4"
              style={{ gridTemplateColumns: gridCols }}
            >
              {columns.map((col) => (
                <div key={col.key} className="min-w-0">
                  {col.render ? col.render(item) : String(item[col.key as keyof T] || '—')}
                </div>
              ))}
            </div>

            {/* Mobile Card */}
            {mobileCardRenderer && (
              <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
                {mobileCardRenderer(item)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Files to Modify (Convert one by one):**
- `app/admin/(dashboard)/contacts/page.tsx`
- `app/admin/(dashboard)/inquiries/page.tsx`
- `app/admin/(dashboard)/complaints/page.tsx`

**Example Usage:**

```typescript
// app/admin/(dashboard)/contacts/page.tsx (table section AFTER)
import { DataTable } from '@/components/admin/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { User, Building, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

const columns: Column<Contact>[] = [
  {
    key: 'contact',
    label: 'Contact',
    width: '2fr',
    render: (contact) => (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="font-semibold text-foreground text-sm">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.email}</p>
          {contact.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3" />
              {contact.company}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'subject',
    label: 'Subject',
    width: '2fr',
    render: (contact) => (
      <div>
        <p className="font-medium text-foreground text-sm">{contact.subject}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{contact.message}</p>
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    width: '100px',
    render: (contact) =>
      contact.type ? (
        <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full capitalize">
          {contact.type}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    key: 'status',
    label: 'Status',
    width: '90px',
    render: (contact) => <StatusBadge status={contact.status} variant="contact" />,
  },
  {
    key: 'created_at',
    label: 'Date',
    width: '120px',
    render: (contact) => (
      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        {new Date(contact.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    width: '80px',
    render: (contact) => (
      <Link
        href={`/admin/contacts/${contact.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </Link>
    ),
  },
]

// In JSX:
<DataTable
  data={contacts}
  columns={columns}
  loading={loading}
  emptyMessage="No contact messages yet"
  emptyIcon={<Mail className="w-8 h-8 mx-auto mb-2 text-slate-700" />}
  mobileCardRenderer={(contact) => (
    <div className="space-y-3">
      {/* Mobile card layout */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="font-semibold text-foreground text-sm">{contact.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{contact.email}</p>
          {contact.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3" />
              {contact.company}
            </p>
          )}
        </div>
      </div>
      
      <div>
        <p className="font-medium text-foreground text-sm">{contact.subject}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.message}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {contact.type && (
          <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-full capitalize">
            {contact.type}
          </span>
        )}
        <StatusBadge status={contact.status} variant="contact" />
        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(contact.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Link
          href={`/admin/contacts/${contact.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Link>
      </div>
    </div>
  )}
/>
```

**Verify:**
```bash
pnpm type-check
# Visit admin pages and verify tables render on both desktop and mobile viewport
```

**Note:** This step is large. Convert one page at a time, test, commit, then move to the next.

---

## Phase 4: Validation & Cleanup (Priority 3)

### ✅ Step 7: Complete Validation Schema Coverage

**What:** Add missing validation schemas and update existing ones to match current forms.

**Files to Modify:**
- `lib/utils/validation.ts`

**Add Missing Schemas:**

```typescript
// lib/utils/validation.ts (ADD)

// Partnership submission
export const partnershipSchema = z.object({
  companyName: z.string().min(2).max(200),
  contactPerson: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().min(10).max(20),
  website: z.string().url().optional().or(z.literal('')),
  partnershipType: z.enum(['reseller', 'technology', 'referral', 'strategic', 'other']),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  industry: z.string().min(2).max(100),
  servicesOffered: z.string().min(10).max(1000),
  message: z.string().min(20).max(5000),
  agreementDocumentUrl: z.string().url(),
  nocDocumentUrl: z.string().url(),
  proposalDocumentUrl: z.string().url(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Terms and conditions must be accepted'
  }),
  termsAcceptedAt: z.string().datetime(),
})

// Update serviceInquirySchema to match actual client_inquiries table
export const serviceInquirySchemaV2 = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  service_type: z.string().min(1).max(100), // This is now project_types[0]
  project_description: z.string().max(5000).optional(),
  timeline: z.string().max(50).optional(),
  budget: z.string().max(50).optional(), // Maps to budget_range
  captchaToken: z.string(),
})
```

**Files to Modify:**
- `app/api/partnerships/route.ts` - Use `partnershipSchema` instead of manual validation
- `app/api/inquiries/route.ts` - Consider using `serviceInquirySchemaV2`

**Verify:**
```bash
pnpm type-check
# Test partnership and inquiry form submissions
```

---

### ✅ Step 8: Extract Email Validation Utility

**What:** Remove duplicate email regex checks, use Zod email schema everywhere.

**Files to Modify:**
- `app/api/complaints/status/route.ts` - Replace manual regex with `emailSchema.safeParse()`
- `app/api/inquiries/status/route.ts` - Same

**Example:**

```typescript
// app/api/complaints/status/route.ts (BEFORE)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
}

// app/api/complaints/status/route.ts (AFTER)
import { emailSchema } from '@/lib/utils/validation'

const emailValidation = emailSchema.safeParse(email)
if (!emailValidation.success) {
  return NextResponse.json(
    apiError('Invalid email format', 'VALIDATION_ERROR'),
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}
```

**Verify:**
```bash
pnpm type-check
# Test status check endpoints with invalid emails
```

---

### ✅ Step 9: Create Admin Notification Utility

**What:** Centralize admin notification sending logic (email + in-app).

**Files to Create:**
- `lib/utils/send-admin-notification.ts` (already exists - verify and enhance)

**Files to Modify:**
- `app/api/contacts/route.ts` - Use centralized notification
- Other form submission routes

**Verify:** Already implemented. Review existing file and ensure consistency.

---

## Phase 5: Update API Routes (Priority 3)

### ✅ Step 10: Refactor All Form Submission API Routes

**What:** Apply the `withApiHandler` wrapper to all remaining form submission routes.

**Files to Modify:**
- `app/api/complaints/route.ts` - POST
- `app/api/consultations/route.ts` - POST
- `app/api/partnerships/route.ts` - POST
- `app/api/job-application/route.ts` - POST
- `app/api/schedule/route.ts` - POST

**Pattern:** Follow the example from Step 3.

**Verify:**
```bash
pnpm type-check
pnpm build
# Test each endpoint with curl or Postman
```

---

### ✅ Step 11: Refactor All GET List API Routes

**What:** Use `withGetHandler` or standardize GET patterns.

**Files to Modify:**
- `app/api/contacts/route.ts` - GET
- `app/api/inquiries/route.ts` - GET
- `app/api/complaints/route.ts` - GET
- `app/api/consultations/route.ts` - GET
- `app/api/newsletter/route.ts` - GET
- `app/api/partnerships/route.ts` - GET

**Verify:**
```bash
pnpm type-check
# Test GET endpoints
```

---

## Phase 6: Final Admin Pages (Priority 3)

### ✅ Step 12: Convert Remaining Admin List Pages to DataTable

**What:** Convert all remaining admin list pages to use the new `<DataTable>` component.

**Files to Modify:**
- `app/admin/(dashboard)/consultations/page.tsx`
- `app/admin/(dashboard)/partnerships/page.tsx`
- `app/admin/(dashboard)/subscribers/page.tsx`
- `app/admin/(dashboard)/team/page.tsx`
- `app/admin/(dashboard)/projects/page.tsx`
- `app/admin/(dashboard)/services/page.tsx`
- `app/admin/(dashboard)/testimonials/page.tsx`
- `app/admin/(dashboard)/jobs/page.tsx`

**Note:** Do these one at a time. Each requires defining columns and mobile card renderer.

**Verify After Each:**
```bash
pnpm type-check
# Visit the page and test desktop + mobile view
```

---

## Phase 7: Final Verification (Priority 4)

### ✅ Step 13: Update serviceInquirySchema Mapping

**What:** Align validation schema with actual database fields in client_inquiries table.

**Files to Modify:**
- `lib/utils/validation.ts` - Update or replace `serviceInquirySchema`
- `app/api/inquiries/route.ts` - Use updated schema

**Verify:**
```bash
pnpm type-check
# Submit an inquiry form and verify all fields are saved
```

---

### ✅ Step 14: Full Build and Test

**What:** Run complete build and comprehensive testing.

**Steps:**
1. Type check: `pnpm type-check`
2. Lint: `pnpm lint`
3. Build: `pnpm build`
4. Manual testing checklist:
   - [ ] Submit contact form
   - [ ] Submit inquiry form
   - [ ] Submit complaint form
   - [ ] Subscribe to newsletter
   - [ ] View each admin list page (contacts, inquiries, complaints, etc.)
   - [ ] Test realtime updates
   - [ ] Test rate limiting (submit multiple times)
   - [ ] Test CAPTCHA verification
   - [ ] Test mobile responsive views
   - [ ] Verify status badges render correctly
   - [ ] Verify stats grids show correct counts

**Verify:**
```bash
pnpm type-check
pnpm lint
pnpm build
pnpm start
# Comprehensive manual testing
```

---

### ✅ Step 15: Documentation and Commit

**What:** Document the changes and create a clean git history.

**Tasks:**
1. Update README if needed
2. Create/update CHANGELOG.md
3. Review all changes with `git diff`
4. Stage changes strategically: `git add <file>`
5. Commit with descriptive message:

```bash
git commit -m "refactor: eliminate duplicate API route patterns

- Create unified API client factory (lib/supabase/api-client.ts)
- Create withApiHandler wrapper for common patterns
- Extract error handling, rate limiting, validation
- Reduces boilerplate by ~225 lines"

git commit -m "refactor: extract status badge components

- Create StatusBadge and PriorityBadge components
- Create status-config utility with centralized configs
- Replace 120+ lines of inline ternary logic
- Update all admin pages to use new components"

git commit -m "refactor: create reusable admin components

- Create DataTable component for list pages
- Create StatsGrid and StatsCard components
- Create useRealtimeSubscription hook
- Reduces admin page duplication by ~2400 lines"

git commit -m "refactor: standardize validation and API routes

- Complete validation schema coverage
- Refactor all form submission routes
- Standardize GET endpoint patterns
- Remove duplicate email validation"
```

6. Push to remote: `git push origin refactor/eliminate-duplicates`
7. Create Pull Request with summary of changes

**Verify:**
```bash
git status
git log --oneline
# Review PR on GitHub
```

---

## Post-Implementation Checklist

- [ ] All type checks pass
- [ ] All lints pass
- [ ] Production build succeeds
- [ ] All API routes tested
- [ ] All admin pages render correctly
- [ ] Realtime updates work
- [ ] Mobile views verified
- [ ] Documentation updated
- [ ] Changes committed with clear messages
- [ ] Pull request created and reviewed

---

## Estimated Impact

### Lines of Code Removed/Refactored
- API route duplication: **~450 lines**
- Admin page duplication: **~2,600 lines**
- Component duplication: **~300 lines**
- **Total: ~3,350 lines eliminated or refactored**

### Maintenance Benefits
- Single source of truth for API patterns
- Consistent error handling across all routes
- Reusable admin components
- Easier to update status/priority styles globally
- Simplified testing (test component once, not 20 pages)
- Reduced onboarding time for new developers

### Files Created
- 10+ new utility/component files

### Files Modified
- 40+ API routes and admin pages

### Estimated Time
- Phase 1-2: 6-8 hours
- Phase 3-4: 4-6 hours
- Phase 5-6: 8-10 hours
- Phase 7: 2-3 hours
- **Total: 20-27 hours**

---

## Notes

- Commit frequently after each major step
- Test after each phase before moving to the next
- If a step breaks something, revert and analyze before proceeding
- Keep the dev server running to catch errors early
- Use `git stash` if you need to switch contexts mid-refactoring
