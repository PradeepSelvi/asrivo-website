# Apply Mobile Responsive Pattern to Admin Pages

## Goal
Apply the same mobile-responsive card view pattern from the projects page to:
- ✅ Projects (already done)
- ⏳ Inquiries
- ⏳ Contacts
- ⏳ Job Applications
- ⏳ Partnerships
- ⏳ Complaints
- ⏳ Subscribers

---

## Pattern Overview

The projects page uses a **dual-view approach**:

### Desktop View (lg: and above)
- Traditional table layout with multiple columns
- Horizontal grid layout
- All information visible at once

### Mobile View (< 1024px)
- Card-based layout
- Stacked information vertically
- Touch-friendly buttons
- All content fits within viewport width

---

## Implementation Template

For each page, follow this pattern:

### Step 1: Wrap Table Header
```tsx
{/* Desktop Header - Hidden on mobile */}
<div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[...] px-6 py-4 ...">
  <span>Column 1</span>
  <span>Column 2</span>
  {/* ... */}
</div>
```

### Step 2: Duplicate Row Content

```tsx
{items.map((item) => (
  <>
    {/* Desktop View */}
    <div className="hidden lg:grid grid-cols-[...] items-center px-6 py-4 ...">
      {/* Desktop table row content */}
    </div>

    {/* Mobile Card View */}
    <div className="lg:hidden p-4 border-b border-border/50 space-y-3">
      {/* Mobile card content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
        </div>
      </div>
      
      {/* Action buttons as full-width */}
      <div className="flex items-center gap-2 pt-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg ...">
          View
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg ...">
          Edit
        </button>
      </div>
    </div>
  </>
))}
```

---

## Pages to Update

### 1. **Inquiries Page**
**File:** `app/admin/(dashboard)/inquiries/page.tsx`

**Data to show:**
- Name
- Email
- Service
- Date
- Status
- Actions (View, Update Status)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ John Doe                     │
│ john@example.com             │
│ [Web Development] [Pending]  │
│ [View Details] [Update]      │
└──────────────────────────────┘
```

### 2. **Contacts Page**
**File:** `app/admin/(dashboard)/contacts/page.tsx`

**Data to show:**
- Name
- Email
- Phone
- Message preview
- Date
- Actions (View, Mark as Read)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ Jane Smith                   │
│ jane@example.com • +1234567  │
│ Message preview text...      │
│ [View] [Mark Read]           │
└──────────────────────────────┘
```

### 3. **Job Applications**
**File:** `app/admin/(dashboard)/applications/page.tsx`

**Data to show:**
- Candidate name
- Position applied
- Email
- Resume (download link)
- Date
- Status
- Actions (View, Update Status)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ Mike Johnson                 │
│ Senior Developer             │
│ mike@example.com             │
│ [View] [Download] [Update]   │
└──────────────────────────────┘
```

### 4. **Partnerships**
**File:** `app/admin/(dashboard)/partnerships/page.tsx`

**Data to show:**
- Company name
- Contact person
- Email
- Partnership type
- Status
- Actions (View, Update)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ Acme Corp                    │
│ Sarah Lee • sarah@acme.com   │
│ [Strategic] [Pending]        │
│ [View Details] [Update]      │
└──────────────────────────────┘
```

### 5. **Complaints**
**File:** `app/admin/(dashboard)/complaints/page.tsx`

**Data to show:**
- Complaint ID
- Name
- Email
- Category
- Status
- Priority
- Date
- Actions (View, Resolve)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ #C001 - Tom Wilson           │
│ tom@example.com              │
│ [Billing] [High] [Open]      │
│ [View] [Resolve]             │
└──────────────────────────────┘
```

### 6. **Subscribers**
**File:** `app/admin/(dashboard)/subscribers/page.tsx`

**Data to show:**
- Email
- Subscription date
- Status
- Actions (Remove)

**Mobile card layout:**
```
┌──────────────────────────────┐
│ subscriber@example.com       │
│ Subscribed: Jan 15, 2024     │
│ [Active]                     │
│ [Remove]                     │
└──────────────────────────────┘
```

---

## Key CSS Classes for Mobile

### Container
```tsx
className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
```

### Hide on Mobile
```tsx
className="hidden lg:grid ..."
```

### Show only on Mobile
```tsx
className="lg:hidden ..."
```

### Mobile Card
```tsx
className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3"
```

### Mobile Buttons
```tsx
className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
```

---

## Benefits

1. **Better UX on Mobile**
   - No horizontal scrolling
   - Touch-friendly buttons
   - Easy to read card layout

2. **Maintains Desktop Experience**
   - Table view unchanged on desktop
   - All columns visible
   - Familiar interface

3. **Consistent Design**
   - Same pattern across all pages
   - Easy to maintain
   - Professional look

---

## Next Steps

To implement this for all pages:

1. Start with one page (e.g., Contacts)
2. Read the existing page file
3. Apply the dual-view pattern
4. Test on mobile and desktop
5. Repeat for other pages

Each page will need its own customization based on the data it displays, but the pattern remains the same.

---

## Status

- ✅ Projects - Complete
- ⏳ Inquiries - Pending
- ⏳ Contacts - Pending
- ⏳ Applications - Pending
- ⏳ Partnerships - Pending
- ⏳ Complaints - Pending
- ⏳ Subscribers - Pending

Would you like me to implement this pattern for a specific page first?
