# Code Refactoring Analysis Report
**Project:** Asrivo Tech Website  
**Date:** 2025  
**Analyzed by:** Planning Agent

## Executive Summary

This analysis identified **7 major categories** of duplicate logic and repeated patterns across the Asrivo Tech Next.js application, affecting **37+ API routes, 60+ admin pages, and numerous components**. The codebase exhibits significant violations of the DRY (Don't Repeat Yourself) principle that lead to maintenance overhead, inconsistent error handling, and code bloat.

**Total Estimated LOC to Eliminate:** 2,000+ lines  
**Severity:** HIGH  
**Impact on Maintenance:** CRITICAL

---

## 1. API Route Patterns - CRITICAL

### 1.1 Duplicate Supabase Client Creation ⚠️ HIGH SEVERITY

**Problem:** Multiple inconsistent patterns for creating Supabase clients across 37 API routes.

**Patterns Found:**
- `createClient()` from `@/lib/supabase/server` (correct - server routes)
- `createClient()` from `@/lib/supabase/client` (incorrect usage in API routes)
- `createClient(URL, KEY)` direct from `@supabase/supabase-js` (bypasses wrapper)

**Affected Files (Sample):**
- `app/api/complaints/route.ts` - Uses direct `createSupabaseClient(URL, ANON_KEY)`
- `app/api/consultations/route.ts` - Mixes both `createClient` from supabase-js AND server
- `app/api/partnerships/route.ts` - Uses direct instantiation
- `app/api/complaints/status/route.ts` - Direct instantiation
- `app/api/contacts/route.ts` - Correct usage (server)
- `app/api/inquiries/route.ts` - Correct usage (server)

**Issues:**
1. Inconsistent client initialization
2. Some routes use anon client directly (security risk for admin operations)
3. No centralized place to change client configuration
4. Bypasses SSR cookie handling in some routes

**Recommendation:** Create `lib/supabase/api-client.ts` factory function for API routes.

---

### 1.2 Duplicate Error Handling Pattern ⚠️ HIGH SEVERITY

**Problem:** Every API route repeats the same try-catch-ZodError pattern with minor variations.

**Repeated Code (seen in 15+ files):**
```typescript
try {
  const body = await request.json()
  const validatedData = schema.parse(body)
  // ... business logic
} catch (error) {
  if (error instanceof ZodError) {
    const firstError = error.errors[0]
    return NextResponse.json(
      apiError(`Validation failed: ${firstError.path.join('.')}: ${firstError.message}`, 'VALIDATION_ERROR'),
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }
  logError('POST /api/...', error, { email, name })
  return NextResponse.json(
    apiError('An error occurred processing your request', 'INTERNAL_SERVER_ERROR'),
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  )
}
```

**Affected Files:**
- `app/api/contacts/route.ts`
- `app/api/inquiries/route.ts`
- `app/api/complaints/route.ts`
- `app/api/consultations/route.ts`
- `app/api/newsletter/route.ts`
- `app/api/partnerships/route.ts`
- And 10+ more...

**Lines Duplicated:** ~15 lines × 15 files = **225 lines**

---

### 1.3 Duplicate Rate Limiting Application ⚠️ MEDIUM SEVERITY

**Problem:** Every API route that needs rate limiting repeats the same 2-3 line pattern.

**Repeated Code:**
```typescript
const limited = await applyRateLimit(request, someRateLimit)
if (limited) return limited
```

**Affected Files:** 15+ API routes

**Lines Duplicated:** ~3 lines × 15 files = **45 lines**

**Note:** While `applyRateLimit` is already centralized, it's still boilerplate that could be eliminated with middleware or a route wrapper.

---

### 1.4 Duplicate CAPTCHA Verification ⚠️ MEDIUM SEVERITY

**Problem:** CAPTCHA verification logic repeated across public-facing forms.

**Repeated Code:**
```typescript
const captchaResult = await verifyCaptcha(captchaToken, 'action_name')
if (!captchaResult.success) {
  return NextResponse.json(
    apiError('Security verification failed. Please try again.', 'CAPTCHA_FAILED'),
    { status: HTTP_STATUS.FORBIDDEN }
  )
}
```

**Affected Files:**
- `app/api/contacts/route.ts`
- `app/api/inquiries/route.ts`
- `app/api/newsletter/route.ts`
- `app/api/consultations/route.ts` (TODO comment - not implemented!)

**Lines Duplicated:** ~7 lines × 4 files = **28 lines**

---

### 1.5 Duplicate Email Validation ⚠️ LOW SEVERITY

**Problem:** Manual email regex validation repeated in some status routes.

**Repeated Code:**
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  )
}
```

**Affected Files:**
- `app/api/complaints/status/route.ts`
- `app/api/inquiries/status/route.ts`

**Note:** Already have Zod email validation in `lib/utils/validation.ts`, should use that instead.

---

### 1.6 Duplicate GET Request Pattern ⚠️ MEDIUM SEVERITY

**Problem:** Simple GET-all-records pattern repeated across multiple routes with slight variations.

**Repeated Code:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

**Affected Files:**
- `app/api/contacts/route.ts`
- `app/api/inquiries/route.ts`
- `app/api/complaints/route.ts`
- `app/api/consultations/route.ts`
- `app/api/newsletter/route.ts`
- `app/api/partnerships/route.ts`

**Lines Duplicated:** ~20 lines × 6 files = **120 lines**

---

### 1.7 Duplicate Admin Notification Logic ⚠️ LOW SEVERITY

**Problem:** Sending admin notifications repeated with similar patterns.

**Seen in:**
- `app/api/contacts/route.ts` - Sends both notification via API and email

**Lines Duplicated:** ~30 lines per implementation

---

## 2. Admin Page Patterns - HIGH

### 2.1 Duplicate Stats Grid Rendering ⚠️ HIGH SEVERITY

**Problem:** Every admin list page (contacts, inquiries, complaints, consultations, etc.) has nearly identical stats grid JSX with status/priority counts.

**Repeated Pattern:**
```tsx
const statusCounts = {
  new: items.filter(i => i.status === 'new').length,
  // ... more statuses
}

// Then JSX grid:
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-card border border-{color}-900/30 rounded-xl p-4">
    <p className="text-2xl font-bold text-{color}">{statusCounts.new}</p>
    <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">New</p>
  </div>
  // ... repeat for each status
</div>
```

**Affected Files:**
- `app/admin/(dashboard)/contacts/page.tsx`
- `app/admin/(dashboard)/inquiries/page.tsx`
- `app/admin/(dashboard)/complaints/page.tsx`
- `app/admin/(dashboard)/consultations/page.tsx`
- `app/admin/(dashboard)/partnerships/page.tsx`
- `app/admin/(dashboard)/subscribers/page.tsx`

**Lines Duplicated:** ~40 lines × 6 files = **240 lines**

---

### 2.2 Duplicate Status Badge Logic ⚠️ CRITICAL SEVERITY

**Problem:** Status badge CSS classes computed inline with repeated ternary chains in EVERY admin page.

**Repeated Pattern:**
```tsx
<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
  item.status === 'new' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
  item.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
  item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
}`}>
  {item.status}
</span>
```

**Affected Files (Found in):**
- `app/admin/(dashboard)/contacts/page.tsx` (2 instances - desktop + mobile)
- `app/admin/(dashboard)/complaints/page.tsx` (2 instances - desktop + mobile)
- `app/admin/(dashboard)/inquiries/page.tsx` (defines config but still repeats)
- `app/admin/(dashboard)/crm/leads/page.tsx` (2 instances)
- `app/admin/(dashboard)/crm/leads/[id]/page.tsx`
- `app/contact/contact-client.tsx`
- And many more...

**Lines Duplicated:** ~6 lines × 20+ locations = **120+ lines**

**Note:** `inquiries/page.tsx` has a `getStatusConfig()` helper that returns badge config - this pattern should be extracted and reused everywhere.

---

### 2.3 Duplicate Table/List Structure ⚠️ HIGH SEVERITY

**Problem:** Nearly identical desktop table + mobile card layout structure repeated across all admin list pages.

**Pattern:**
- Hidden table header on mobile
- Grid with specific column widths
- Desktop row with icons and data
- Mobile card view with same data differently laid out
- Realtime subscription boilerplate

**Affected Files:** All admin list pages (contacts, inquiries, complaints, consultations, partnerships, subscribers, jobs, team, projects, services, testimonials)

**Lines Duplicated:** ~200 lines × 12 files = **2,400 lines** (Largest duplication!)

**Components Needed:**
- `<AdminDataTable>` - Handles desktop table + mobile cards
- `<StatsGrid>` - Status/priority counts display
- `<RealtimeProvider>` - Wraps realtime subscription logic

---

### 2.4 Duplicate Realtime Subscription Logic ⚠️ MEDIUM SEVERITY

**Problem:** Supabase realtime subscription setup repeated in every client component list page.

**Repeated Pattern:**
```tsx
useEffect(() => {
  const fetchData = async () => { /* ... */ }
  fetchData()

  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name',
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        setItems(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item))
      } else if (payload.eventType === 'DELETE') {
        setItems(prev => prev.filter(item => item.id !== payload.old.id))
      }
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

**Affected Files:**
- `app/admin/(dashboard)/contacts/page.tsx`
- `app/admin/(dashboard)/inquiries/page.tsx`
- And more...

**Lines Duplicated:** ~40 lines × 5+ files = **200 lines**

---

## 3. Validation Schemas - MEDIUM

### 3.1 Missing Validation Schemas ⚠️ MEDIUM SEVERITY

**Problem:** Some routes have validation, others don't. Incomplete schema coverage.

**Files with Validation:**
- `lib/utils/validation.ts` - Has schemas for: contact, serviceInquiry, newsletter, consultation, schedule, complaint, jobApplication

**Files Missing Schemas:**
- Partnership submission (has manual validation in `app/api/partnerships/route.ts`)
- Various CRM operations
- Admin settings updates

**Impact:** Inconsistent input validation, potential security gaps.

---

### 3.2 Overlapping Validation ⚠️ LOW SEVERITY

**Problem:** `serviceInquirySchema` in validation.ts doesn't match the actual inquiry form fields.

**Schema Fields:** `email, name, company, phone, service, budget, timeline, message`  
**Actual DB Fields:** `email, name, company, phone, project_types, project_description, budget_range, timeline, and 10+ more fields`

**Impact:** Schema is outdated and doesn't reflect current inquiry form.

---

## 4. Utility Functions - LOW

### 4.1 Well-Structured Utilities ✅

**Good Practices Found:**
- `lib/utils/error-handler.ts` - Comprehensive error handling utilities
- `lib/utils/apply-rate-limit.ts` - Clean rate limit wrapper
- `lib/types/api.ts` - Standardized API response types
- `lib/constants.ts` - Centralized constants

**Note:** These are well-done and should be the model for other refactoring.

---

## 5. Component Duplication - MEDIUM

### 5.1 Missing Shared Components ⚠️ MEDIUM SEVERITY

**Needed Components:**

1. **`<StatusBadge>`** - Renders status with appropriate colors
   - Props: `status: string, variant: 'complaint' | 'inquiry' | 'lead' | 'deal'`
   - Eliminates 120+ lines of ternary chains

2. **`<PriorityBadge>`** - Renders priority indicators
   - Props: `priority: 'low' | 'medium' | 'high' | 'urgent'`

3. **`<StatsCard>`** - Single stat card with count and label
   - Props: `label, value, color, icon?`

4. **`<StatsGrid>`** - Grid of stat cards
   - Props: `stats: Array<{label, value, color, icon}>`

5. **`<DataTableLayout>`** - Responsive table wrapper
   - Handles desktop table + mobile card views
   - Props: `columns, data, mobileCardRenderer, actions`

6. **`<RealtimeList>`** - Hook or component for realtime subscriptions
   - Props: `tableName, onInsert, onUpdate, onDelete`

---

## 6. Database Operations - LOW

### 6.1 CRM Actions Are Well-Structured ✅

**Good Practices Found:**
- `lib/supabase/crm-actions.ts` - All CRM operations centralized
- `lib/supabase/content-actions.ts` - Content CRUD operations
- `lib/supabase/admin-actions.ts` - Admin operations

**Note:** These show good separation of concerns. API routes should follow this pattern.

---

## 7. React Duplicate Key Issue - FIXED ✅

### 7.1 About Page Milestone Keys

**Status:** ALREADY FIXED  
**File:** `app/about/about-content.tsx` line 227

**Current Code:**
```tsx
.map((milestone, index) => (
  <div key={`${milestone.year}-${index}`} ...>
```

**Analysis:** The key now uses both `year` and `index`, which ensures uniqueness even when multiple milestones share the same year. **No action needed.**

---

## Summary of Findings

### By Severity

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 2 | Supabase client inconsistency, Status badge duplication |
| HIGH | 4 | API error handling, Table structure duplication, Stats grids, GET patterns |
| MEDIUM | 5 | Rate limiting boilerplate, Realtime subscriptions, CAPTCHA duplication, Missing validations, Missing components |
| LOW | 3 | Email validation, Admin notifications, Validation overlaps |
| FIXED | 1 | React duplicate key warning |

### Duplication Impact

| Category | Duplicated LOC | Files Affected |
|----------|---------------|----------------|
| Admin Table Layouts | ~2,400 | 12+ |
| API Error Handling | ~225 | 15+ |
| Stats Grids | ~240 | 6 |
| Realtime Subscriptions | ~200 | 5+ |
| GET Request Patterns | ~120 | 6 |
| Status Badge Logic | ~120+ | 20+ |
| Rate Limit Boilerplate | ~45 | 15+ |
| CAPTCHA Checks | ~28 | 4 |
| **TOTAL** | **~3,378** | **60+** |

---

## Recommendations

### Priority 1 (CRITICAL - Do First)
1. Create unified Supabase client factory for API routes
2. Create `<StatusBadge>` and `<PriorityBadge>` components
3. Extract `getStatusConfig()` utility from inquiries page

### Priority 2 (HIGH - Core Refactoring)
4. Create API route wrapper/middleware for common patterns
5. Create `<AdminDataTable>` component for list pages
6. Create `<StatsGrid>` component
7. Standardize all GET request handlers

### Priority 3 (MEDIUM - Cleanup)
8. Create `useRealtimeSubscription` hook
9. Complete validation schema coverage
10. Extract CAPTCHA middleware

### Priority 4 (LOW - Polish)
11. Consolidate email validation
12. Standardize admin notification sending
13. Update serviceInquirySchema to match actual fields

---

## Next Steps

See `plan.md` for the detailed, ordered implementation plan.
