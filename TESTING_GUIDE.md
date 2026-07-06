# Testing Guide - Supabase Integration

This guide walks through testing your Supabase integration and database setup.

## Prerequisites

- All database tables created in Supabase
- Environment variables configured in `.env.local`
- Development server running (`npm run dev` or `pnpm dev`)

---

## Test 1: Verify Database Connection

### Step 1: Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run this query:

```sql
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: `table_count: 12` (all your tables)

### Step 2: Check Table Creation
In Supabase Dashboard, go to **Table Editor** and verify you see:
- ✅ contacts
- ✅ service_inquiries
- ✅ projects
- ✅ team_members
- ✅ services
- ✅ testimonials
- ✅ job_applications
- ✅ job_postings
- ✅ newsletter_subscribers
- ✅ settings
- ✅ audit_logs
- ✅ analytics

### Step 3: Verify Settings Data
In **Table Editor**, click **settings** and you should see default company settings:
- company_name: "Asrivo Tech"
- company_email: "info@asrivotech.com"
- etc.

---

## Test 2: Test API Connection

### Method A: Using Browser DevTools

1. **Start your dev server**:
```bash
npm run dev
# or
pnpm dev
```

2. **Open your browser** and go to `http://localhost:3000`

3. **Open Browser Console** (F12 → Console tab)

4. **Test GET request** - Paste this:
```javascript
fetch('/api/contacts')
  .then(res => res.json())
  .then(data => console.log('GET Response:', data))
  .catch(err => console.error('Error:', err))
```

Expected output:
```javascript
GET Response: { success: true, data: [] }
```

5. **Test POST request** - Paste this:
```javascript
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    name: 'Test User',
    message: 'This is a test message',
    company: 'Test Company'
  })
})
  .then(res => res.json())
  .then(data => console.log('POST Response:', data))
  .catch(err => console.error('Error:', err))
```

Expected output:
```javascript
POST Response: { success: true, data: [{...contact data...}] }
```

### Method B: Using cURL (Terminal/PowerShell)

```bash
# Test GET
curl http://localhost:3000/api/contacts

# Test POST
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","message":"Test message","company":"Test Co"}'
```

### Method C: Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new request
3. Set method to **GET**
4. Enter URL: `http://localhost:3000/api/contacts`
5. Click **Send**
6. Should return: `{ "success": true, "data": [] }`

Repeat with POST method using the JSON body from above.

---

## Test 3: Test Contact Form Submission

### Step 1: Create a Test Page

Create a file: `app/test-form/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { submitContactForm } from '@/lib/supabase/actions'

export default function TestFormPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleTestSubmit = async () => {
    setLoading(true)
    setMessage('Submitting...')

    const result = await submitContactForm(
      'testuser@example.com',
      'Test User',
      'This is a test message',
      'Test Company'
    )

    if (result.success) {
      setMessage('✅ Success! Contact saved to database')
      console.log('Saved data:', result.data)
    } else {
      setMessage(`❌ Error: ${result.error}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test Database Connection</h1>
        
        <button
          onClick={handleTestSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Test Contact'}
        </button>

        {message && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-center font-mono text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Step 2: Test the Form

1. Go to `http://localhost:3000/test-form`
2. Click "Submit Test Contact"
3. Check the message - should see ✅ Success
4. Check Supabase Dashboard > Table Editor > contacts - new record should appear

---

## Test 4: Test Data Retrieval

### Step 1: Create a Display Page

Create a file: `app/test-data/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function TestDataPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
        const result = await response.json()

        if (result.success) {
          setContacts(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Data Display</h1>

        {loading && <p className="text-white">Loading...</p>}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            Error: {error}
          </div>
        )}

        <div className="grid gap-4">
          {contacts.length === 0 ? (
            <p className="text-white">No contacts found</p>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg p-6">
                <h3 className="font-bold text-lg">{contact.name}</h3>
                <p className="text-gray-600">{contact.email}</p>
                <p className="mt-2">{contact.message}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Company: {contact.company || 'N/A'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(contact.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-white">
          <p>Total contacts: <strong>{contacts.length}</strong></p>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: View the Data

1. Go to `http://localhost:3000/test-data`
2. You should see all saved contacts displayed
3. Refresh the page to verify real-time retrieval

---

## Test 5: Test Other Tables (Optional)

### Test Newsletter Subscription

In browser console:
```javascript
fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'subscriber@example.com',
    name: 'Test Subscriber'
  })
})
  .then(res => res.json())
  .then(data => console.log('Subscribe Response:', data))
```

### Test Service Inquiry

In browser console:
```javascript
fetch('/api/service-inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'client@example.com',
    name: 'Test Client',
    company: 'Test Corp',
    phone: '+1234567890',
    service_type: 'software-dev',
    project_description: 'Need a web app',
    timeline: '3-6-months',
    budget: '$50k-$100k'
  })
})
  .then(res => res.json())
  .then(data => console.log('Inquiry Response:', data))
```

---

## Test 6: Verify RLS (Row Level Security)

### Test Public Insert
```javascript
// This should work (public can insert)
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'User',
    message: 'Test'
  })
})
  .then(res => res.json())
  .then(data => console.log(data.success ? '✅ Insert allowed' : '❌ Insert blocked'))
```

### Test in Supabase Dashboard
1. Go to **Authentication** → **Policies**
2. Check each table's policies
3. Verify they match your security requirements
4. Policies should allow:
   - Public: INSERT, SELECT on public tables
   - Authenticated: CRUD on protected tables

---

## Test 7: Check Server logs

### Check Terminal Output

Your terminal should show logs like:

```
 ✓ Ready in 2.3s
```

When you make requests, you might see:
```
 GET /api/contacts 200 in 123ms
 POST /api/contacts 201 in 456ms
```

### Check Supabase Logs

In Supabase Dashboard:
1. Go to **Logs** → **Edge Function Logs**
2. Or **Database** → **Query Performance**
3. Should see your queries logged

---

## Test 8: Test Error Handling

### Test Missing Required Fields
```javascript
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com'
    // Missing: name and message
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
// Should return: error about missing required fields
```

### Test Invalid Email Format
```javascript
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'not-an-email',
    name: 'Test',
    message: 'Test'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
```

---

## Test 9: Performance Test

### Test Large Data Retrieval
```javascript
// Get all contacts with order
fetch('/api/contacts?limit=100&offset=0')
  .then(res => res.json())
  .then(data => {
    console.log('Total records:', data.data.length)
    console.log('Response time:', performance.now(), 'ms')
  })
```

### Test Search/Filter
```javascript
// Get contacts from specific company
fetch('/api/contacts?company=Test%20Company')
  .then(res => res.json())
  .then(data => console.log('Filtered:', data.data))
```

---

## Test 10: Verify Email Fields

### Check Required Email Fields
```javascript
// Both should fail - invalid email format
fetch('/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'invalid-email',
    name: 'Test',
    message: 'Test'
  })
})
```

---

## Troubleshooting

### Issue: "CORS Error"
**Solution**: 
- Check that your API route is in `app/api/` folder
- Restart dev server: `npm run dev`

### Issue: "Missing environment variables"
**Solution**:
- Verify `.env.local` has all three keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Restart dev server

### Issue: "RLS Policy Error"
**Solution**:
- Go to Supabase Dashboard → Authentication → Policies
- Enable or adjust RLS policies
- Run this SQL in SQL Editor:
```sql
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
-- Test without RLS, then re-enable with proper policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```

### Issue: "Connection Refused"
**Solution**:
- Verify Supabase project is running (green dot in dashboard)
- Check internet connection
- Check `.env.local` URL is correct

### Issue: "401 Unauthorized"
**Solution**:
- Check API keys match in `.env.local`
- Verify anon key in POST requests (public operations)
- Use service role key only on server side

---

## Quick Test Checklist

- [ ] Database tables created in Supabase
- [ ] Default settings visible in `settings` table
- [ ] Dev server running on localhost:3000
- [ ] GET `/api/contacts` returns success
- [ ] POST `/api/contacts` with valid data succeeds
- [ ] New contact appears in Supabase Table Editor
- [ ] Test form page displays submitted data
- [ ] Invalid data submission returns error
- [ ] Multiple contacts display correctly
- [ ] Timestamps are correct (created_at, updated_at)

---

## Next Steps After Testing

1. ✅ **Verify production readiness**
   - Test error handling
   - Test edge cases
   - Load test with multiple requests

2. **Implement in real pages**
   - Replace test pages with actual components
   - Integrate with your contact form
   - Add to career/job application pages

3. **Set up monitoring**
   - Enable Supabase logs
   - Set up error tracking (Sentry, etc.)
   - Monitor database performance

4. **Configure backups**
   - Set up automated backups in Supabase
   - Test restore procedure
   - Document backup schedule

5. **Security hardening**
   - Review RLS policies
   - Add input validation
   - Implement rate limiting

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Check for errors
npm run build

# Check types
npm run typecheck (if available)

# Clear cache
rm -rf .next

# View logs
tail -f .next/logs/build.log
```

---

## Support

If you encounter issues:
1. Check error message in browser console
2. Check terminal logs
3. Check Supabase logs (Dashboard → Logs)
4. Review [Supabase Docs](https://supabase.com/docs)
5. Check [Next.js Docs](https://nextjs.org/docs)
