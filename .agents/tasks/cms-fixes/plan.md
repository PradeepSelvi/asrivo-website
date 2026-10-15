# Implementation Plan — Asrivo Tech CMS Fixes

**Project:** `c:\Users\Dell\OneDrive\Documents\GitHub\asrivo-website`  
**Stack:** Next.js 14 App Router + Supabase  
**Build/verify:** `pnpm run type-check` then `pnpm run build`

---

## Decomposition Decision

The 9 fixes group into 3 independently-implementable features:

- **FEAT-001** (data integrity) — FIX 1, 2, 4: table-name bugs + missing CSV export route  
- **FEAT-002** (admin settings UI) — FIX 3, 5, 7, 9: homepage form, 6 missing sub-pages, error handling  
- **FEAT-003** (infrastructure + public) — FIX 6, 8: RLS SQL + careers page + navbar link  

FEAT-001 → FEAT-002 → FEAT-003 are ordered for dependency-safety but are in fact independent. The ordering runs them sequentially because they share one worktree.

---

## FEAT-001 — Data Integrity & Missing API Route

### Overview
Three runtime-breaking bugs: inquiries go to the wrong DB table; notifications query a non-existent table; CSV export hits a 404. All three touch existing files or add one new route file.

---

- [ ] 1. **FIX 1 — Redirect service-inquiry POST to `client_inquiries`**  
      Rewrite the POST handler in `app/api/service-inquiry/route.ts` to insert into `client_inquiries` instead of `service_inquiries`. The `client_inquiries` table has required fields (`phone`, `project_description`) that the form already collects. Field mapping:
      - `name` → `name`
      - `company` → `company`
      - `email` → `email`
      - `phone` → `phone` (already in form payload)
      - `service_type` → `project_types` as `[service_type]` (TEXT[])
      - `project_description` → `project_description`
      - `timeline` → `timeline`
      - `budget` → `budget_range`
      - `status` → `'new'`
      - All other `client_inquiries` columns (`whatsapp`, `preferred_contact`, `has_existing`, `target_platform`, `key_features`, `target_audience`, `pain_points`, `reference_links`, `hear_about_us`) → `null` or column default.
      Also update the GET handler in the same file to query `client_inquiries` instead of `service_inquiries`.  
      Keep the captcha and service_type validation logic unchanged.  
      Files: `app/api/service-inquiry/route.ts`  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 2. **FIX 2 — Fix `partnership_requests` → `partnerships` in notifications**  
      In `app/api/admin/notifications/route.ts` (~line 144): change `supabase.from('partnership_requests')` to `supabase.from('partnerships')`. The query columns `company_name`, `contact_person`, `created_at`, `status` are confirmed correct for the `partnerships` table from the existing notifications page.  
      In `app/admin/(dashboard)/notifications/page.tsx` (~line 42, inside the `Promise.all` array): change `supabase.from('partnership_requests')` to `supabase.from('partnerships')`.  
      Files: `app/api/admin/notifications/route.ts`, `app/admin/(dashboard)/notifications/page.tsx`  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 3. **FIX 4 — Create missing subscribers CSV export API route**  
      Create `app/api/subscribers/export/route.ts` as a GET handler that:
      1. Creates a Supabase server client via `createClient()` from `@/lib/supabase/server`
      2. Queries `newsletter_subscribers` selecting `id, email, name, status, created_at` ordered by `created_at` descending
      3. Builds a CSV string with header `id,email,name,status,subscribed_date` and one quoted row per subscriber
      4. Returns `new NextResponse(csvString, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=subscribers.csv' } })`  
      Note: `newsletter_subscribers` columns from DATABASE_SCHEMA.sql are `id, email, name, status, created_at` — the existing subscribers page uses these same fields.  
      Files: `app/api/subscribers/export/route.ts` (new file)  
      Verify: `pnpm run type-check && pnpm run build` — passes.

---

## FEAT-002 — Admin Settings UI

### Overview
The homepage settings form is a no-op (no submit handler), 6 of 8 settings sub-pages are 404, and the settings actions crash when `site_settings` table hasn't been applied to Supabase. Fix error handling first, then the homepage form, then the 6 sub-pages.

---

- [ ] 4. **FIX 9 + FIX 5 — Graceful error handling for missing `site_settings` table**  
      In `lib/supabase/settings-actions.ts`:
      - In `getSiteSettings()`: after `const { data, error } = await query`, check if `error?.code === 'PGRST116'` or `error?.message?.includes('does not exist')` — if so, return `{ success: true, data: [] }` instead of throwing. Otherwise keep existing throw.
      - In `getSiteSetting()`: same pattern — on PGRST116, return `{ success: true, data: null }`.  
      This prevents admin UI crashes when the `site_settings` table hasn't been deployed yet.  
      Files: `lib/supabase/settings-actions.ts`  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 5. **FIX 5 — Create site_settings migration instructions doc**  
      Create `supabase/migrations/apply_site_settings_schema.md`. Content must note:
      - Copy `supabase/schema/SITE_SETTINGS_SCHEMA.sql` into Supabase SQL Editor and run
      - The RLS policy in that file references `admin_users` table but the actual table is `admin_profiles` with column `id` (not `user_id`) — replace `admin_users` with `admin_profiles` and `user_id` with `id` in the policy before running  
      Files: `supabase/migrations/apply_site_settings_schema.md` (new file)  
      Verify: File exists with correct content — no TypeScript compilation needed.

- [ ] 6. **FIX 3 — Extract `HomepageSettingsForm` client component**  
      Create `app/admin/(dashboard)/settings/homepage/homepage-settings-form.tsx` as a `'use client'` component. Pattern: identical to `site-settings-form.tsx`.  
      - Props: `{ initialSettings: Record<string, any> }`
      - `handleSubmit`: builds settings array from FormData where each entry maps to `{ category: 'homepage', key, value }`, calls `updateMultipleSettings()` from `lib/supabase/settings-actions`, shows `toast.success`/`toast.error` from `sonner`
      - Form fields (with `name=<key>` and `defaultValue={initialSettings.<key> || '<fallback>'}`):
        - `hero_title` (text input)
        - `hero_subtitle` (textarea)
        - `hero_cta_primary` (text input)
        - `hero_cta_secondary` (text input)
        - `featured_projects_title` (text input)
        - `featured_projects_description` (textarea)
        - `about_title` (text input)
        - `about_description` (textarea)
        - `cta_title` (text input)
        - `cta_description` (textarea)
        - `cta_button` (text input)
      - Save button: sticky bottom bar with Loader2 spinner while loading, `type="submit"`, same markup as `site-settings-form.tsx`  
      Files: `app/admin/(dashboard)/settings/homepage/homepage-settings-form.tsx` (new file)  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 7. **FIX 3 — Rewrite homepage settings page to use the form component**  
      Rewrite `app/admin/(dashboard)/settings/homepage/page.tsx` as a proper server component:
      1. Keep `requireAdmin()` + `role !== 'high'` redirect
      2. Fetch `site_settings` where `category = 'homepage'` (array form, not `.single()`)
      3. Convert array to `settingsMap` via `reduce` + `JSON.parse` — same pattern as `app/admin/(dashboard)/settings/site/page.tsx` lines 28-35
      4. Render page header (keep ArrowLeft, Layout icon, Preview Live button) 
      5. Render `<HomepageSettingsForm initialSettings={settingsMap} />` in place of all the raw `<form>` sections  
      Remove the broken multiple separate `<form>` tags and the non-functional Save button.  
      Files: `app/admin/(dashboard)/settings/homepage/page.tsx`  
      Verify: `pnpm run type-check && pnpm run build` — passes.

- [ ] 8. **FIX 7 — Create Email Settings sub-page**  
      Create two files:
      - `app/admin/(dashboard)/settings/email/page.tsx`: server component, `requireAdmin()` + role check, fetches `site_settings` category=`'email'`, builds settingsMap, renders `<EmailSettingsForm initialSettings={settingsMap} />`
      - `app/admin/(dashboard)/settings/email/email-settings-form.tsx`: `'use client'` component with fields `smtp_host`, `smtp_port`, `smtp_user`, `smtp_from_name`, `smtp_from_email` (all text inputs), calls `updateMultipleSettings` with `category: 'email'`  
      Files: `app/admin/(dashboard)/settings/email/page.tsx`, `app/admin/(dashboard)/settings/email/email-settings-form.tsx` (both new)  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 9. **FIX 7 — Create Theme Settings sub-page**  
      Create two files:
      - `app/admin/(dashboard)/settings/theme/page.tsx`: server component, same auth pattern, fetches category=`'theme'`, renders `<ThemeSettingsForm>`
      - `app/admin/(dashboard)/settings/theme/theme-settings-form.tsx`: `'use client'` component with fields:
        - `primary_color` (type="color" input)
        - `secondary_color` (type="color" input)
        - `accent_color` (type="color" input)
        - `font_heading` (text input with placeholder "Inter")
        - `font_body` (text input with placeholder "Inter")
        - `dark_mode_enabled` (checkbox)  
      Calls `updateMultipleSettings` with `category: 'theme'`. Note: color input `defaultValue` must be the stored hex string; checkbox uses `defaultChecked={initialSettings.dark_mode_enabled === true || initialSettings.dark_mode_enabled === 'true'}`.  
      Files: `app/admin/(dashboard)/settings/theme/page.tsx`, `app/admin/(dashboard)/settings/theme/theme-settings-form.tsx` (both new)  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 10. **FIX 7 — Create Security Settings sub-page**  
      Create two files:
      - `app/admin/(dashboard)/settings/security/page.tsx`: server component, same auth pattern, fetches category=`'security'`, renders `<SecuritySettingsForm>`
      - `app/admin/(dashboard)/settings/security/security-settings-form.tsx`: `'use client'` component with fields:
        - `captcha_enabled` (checkbox)
        - `rate_limit_enabled` (checkbox)
        - `max_requests_per_minute` (type="number" input)
        - `session_timeout` (type="number" input, description: "seconds")
        - `password_min_length` (type="number" input)  
      Calls `updateMultipleSettings` with `category: 'security'`.  
      Files: `app/admin/(dashboard)/settings/security/page.tsx`, `app/admin/(dashboard)/settings/security/security-settings-form.tsx` (both new)  
      Verify: `pnpm run type-check` — zero errors.

- [ ] 11. **FIX 7 — Create three informational settings sub-pages**  
      Create three server component pages (no forms, no DB writes):
      
      **`app/admin/(dashboard)/settings/media/page.tsx`**  
      - `requireAdmin()`, show card explaining media is in Supabase Storage
      - List links to `/admin/projects`, `/admin/team`, `/admin/services` for image management
      - Informational note about Storage bucket access via Supabase dashboard
      
      **`app/admin/(dashboard)/settings/database/page.tsx`**  
      - `requireAdmin()`, show informational cards listing all known tables with their purpose
      - Tables: contacts, client_inquiries, service_inquiries, projects, team_members, services, testimonials, job_postings, job_applications, newsletter_subscribers, consultation_requests, partnerships, complaints, admin_profiles, user_profiles, crm_leads, crm_deals, crm_activities, crm_tasks, crm_tasks, site_settings
      - Instructions to access Supabase dashboard for backup/export
      
      **`app/admin/(dashboard)/settings/advanced/page.tsx`**  
      - `requireAdmin()`, show env var status using `process.env[key] ? '✅ Set' : '❌ Not set'`
      - Variables to check: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_ABSTRACT_API_KEY`
      - **Never display the actual values** — only presence/absence  
      
      Files: `app/admin/(dashboard)/settings/media/page.tsx`, `app/admin/(dashboard)/settings/database/page.tsx`, `app/admin/(dashboard)/settings/advanced/page.tsx` (all new)  
      Verify: `pnpm run type-check && pnpm run build` — all 8 settings routes compile cleanly.

---

## FEAT-003 — Infrastructure Fixes & Public Careers Page

### Overview
The consultation_requests RLS policies in Supabase reference `profiles.role` which doesn't exist (should be `admin_profiles.id`). Also the job_postings CMS has no public-facing page. This feature creates the SQL fix files and the careers page.

---

- [ ] 12. **FIX 6 — Create consultation_requests RLS fix migration**  
      Create `supabase/migrations/fix_consultation_rls.sql` with:
      ```sql
      -- Drop broken policies that reference non-existent 'profiles' table
      DROP POLICY IF EXISTS "Admins can view all consultation requests" ON consultation_requests;
      DROP POLICY IF EXISTS "Admins can update consultation requests" ON consultation_requests;

      -- Create correct policies referencing admin_profiles
      CREATE POLICY "Admins can view all consultation requests"
        ON consultation_requests FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.id = auth.uid()
          )
        );

      CREATE POLICY "Admins can update consultation requests"
        ON consultation_requests FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.id = auth.uid()
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.id = auth.uid()
          )
        );
      ```
      Create `supabase/migrations/fix_consultation_rls.md` with instructions to run the above SQL in Supabase SQL Editor.  
      Files: `supabase/migrations/fix_consultation_rls.sql`, `supabase/migrations/fix_consultation_rls.md` (both new)  
      Verify: Files created with correct SQL content. No TypeScript impact.

- [ ] 13. **FIX 8 — Create public `/careers` page**  
      Create `app/careers/page.tsx` as a server component:
      - Export `dynamic = 'force-dynamic'`, `revalidate = 0`
      - Export metadata `{ title: 'Careers - Asrivo Tech', description: '...' }`
      - Query: `supabase.from('job_postings').select('id, title, slug, description, requirements, salary_range, location, employment_type, experience_level, active, created_at').eq('active', true).order('created_at', { ascending: false })`
      - Visual style: match `app/about/page.tsx` and `app/services/page.tsx` — use `bg-slate-50` body, `text-slate-900` headings, `text-blue-600` accents, `rounded-2xl border border-slate-100 shadow-lg` cards
      - Hero section: title "Join Our Team", subtitle about careers at Asrivo Tech
      - Job cards showing:
        - Job title (`font-bold text-slate-900 text-xl`)
        - `employment_type` badge (e.g., "Full-time") and `experience_level` badge
        - Location with `MapPin` icon (from lucide-react), salary in green if present
        - `description` with `line-clamp-3`
        - First 4 `requirements` as bullet points (if requirements array is not empty)
        - "Apply Now" `<Link>` button (→ `/contact?subject=Job Application: ${encodeURIComponent(job.title)}`) styled with blue background
      - Empty state when no active jobs: card with "No Open Positions Right Now" heading and suggestion to check back or contact via the contact page  
      Files: `app/careers/page.tsx` (new file)  
      Verify: `pnpm run type-check && pnpm run build` — `/careers` route compiles.

- [ ] 14. **FIX 8 — Add Careers link to public navbar**  
      In `components/header.tsx`, locate the `navigation` array (top of file, lines ~10-16):
      ```ts
      const navigation = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Team", href: "/team" },
        { name: "Projects", href: "/projects" },
        { name: "Contact", href: "/contact" },
      ]
      ```
      Add `{ name: "Careers", href: "/careers" }` after the `Projects` entry.  
      Files: `components/header.tsx`  
      Verify: `pnpm run type-check && pnpm run build` — zero errors, Careers appears in nav.

---

## Ordering dependencies

| Step | Depends on |
|---|---|
| 1 (FIX 1) | none |
| 2 (FIX 2) | none |
| 3 (FIX 4) | none |
| 4 (FIX 9+5 error handling) | none |
| 5 (FIX 5 migration doc) | none |
| 6 (homepage form component) | Step 4 (error handling must be in place) |
| 7 (homepage page.tsx) | Step 6 |
| 8, 9, 10 (email/theme/security pages) | Step 4 |
| 11 (media/database/advanced pages) | none |
| 12 (RLS SQL) | none |
| 13 (careers page) | none |
| 14 (navbar) | Step 13 |

Steps 1–3 (FEAT-001) and steps 12–14 (FEAT-003) are fully independent of FEAT-002 and of each other.
