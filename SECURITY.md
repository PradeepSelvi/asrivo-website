# Security Policy

## 🛡️ Security Features

### Authentication & Authorization
- ✅ Cookie-based authentication via Supabase
- ✅ Server-side session validation
- ✅ Role-based access control (high/low admin)
- ✅ Protected admin routes with `requireAdmin()` guard
- ✅ No token storage in localStorage

### Rate Limiting
All public endpoints are rate-limited to prevent abuse:
- **Login**: 5 attempts per 15 minutes
- **Contact Forms**: 3 submissions per hour
- **Service Inquiries**: 5 submissions per hour
- **File Uploads**: 10 uploads per hour
- **API Endpoints**: 30 requests per minute

### File Upload Security
- ✅ Allowlist of allowed buckets
- ✅ File size validation (10MB limit)
- ✅ MIME type validation
- ✅ Server-generated filenames (prevents path traversal)
- ✅ Secure random naming with crypto.randomBytes

### Database Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Parameterized queries (no SQL injection)
- ✅ Admin-only access policies
- ✅ Public read-only for appropriate tables

### Input Validation
- ✅ Zod schemas for API validation
- ✅ Email validation
- ✅ String length limits
- ✅ Type checking

### XSS Protection
- ✅ React's built-in XSS protection
- ✅ Minimal use of dangerouslySetInnerHTML (only for controlled CSS)
- ✅ Content Security Policy headers

## 🔒 Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env.local` for local development
   - Add all env files to `.gitignore`

2. **Validate all inputs**
   ```typescript
   import { validateRequest, contactFormSchema } from '@/lib/utils/validation'
   
   const result = validateRequest(contactFormSchema, await request.json())
   if (!result.success) {
     return NextResponse.json({ error: result.error }, { status: 400 })
   }
   ```

3. **Use rate limiting**
   ```typescript
   import { applyRateLimit } from '@/lib/utils/apply-rate-limit'
   import { formSubmitRateLimit } from '@/lib/utils/rate-limit'
   
   const limited = await applyRateLimit(request, formSubmitRateLimit)
   if (limited) return limited
   ```

4. **Protect admin routes**
   ```typescript
   import { requireAdmin } from '@/lib/auth/admin-guard'
   
   export default async function AdminPage() {
     await requireAdmin() // Redirects if not authenticated
     // ... rest of component
   }
   ```

5. **Sanitize error messages**
   ```typescript
   // ❌ Don't expose internal errors
   return NextResponse.json({ error: error.message }, { status: 500 })
   
   // ✅ Return generic messages
   console.error('Internal error:', error)
   return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
   ```

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please email us at **security@asrivotech.in** instead of opening a public issue.

We take all security reports seriously and will respond within 48 hours.

## 📋 Security Checklist

Before deploying to production:

- [ ] All environment variables set correctly
- [ ] Rate limiting configured
- [ ] RLS policies enabled on all Supabase tables
- [ ] File upload buckets configured with proper permissions
- [ ] Admin accounts use strong passwords
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS policy restrictive
- [ ] Error logging configured (without exposing sensitive data)
- [ ] Backup strategy in place

## 🔄 Security Updates

This project uses:
- **Next.js** - Keep updated for security patches
- **Supabase** - Managed security updates
- **Dependencies** - Run `npm audit` regularly

### Check for vulnerabilities:
```bash
npm audit
npm audit fix
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth)
