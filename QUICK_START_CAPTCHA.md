# 🚀 Quick Start: Enable CAPTCHA Protection

## 5-Minute Setup

### Step 1: Get Keys (2 minutes)
1. Go to https://www.google.com/recaptcha/admin
2. Click **"Create"** or **"+"**
3. Fill out:
   - Label: `Asrivo Tech`
   - Type: **reCAPTCHA v3**
   - Domains: `localhost`, your production domain
4. Click **Submit**
5. Copy **Site Key** and **Secret Key**

### Step 2: Add to Local Environment (1 minute)
Create or edit `.env.local`:
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...your_site_key
RECAPTCHA_SECRET_KEY=6Lc...your_secret_key
```

### Step 3: Test Locally (1 minute)
```bash
pnpm dev
```
1. Go to http://localhost:3000/contact
2. Fill out form and submit
3. Open browser console - should see no errors
4. Form should submit successfully

### Step 4: Deploy to Production (1 minute)
1. Go to Vercel project → Settings → Environment Variables
2. Add both variables (Site Key + Secret Key)
3. Select all environments
4. Save and redeploy

**Done!** ✅ Your forms are now protected.

---

## Test Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Check for errors
pnpm lint
```

---

## What's Protected

✅ Contact form at `/contact`  
⏳ Newsletter signup (backend ready)  
⏳ Service inquiry (backend ready)

---

## Need Help?

See full documentation:
- **Detailed Guide**: `CAPTCHA_SETUP_GUIDE.md`
- **What Changed**: `CAPTCHA_INTEGRATION_COMPLETE.md`
- **Troubleshooting**: Check "Troubleshooting" section in `CAPTCHA_SETUP_GUIDE.md`

---

**Important**: Without keys configured, CAPTCHA automatically passes all requests (development mode). Add keys before going to production!
