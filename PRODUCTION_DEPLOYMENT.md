# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Code Quality ✅
- [x] All TypeScript errors resolved
- [x] ESLint passes without errors
- [x] Build completes successfully
- [x] No console.log statements in production code
- [x] Error boundaries implemented
- [x] Rate limiting configured

### 2. Security ✅
- [x] Environment variables secured
- [x] Security headers configured
- [x] HTTPS enforced
- [x] Admin routes protected
- [x] Role-based access control
- [x] SQL injection protection (Supabase RLS)
- [x] XSS protection headers
- [x] CSRF protection via SameSite cookies

### 3. Performance ✅
- [x] Image optimization enabled
- [x] Code splitting configured
- [x] Database queries cached
- [x] Compression enabled
- [x] Static assets optimized

### 4. Monitoring
- [ ] Error tracking setup (Sentry, LogRocket)
- [ ] Analytics configured (Google Analytics, Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Step 3: Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
GMAIL_USER=your_gmail
GMAIL_APP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_GA_ID=your_ga_id
```

**Important:** Set these for **Production** environment

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Verify deployment at provided URL

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Wait for DNS propagation (~24-48 hours)

---

## Supabase Production Configuration

### 1. Database Setup
```sql
-- Run these SQL commands in Supabase SQL Editor

-- Enable Row Level Security on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
```

### 2. RLS Policies
See `FIX_RLS.sql` for complete RLS policy setup.

### 3. Backup Configuration
1. Enable Point-in-Time Recovery (PITR) in Supabase Dashboard
2. Set up daily backups
3. Test restore procedure

---

## Post-Deployment Tasks

### 1. Verify Deployment ✅
```bash
# Test critical paths
curl https://yourdomain.com/
curl https://yourdomain.com/admin/login
curl https://yourdomain.com/api/testimonials

# Check security headers
curl -I https://yourdomain.com/
```

### 2. Test Admin Panel
- [ ] Login works
- [ ] Dashboard loads
- [ ] Create/update/delete operations work
- [ ] Role-based permissions enforced
- [ ] Session persistence works

### 3. Test Public Pages
- [ ] Homepage loads
- [ ] Contact form works
- [ ] Project pages load
- [ ] Service pages load
- [ ] Newsletter signup works

### 4. Performance Audit
```bash
# Run Lighthouse audit
npx lighthouse https://yourdomain.com --view

# Check Core Web Vitals
# LCP < 2.5s ✅
# FID < 100ms ✅
# CLS < 0.1 ✅
```

---

## Monitoring Setup

### 1. Sentry Error Tracking (Recommended)
```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

Then update `lib/utils/logger.ts` to send errors to Sentry.

### 2. Vercel Analytics
Already configured via `@vercel/analytics` package. View in Vercel Dashboard.

### 3. Uptime Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake
- Vercel Monitoring

### 4. Log Aggregation
- Vercel Logs (built-in)
- Datadog
- LogRocket

---

## Security Hardening

### 1. Supabase Security
- [ ] Review RLS policies
- [ ] Rotate service role key periodically
- [ ] Enable database backups
- [ ] Set up IP allowlisting (if needed)
- [ ] Enable 2FA for Supabase account

### 2. Vercel Security
- [ ] Enable HTTPS only
- [ ] Configure deployment protection
- [ ] Set up environment variable encryption
- [ ] Enable team 2FA

### 3. Admin Security
- [ ] Change default admin password
- [ ] Enable 2FA for admin users (future feature)
- [ ] Review admin activity logs
- [ ] Limit admin IPs (if applicable)

---

## Performance Optimization

### 1. Database
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM projects WHERE featured = true;

-- Add missing indexes if needed
CREATE INDEX idx_custom ON table_name(column_name);
```

### 2. Edge Caching
Configure in `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

### 3. Image Optimization
- Use Next.js Image component everywhere
- Compress images before upload
- Use WebP/AVIF formats
- Enable lazy loading

---

## Rollback Plan

### If Issues Occur After Deployment:

#### Option 1: Instant Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

#### Option 2: Git Revert
```bash
git revert HEAD
git push origin main
```

#### Option 3: Database Rollback
```bash
# Restore from Supabase backup
# Go to Supabase Dashboard → Database → Backups
# Select backup and restore
```

---

## Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check uptime reports
- [ ] Monitor performance metrics
- [ ] Review security logs

### Monthly
- [ ] Update dependencies
- [ ] Review and update RLS policies
- [ ] Database performance audit
- [ ] Backup verification test

### Quarterly
- [ ] Security audit
- [ ] Penetration testing
- [ ] Load testing
- [ ] Disaster recovery drill

---

## Scaling Considerations

### Database Scaling
- Supabase auto-scales with your plan
- Consider upgrading plan for:
  - More concurrent connections
  - Larger database size
  - Better performance

### Application Scaling
- Vercel auto-scales based on traffic
- No manual configuration needed
- Monitor usage in Vercel Dashboard

### CDN/Edge
- Vercel Edge Network is enabled by default
- Assets cached globally
- 99.99% uptime SLA

---

## Cost Optimization

### Supabase
- **Free tier**: 500MB database, 50MB storage
- **Pro tier**: $25/mo - 8GB database, 100GB storage
- **Scale tier**: Custom pricing

### Vercel
- **Hobby**: Free for personal projects
- **Pro**: $20/mo per user
- **Enterprise**: Custom pricing

### Recommendations
- Start with free tiers
- Monitor usage via dashboards
- Upgrade when limits reached
- Set up billing alerts

---

## Support & Documentation

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

### Getting Help
- GitHub Issues (project repo)
- Next.js Discord
- Supabase Discord
- Vercel Support

---

## Final Checklist

Before going live:
- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Security headers verified
- [ ] Performance tested
- [ ] Error tracking configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained on admin panel
- [ ] Rollback plan documented

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Version:** 1.0.0  
**Status:** Production Ready ✅
