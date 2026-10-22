# Immediate Code Quality Issues Found

## 🔴 Critical Duplications

### 1. **Supabase Client Creation** (Found in 25+ files)
Every API route repeats:
```typescript
const supabase = await createClient()
```

**Solution**: Create a middleware function that provides the client.

---

### 2. **Authentication Checks** (Repeated 15+ times)
Pattern repeated everywhere:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Solution**: Create `withAuth` middleware wrapper.

---

### 3. **Error Handling** (30+ duplicates)
Every route has:
```typescript
try {
  // logic
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

**Solution**: Create `apiHandler` wrapper with standardized error handling.

---

### 4. **Rate Limiting** (10+ duplicates)
Repeated pattern:
```typescript
const limited = await applyRateLimit(request, someRateLimit)
if (limited) return limited
```

**Solution**: Middleware chain that includes rate limiting.

---

### 5. **Validation Logic** (Recently added but not applied everywhere)
Some routes use Zod, others use manual validation:
```typescript
// Old way (still in many files)
if (!email || !name || !message) {
  return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
}

// New way (only in 8 files)
const validatedData = schema.parse(body)
```

**Solution**: Migrate all routes to use Zod validation consistently.

---

## 🟡 Medium Priority Duplications

### 6. **Email Sending Logic**
Multiple places send emails with similar boilerplate:
- `app/api/contacts/route.ts`
- `app/api/job-applications/route.ts`
- `app/api/schedule/route.ts`

**Solution**: Create `lib/email/templates.ts` with reusable email functions.

---

### 7. **Admin Notification Pattern**
Repeated in multiple routes:
```typescript
await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/send-notification-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: '...', data: {...} })
})
```

**Solution**: Create `lib/notifications/send-admin-notification.ts`.

---

### 8. **CAPTCHA Verification**
Same pattern in 8+ routes:
```typescript
const captchaResult = await verifyCaptcha(captchaToken, 'action_name')
if (!captchaResult.success) {
  return NextResponse.json({ error: 'CAPTCHA failed' }, { status: 403 })
}
```

**Solution**: Include in middleware chain.

---

### 9. **Database Query Patterns**
Many routes have similar CRUD operations:
```typescript
// GET all
const { data, error } = await supabase.from('table').select('*')

// GET by ID
const { data, error } = await supabase.from('table').select('*').eq('id', id).single()

// INSERT
const { data, error } = await supabase.from('table').insert([...]).select()
```

**Solution**: Create generic CRUD helpers in `lib/db/crud.ts`.

---

### 10. **Form State Management** (Components)
Multiple forms repeat similar state logic:
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [success, setSuccess] = useState(false)
```

**Solution**: Create `useFormState` custom hook.

---

## 🟢 Low Priority (Style/Convention Issues)

### 11. **Import Order**
Inconsistent import ordering across files.

**Solution**: Add ESLint rule for import sorting.

---

### 12. **Type Definitions**
Some types are duplicated across files instead of shared.

**Solution**: Centralize types in `lib/types/`.

---

### 13. **Console.log Statements**
Multiple `console.log` and `console.error` scattered throughout.

**Solution**: Use proper logger utility.

---

### 14. **Magic Numbers and Strings**
Hardcoded values like `401`, `500`, error messages repeated.

**Solution**: Use constants from `lib/constants.ts`.

---

### 15. **Temporary Files**
Found utility files that should be removed:
- `update_emails.js`
- `update_emails.ps1`
- `update_emails.sql`
- `update_team_emails.sql`

**Solution**: Delete after confirming changes are in database.

---

## 📊 Statistics

- **API Routes Analyzed**: 25+
- **Duplicate Patterns Found**: 15+
- **Estimated Lines That Can Be Removed**: ~500-700
- **New Utility Files Needed**: 6-8
- **Files That Need Updating**: 30-40

---

## ⚡ Quick Wins (Can be done immediately)

1. Delete temporary SQL/JS files
2. Fix React key duplication in `about-content.tsx` (already fixed)
3. Centralize HTTP status codes
4. Create `apiHandler` wrapper
5. Create `withAuth` middleware

---

## 🎯 Recommended Refactoring Order

1. **Phase 1**: Create core utilities (middleware, handlers, hooks)
2. **Phase 2**: Update API routes to use new utilities
3. **Phase 3**: Refactor components to use shared logic
4. **Phase 4**: Clean up and remove dead code
5. **Phase 5**: Add comprehensive tests

---

**Status**: Automated refactoring workflow is currently running to implement these improvements systematically.
