# Supabase Integration Setup Guide

This guide walks you through setting up Supabase for your Next.js project.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed
- Your project's Next.js development environment set up

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in the project details:
   - **Name**: Your project name
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your users
4. Click **Create new project** and wait for it to initialize

## 2. Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: Your Supabase URL
   - **anon/public key**: Your public API key
   - **service_role key**: Your service role key (keep this secret!)

## 3. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Security Note**: 
- `NEXT_PUBLIC_*` variables are exposed to the browser (use the anon key)
- `SUPABASE_SERVICE_ROLE_KEY` is secret (use only in server-side code)

## 4. Create Database Tables

### Example: Contacts Table

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write (adjust as needed)
CREATE POLICY "Enable insert for all users" ON contacts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON contacts
  FOR SELECT
  USING (true);
```

## 5. Install Dependencies

Install Supabase packages:

```bash
npm install @supabase/supabase-js @supabase/ssr
# or with pnpm
pnpm add @supabase/supabase-js @supabase/ssr
```

## 6. Project Structure

The integration includes the following files:

```
lib/
  supabase/
    client.ts      # Browser-side Supabase client
    server.ts      # Server-side Supabase client
    actions.ts     # Server actions for database operations
app/
  api/
    contacts/
      route.ts     # API endpoint for contacts
```

## 7. Using Supabase in Your Code

### Client-Side (Browser)

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
  }

  return <div>...</div>
}
```

### Server-Side (Server Components)

```tsx
import { createClient } from '@/lib/supabase/server'

export async function MyServerComponent() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('*')

  return <div>{/* render data */}</div>
}
```

### Server Actions

Use the predefined actions in `lib/supabase/actions.ts`:

```tsx
'use client'

import { submitContactForm } from '@/lib/supabase/actions'

export function ContactForm() {
  const handleSubmit = async (formData) => {
    const result = await submitContactForm(
      formData.email,
      formData.name,
      formData.message,
      formData.company
    )

    if (result.success) {
      console.log('Contact saved:', result.data)
    } else {
      console.error('Error:', result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### API Routes

Make requests to the API endpoint:

```typescript
// GET all contacts
const response = await fetch('/api/contacts')
const { data } = await response.json()

// POST a new contact
const response = await fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    message: 'Hello',
    company: 'ACME Inc'
  })
})
```

## 8. Common Operations

### Insert Data

```typescript
const { data, error } = await supabase
  .from('contacts')
  .insert({ email: 'user@example.com', name: 'John' })
  .select()
```

### Read Data

```typescript
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .order('created_at', { ascending: false })
```

### Update Data

```typescript
const { data, error } = await supabase
  .from('contacts')
  .update({ name: 'Jane Doe' })
  .eq('id', 1)
  .select()
```

### Delete Data

```typescript
const { data, error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', 1)
```

### Filters

```typescript
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('company', 'ACME Inc')        // Equals
  .gt('created_at', '2024-01-01')  // Greater than
  .lt('id', 100)                    // Less than
  .like('name', '%John%')           // Pattern match
```

## 9. Authentication (Optional)

To add user authentication:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## 10. Troubleshooting

### Connection Issues
- Verify your `.env.local` has correct credentials
- Check that your Supabase project is running (green indicator in dashboard)
- Ensure network connectivity to `https://your-project.supabase.co`

### Authentication Errors
- Check Row Level Security (RLS) policies on your tables
- Verify the API key you're using has the correct permissions
- Use service role key for admin operations, anon key for client operations

### Development Issues
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`
- Check browser console for detailed error messages

## 11. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Library](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime) for live updates

## 12. Next Steps

- Set up additional database tables for your app
- Implement user authentication
- Configure Row Level Security policies
- Set up real-time subscriptions
- Implement database backups and recovery procedures
