# Google reCAPTCHA v3 Setup Guide

## ✅ Integration Status

### Completed
- [x] CAPTCHA utility created (`lib/utils/captcha.ts`)
- [x] Server-side verification implemented in all API routes
- [x] Client-side execution added to contact form
- [x] Environment variables documented in `.env.example`

### Forms Protected
1. **Contact Form** (`app/contact/page.tsx`) ✅
2. **Newsletter Signup** (pending - needs frontend form)
3. **Service Inquiry** (pending - needs frontend form)

---

## 🚀 Setup Instructions

### Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"Create"** or **"+"** button
3. Fill out the form:
   - **Label**: `Asrivo Tech Website`
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - `www.yourdomain.com`
   - Accept terms and click **Submit**
4. Copy the **Site Key** and **Secret Key**

### Step 2: Configure Environment Variables

#### Local Development (`.env.local`)
```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

#### Production (Vercel)
1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = your_site_key
   - `RECAPTCHA_SECRET_KEY` = your_secret_key
4. Apply to **Production**, **Preview**, and **Development** environments

### Step 3: Test the Integration

#### Testing Contact Form
1. Start your development server: `pnpm dev`
2. Navigate to `/contact`
3. Fill out the form and submit
4. Check browser console - you should see:
   - reCAPTCHA script loaded
   - Token generated (starts with `03A...`)
5. Check server logs - you should see successful CAPTCHA verification

#### Testing in Production
1. Deploy to Vercel
2. Submit a form on production
3. Check Vercel logs for CAPTCHA verification
4. If CAPTCHA fails, check:
   - Domain is added to reCAPTCHA console
   - Environment variables are set correctly
   - HTTPS is enabled

---

## 🔧 How It Works

### Client-Side Flow
1. **Page Load**: `loadRecaptchaScript()` injects Google's reCAPTCHA script
2. **Form Submit**: `executeRecaptcha('action_name')` generates a token
3. **API Call**: Token is sent with form data to API route

### Server-Side Flow
1. **Receive Token**: API route extracts `captchaToken` from request
2. **Verify Token**: `verifyCaptcha(token, action)` calls Google API
3. **Check Score**: Google returns score (0.0 - 1.0)
   - 0.0 = Very likely a bot
   - 1.0 = Very likely a human
   - Threshold = 0.5 (adjustable)
4. **Accept/Reject**: If score >= 0.5, allow submission; otherwise, reject

---

## 🎯 Integration Status by Form

### ✅ Contact Form (`/contact`)
**Status**: Fully integrated

**What's Implemented:**
- reCAPTCHA script loads on page mount
- Token generated on form submit
- Token sent to `/api/contacts`
- Server verifies token before saving to database

**Test Command:**
```bash
# Fill out form at http://localhost:3000/contact and submit
```

### ⏳ Newsletter Form
**Status**: Backend ready, frontend pending

**Backend**: `/api/newsletter` route already has CAPTCHA verification

**What's Needed:**
- Find or create newsletter signup component
- Add `loadRecaptchaScript()` on component mount
- Add `executeRecaptcha('newsletter_signup')` before API call
- Send token with email/name

**Example Implementation:**
```typescript
'use client'
import { useEffect, useState } from 'react'
import { loadRecaptchaScript, executeRecaptcha } from '@/lib/utils/captcha'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecaptchaScript()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const captchaToken = await executeRecaptcha('newsletter_signup')

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      })

      if (response.ok) {
        alert('Successfully subscribed!')
        setEmail('')
      } else {
        const error = await response.json()
        alert(error.error || 'Subscription failed')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  )
}
```

### ⏳ Service Inquiry Form
**Status**: Backend ready, frontend pending

**Backend**: `/api/service-inquiry` route already has CAPTCHA verification

**What's Needed:**
- Find or create service inquiry component
- Add `loadRecaptchaScript()` on component mount
- Add `executeRecaptcha('service_inquiry')` before API call
- Send token with form data

---

## 🛡️ Security Features

### Score Threshold
**Current Setting**: 0.5 (moderate security)

**Adjust in `lib/utils/captcha.ts`:**
```typescript
const threshold = 0.5 // Change this value
```

**Recommended Values:**
- **0.3** - More lenient (fewer false positives, more bots may pass)
- **0.5** - Balanced (recommended for most sites)
- **0.7** - Stricter (better bot blocking, may reject some humans)

### Bypass in Development
If reCAPTCHA keys are not configured, the system **automatically passes** all requests in development:

```typescript
if (!secretKey) {
  console.warn('RECAPTCHA_SECRET_KEY not configured')
  return { success: true } // Pass through
}
```

This allows local testing without keys, but **production should always have keys configured**.

---

## 🐛 Troubleshooting

### Issue: "grecaptcha is not defined"
**Cause**: reCAPTCHA script not loaded yet

**Fix**: Ensure `loadRecaptchaScript()` is called in `useEffect`
```typescript
useEffect(() => {
  loadRecaptchaScript()
}, [])
```

### Issue: "Security verification failed"
**Possible Causes:**
1. **Domain not whitelisted**: Add your domain to reCAPTCHA console
2. **Wrong keys**: Double-check Site Key and Secret Key
3. **HTTPS required**: Production must use HTTPS (Vercel provides this)
4. **Token expired**: Tokens expire after 2 minutes - generate fresh token on submit
5. **Score too low**: User behavior seems bot-like (rare for v3)

**Debug Steps:**
1. Check browser console for errors
2. Check server logs for CAPTCHA response
3. Verify environment variables are set
4. Test with a different browser/incognito mode

### Issue: Forms work locally but fail in production
**Cause**: Environment variables not set in Vercel

**Fix:**
1. Go to Vercel project settings
2. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY`
3. Redeploy your application

---

## 📊 Monitoring CAPTCHA Performance

### Check Score Distribution
Monitor the scores returned by reCAPTCHA to optimize your threshold:

```typescript
// In lib/utils/captcha.ts - add logging
console.log(`CAPTCHA Score: ${score} for action: ${action}`)
```

### Analyze Results
- **Most scores 0.8-1.0**: Threshold too low, can increase to 0.6-0.7
- **Many scores 0.3-0.5**: Keep threshold at 0.5 or lower
- **High rejection rate**: Lower threshold or check for UX issues

---

## ✅ Verification Checklist

Before deploying to production:

- [ ] reCAPTCHA keys obtained from Google
- [ ] Domain added to reCAPTCHA whitelist
- [ ] Environment variables set in `.env.local`
- [ ] Environment variables set in Vercel
- [ ] Contact form tested and working
- [ ] Newsletter form integrated (if applicable)
- [ ] Service inquiry form integrated (if applicable)
- [ ] HTTPS enabled in production
- [ ] CAPTCHA verification tested in production
- [ ] No console errors in browser
- [ ] Server logs show successful verification

---

## 📚 Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## 🎉 Benefits

### Spam Protection
- Blocks automated bot submissions
- No user interaction required (v3 is invisible)
- Reduces database pollution

### Better UX
- No CAPTCHA challenges for users
- Seamless form submission
- Fast verification (< 100ms)

### Security
- Prevents brute force attacks
- Detects suspicious patterns
- Protects against DDoS via forms

---

**Last Updated**: July 17, 2026  
**Status**: Contact form integrated, newsletter and service inquiry pending frontend
