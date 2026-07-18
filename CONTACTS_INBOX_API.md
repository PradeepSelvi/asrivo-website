# 📬 Contacts Inbox API Documentation

## Overview

Server-side actions for managing contact form submissions in the admin dashboard.

**File:** `lib/supabase/actions.ts`

---

## 📋 Available Functions

### **1. Get All Contacts**
```typescript
getContacts(limit?: number)
```

**Description:** Fetches all contacts, ordered by most recent first.

**Parameters:**
- `limit` (optional): Max number of contacts to return. Default: 50

**Returns:**
```typescript
{
  success: boolean
  data?: Contact[]
  error?: string
}
```

**Example:**
```typescript
const result = await getContacts(100)
if (result.success) {
  console.log(result.data) // Array of contacts
}
```

---

### **2. Get Contact By ID**
```typescript
getContactById(id: number)
```

**Description:** Fetches a single contact by ID.

**Parameters:**
- `id`: Contact ID

**Returns:**
```typescript
{
  success: boolean
  data?: Contact
  error?: string
}
```

**Example:**
```typescript
const result = await getContactById(123)
if (result.success) {
  console.log(result.data.email) // Contact email
}
```

---

### **3. Update Contact Status** ⭐
```typescript
updateContactStatus(id: number, status: 'unread' | 'read' | 'responded')
```

**Description:** Updates the status of a contact message.

**Parameters:**
- `id`: Contact ID
- `status`: One of `'unread'`, `'read'`, or `'responded'`

**Returns:**
```typescript
{
  success: boolean
  data?: Contact
  error?: string
}
```

**Example:**
```typescript
// Mark as read
await updateContactStatus(123, 'read')

// Mark as responded
await updateContactStatus(123, 'responded')
```

---

### **4. Get Contacts By Status**
```typescript
getContactsByStatus(status: 'unread' | 'read' | 'responded', limit?: number)
```

**Description:** Fetches contacts filtered by status.

**Parameters:**
- `status`: One of `'unread'`, `'read'`, or `'responded'`
- `limit` (optional): Max number to return. Default: 50

**Returns:**
```typescript
{
  success: boolean
  data?: Contact[]
  error?: string
}
```

**Example:**
```typescript
// Get all unread messages
const unread = await getContactsByStatus('unread')

// Get last 10 responded messages
const responded = await getContactsByStatus('responded', 10)
```

---

### **5. Get Contacts Statistics** 📊
```typescript
getContactsStats()
```

**Description:** Returns counts for all contact statuses.

**Parameters:** None

**Returns:**
```typescript
{
  success: boolean
  data?: {
    unread: number
    read: number
    responded: number
    total: number
  }
  error?: string
}
```

**Example:**
```typescript
const stats = await getContactsStats()
if (stats.success) {
  console.log(`Unread: ${stats.data.unread}`)
  console.log(`Total: ${stats.data.total}`)
}
```

---

### **6. Mark Multiple Contacts as Read**
```typescript
markMultipleContactsAsRead(ids: number[])
```

**Description:** Bulk mark multiple contacts as read.

**Parameters:**
- `ids`: Array of contact IDs

**Returns:**
```typescript
{
  success: boolean
  data?: Contact[]
  error?: string
}
```

**Example:**
```typescript
// Mark contacts 1, 2, 3 as read
await markMultipleContactsAsRead([1, 2, 3])
```

---

### **7. Delete Contact**
```typescript
deleteContact(id: number)
```

**Description:** Permanently deletes a contact.

**Parameters:**
- `id`: Contact ID

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
const result = await deleteContact(123)
if (result.success) {
  console.log('Contact deleted')
}
```

---

## 📦 Contact Type

```typescript
interface Contact {
  id: number
  email: string
  name: string
  message: string
  company?: string | null
  phone?: string | null
  subject?: string | null
  status: 'unread' | 'read' | 'responded'
  created_at: string
  updated_at: string
}
```

---

## 🎯 Common Usage Patterns

### **Admin Dashboard - Inbox View**
```typescript
'use server'

import { 
  getContacts, 
  getContactsStats, 
  updateContactStatus 
} from '@/lib/supabase/actions'

export async function InboxPage() {
  // Get stats for dashboard
  const stats = await getContactsStats()
  
  // Get recent contacts
  const contacts = await getContacts(20)
  
  return (
    <div>
      <h1>Inbox ({stats.data?.unread} unread)</h1>
      {/* Render contacts */}
    </div>
  )
}
```

### **Mark as Read When Viewing**
```typescript
'use client'

async function handleViewContact(id: number) {
  const result = await updateContactStatus(id, 'read')
  if (result.success) {
    // Update UI
  }
}
```

### **Filter by Status**
```typescript
// Show only unread messages
const unreadMessages = await getContactsByStatus('unread')

// Show only responded messages
const respondedMessages = await getContactsByStatus('responded')
```

### **Bulk Operations**
```typescript
// Mark all selected as read
const selectedIds = [1, 2, 3, 4, 5]
await markMultipleContactsAsRead(selectedIds)
```

---

## 🔒 Security

All functions use **server-side authentication** via:
- RLS policies (admin-only read access)
- Supabase server client (automatic auth context)
- Protected by middleware at route level

**Authentication Required:**
- All read operations require `is_admin()` = true
- All write operations require `is_admin()` = true
- Public users can only INSERT via `submitContactForm()`

---

## 🧪 Testing Examples

### **Test 1: Get Stats**
```typescript
const stats = await getContactsStats()
console.log(stats)
// Expected: { success: true, data: { unread: 5, read: 10, responded: 3, total: 18 } }
```

### **Test 2: Change Status**
```typescript
// Mark contact #1 as read
const result = await updateContactStatus(1, 'read')
console.log(result)
// Expected: { success: true, data: { id: 1, status: 'read', ... } }
```

### **Test 3: Get Unread Only**
```typescript
const unread = await getContactsByStatus('unread')
console.log(unread.data?.length)
// Expected: Number of unread contacts
```

---

## 📱 API Usage in Components

### **Server Component Example**
```typescript
// app/admin/inbox/page.tsx
import { getContacts, getContactsStats } from '@/lib/supabase/actions'

export default async function AdminInboxPage() {
  const [contacts, stats] = await Promise.all([
    getContacts(50),
    getContactsStats()
  ])

  return (
    <div>
      <h1>Contacts ({stats.data?.total})</h1>
      <div>Unread: {stats.data?.unread}</div>
      {/* Render contacts */}
    </div>
  )
}
```

### **Client Component Example**
```typescript
'use client'

import { updateContactStatus } from '@/lib/supabase/actions'
import { useState } from 'react'

export function ContactItem({ contact }) {
  const [status, setStatus] = useState(contact.status)

  const handleStatusChange = async (newStatus) => {
    const result = await updateContactStatus(contact.id, newStatus)
    if (result.success) {
      setStatus(newStatus)
    }
  }

  return (
    <div>
      <p>{contact.message}</p>
      <select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="unread">Unread</option>
        <option value="read">Read</option>
        <option value="responded">Responded</option>
      </select>
    </div>
  )
}
```

---

## ✅ Status Flow

```
New Contact Submitted
        ↓
    [unread] ← Initial status
        ↓
    [read] ← When admin views
        ↓
    [responded] ← When admin replies
```

---

## 🚀 Next Steps

**To use in your admin dashboard:**

1. Create admin inbox page at `app/admin/inbox/page.tsx`
2. Import the functions you need
3. Use the functions to build your UI
4. All authentication is handled automatically

**Example admin page structure:**
```
app/
  admin/
    inbox/
      page.tsx       ← List view
      [id]/
        page.tsx     ← Detail view
```

---

## 📞 Support

All functions are fully typed and documented. Your IDE should provide autocomplete and type hints.

**Error Handling:**
All functions return `{ success: boolean, data?, error? }` format for consistent error handling.

---

**Task Complete!** ✅ All contact inbox management functions are ready to use.
