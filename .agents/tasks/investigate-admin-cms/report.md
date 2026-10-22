# Admin & CMS Investigation Report
**Project:** Asrivo Tech Website (`c:\Users\Dell\OneDrive\Documents\GitHub\asrivo-website`)  
**Stack:** Next.js 14 (App Router) + Supabase (PostgreSQL + Auth + Storage)  
**Date:** Investigation complete

---

## Summary Answer

The admin panel at `/admin/(dashboard)` is **substantially built and functional** — most pages connect to real Supabase tables and perform genuine CRUD operations. The CMS panel (Projects, Services, Team, Testimonials, Jobs) is **fully wired to the database** with complete create/edit/delete/reorder flows. However, there are **5 specific critical gaps**:

1. **Homepage Settings form has no `onSubmit` handler** — the Save button does nothing.
2. **6 Settings sub-pages are missing entirely** (Media, Theme, Email, Security, Database, Advanced) — the Settings index links to them but they 404.
3. **Table name mismatch in Notifications API** — queries `partnership_requests` but the actual table is `partnerships`.
4. **`service_inquiries` vs `client_inquiries` split** — the API route and admin `content-actions.ts` disagree on which table name to use for inquiries.
5. **`site_settings` table may not be deployed** — the Homepage Settings page queries it with `.single()` but the schema SQL is in `supabase/schema/SITE_SETTINGS_SCHEMA.sql` and there is no evidence it was applied.

---

## Section A: Complete Page/Route Inventory

### Public Pages (`app/`)

| Route | File |
|---|---|
| `/` | `app/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/contact` | `app/contact/page.tsx` |
| `/services` | `app/services/page.tsx` |
| `/services/digital-...` | `app/services/digital-.../page.tsx` |
| `/services/inquiry` | `app/services/inquiry/page.tsx` |
| `/projects` | `app/projects/page.tsx` |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` |
| `/team` | `app/team/page.tsx` |
| `/testimonials` | `app/testimonials/page.tsx` |
| `/testimonials/submit` | `app/testimonials/submit/page.tsx` |
| `/book-consult` | `app/book-consult/page.tsx` |
| `/book-consult/schedule` | sub-page |
| `/book-consult/checkout` | sub-page |
| `/book-consult/success` | sub-page |
| `/complaints/new` | `app/complaints/new/page.tsx` |
| `/partnership` | `app/partnership/page.tsx` |
| `/partnership/status` | `app/partnership/status/page.tsx` |
| `/partnership-policy` | `app/partnership-policy/page.tsx` |
| `/schedule` | `app/schedule/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/register` | `app/register/page.tsx` |
| `/profile` | `app/profile/page.tsx` |
| `/profile/settings` | `app/profile/settings/page.tsx` |
| `/settings` | `app/settings/page.tsx` |
| `/privacy` | `app/privacy/page.tsx` |
| `/terms` | `app/terms/page.tsx` |

### Admin Pages (`app/admin/(dashboard)/`)

| Route | File | Status |
|---|---|---|
| `/admin` | `page.tsx` | ✅ Full — live DB stats |
| `/admin/projects` | `projects/page.tsx` | ✅ Full — DnD table |
| `/admin/projects/new` | `projects/new/page.tsx` | ✅ Full — form → DB |
| `/admin/projects/[id]/edit` | `edit/page.tsx` | ✅ Full |
| `/admin/projects/[id]/delete` | `delete/page.tsx` | ✅ Full |
| `/admin/services` | `services/page.tsx` | ✅ Full — DnD table |
| `/admin/services/new` | `services/new/page.tsx` | ✅ Full |
| `/admin/services/[id]/edit` | ✅ Full | |
| `/admin/services/[id]/delete` | ✅ Full | |
| `/admin/team` | `team/page.tsx` | ✅ Full — DnD list |
| `/admin/team/new` | ✅ Full | |
| `/admin/team/[id]/edit` | ✅ Full | |
| `/admin/team/[id]/delete` | ✅ Full | |
| `/admin/testimonials` | `testimonials/page.tsx` | ✅ Full — DnD table |
| `/admin/testimonials/new` | ✅ Full | |
| `/admin/testimonials/[id]/edit` | ✅ Full | |
| `/admin/testimonials/[id]/delete` | ✅ Full | |
| `/admin/jobs` | `jobs/page.tsx` | ✅ Full |
| `/admin/jobs/new` | ✅ Full | |
| `/admin/jobs/[id]/edit` | ✅ Full | |
| `/admin/jobs/[id]/delete` | ✅ Full | |
| `/admin/contacts` | `contacts/page.tsx` | ✅ Full — real-time |
| `/admin/contacts/[id]` | ✅ Full | |
| `/admin/inquiries` | `inquiries/page.tsx` | ✅ Full — reads `client_inquiries` |
| `/admin/inquiries/[id]` | ✅ Full | |
| `/admin/consultations` | `consultations/page.tsx` | ✅ Full — reads `consultation_requests` |
| `/admin/consultations/[id]` | ✅ Full | |
| `/admin/complaints` | `complaints/page.tsx` | ✅ Full |
| `/admin/complaints/[id]` | ✅ Full | |
| `/admin/partnerships` | `partnerships/page.tsx` | ✅ Full — reads `partnerships` table |
| `/admin/applications` | `applications/page.tsx` | ✅ Full — reads `job_applications` |
| `/admin/subscribers` | `subscribers/page.tsx` | ✅ Full — reads `newsletter_subscribers` |
| `/admin/crm` | `crm/page.tsx` | ✅ Full — reads `crm_leads`, `crm_deals`, `crm_tasks` |
| `/admin/crm/leads` | ✅ Full | |
| `/admin/crm/leads/[id]` | ✅ Full | |
| `/admin/crm/leads/new` | ✅ Full | |
| `/admin/crm/deals` | ✅ Full | |
| `/admin/crm/deals/[id]` | ✅ Full | |
| `/admin/crm/deals/new` | ✅ Full | |
| `/admin/crm/activities` | ✅ Full | |
| `/admin/crm/tasks` | ✅ Full | |
| `/admin/crm/settings` | ✅ Full | |
| `/admin/notifications` | `notifications/page.tsx` | ⚠️ Bug — queries wrong table name |
| `/admin/admins` | `admins/page.tsx` | ✅ Full — role-gated |
| `/admin/admins/add` | ✅ Full | |
| `/admin/admins/[id]/change-role` | ✅ Full | |
| `/admin/admins/[id]/remove` | ✅ Full | |
| `/admin/settings` | `settings/page.tsx` | ✅ Index page — links to 8 sub-pages |
| `/admin/settings/site` | ✅ Full — form saves to `site_settings` |
| `/admin/settings/homepage` | ⚠️ Stub — form fields exist but no submit handler |
| `/admin/settings/media` | ❌ Missing — 404 |
| `/admin/settings/theme` | ❌ Missing — 404 |
| `/admin/settings/email` | ❌ Missing — 404 |
| `/admin/settings/security` | ❌ Missing — 404 |
| `/admin/settings/database` | ❌ Missing — 404 |
| `/admin/settings/advanced` | ❌ Missing — 404 |

### API Routes (`app/api/`)

| Route | Methods | DB Table |
|---|---|---|
| `/api/admin/login` | POST | `admin_profiles` (auth) |
| `/api/admin/notifications` | GET | `contacts`, `client_inquiries`, `consultation_requests`, `job_applications`, `partnership_requests` ⚠️, `complaints` |
| `/api/admin/notifications/[id]` | GET/PATCH | — |
| `/api/admin/notifications/mark-all-read` | POST | — |
| `/api/admin/send-notification-email` | POST | email |
| `/api/complaints` | GET/POST | `complaints` |
| `/api/complaints/[id]` | GET/PATCH/DELETE | `complaints` |
| `/api/complaints/status` | PATCH | `complaints` |
| `/api/complaints/upload` | POST | Supabase Storage |
| `/api/consultations` | GET/POST | `consultation_requests` |
| `/api/consultations/[id]` | GET/PATCH | `consultation_requests` |
| `/api/consultations/status` | PATCH | `consultation_requests` |
| `/api/contacts` | GET/POST | `contacts` |
| `/api/contacts/[id]` | GET/PATCH/DELETE | `contacts` |
| `/api/inquiries` | POST | `client_inquiries` |
| `/api/inquiries/status` | PATCH | `client_inquiries` |
| `/api/job-application` | POST | `job_applications` |
| `/api/newsletter` | POST | `newsletter_subscribers` |
| `/api/partnerships` | GET/POST | `partnerships` |
| `/api/partnerships/[id]` | GET/PATCH/DELETE | `partnerships` |
| `/api/partnerships/check` | GET | `partnerships` |
| `/api/partnerships/download/[path]` | GET | Supabase Storage |
| `/api/partnerships/upload` | POST | Supabase Storage |
| `/api/profile/upload-image` | POST | Supabase Storage |
| `/api/schedule` | POST | `consultation_requests` |
| `/api/send-status-email` | POST | email |
| `/api/service-inquiry` | POST | `service_inquiries` ⚠️ |
| `/api/settings` | GET/POST | `settings` |
| `/api/testimonials` | GET/POST | `testimonials` |
| `/api/upload` | POST | Supabase Storage |

---

## Section B: Admin Pages That Are Incomplete/Stub/Broken

### 1. `/admin/settings/homepage` — **Stub (no submit action)**
**File:** `app/admin/(dashboard)/settings/homepage/page.tsx`  
The page renders forms for Hero Section, Featured Projects, About Section, and CTA Section. All `<form>` elements are plain HTML with no `action` server action and no `onSubmit` client handler. The "Save Changes" button is a `<Button>` with no `type="submit"` inside a `<form>`, and no `onClick`. **Clicking Save does nothing.**

### 2. `/admin/settings/media`, `/theme`, `/email`, `/security`, `/database`, `/advanced` — **All 404**
**File:** The Settings index page (`settings/page.tsx`) lists 8 sections, but only `site/` and `homepage/` directories exist under `app/admin/(dashboard)/settings/`. Six links lead to 404 errors.

### 3. `/admin/notifications` — **Table name bug**
**File:** `app/admin/(dashboard)/notifications/page.tsx` line ~42  
Queries `supabase.from('partnership_requests')` but the deployed table is `partnerships`. This causes the Partnerships section of the Notifications page to silently return 0 items or error. The same bug exists in `app/api/admin/notifications/route.ts` line ~90.

---

## Section C: CMS Panel Status

The CMS panel covers content that admins manage to reflect on the public site. Here is the complete status:

### ✅ Fully Working CMS Features

| Feature | Admin Page | Server Actions | DB Table | Public Reflection |
|---|---|---|---|---|
| Projects CRUD | `/admin/projects` | `createProject`, `updateProject`, `deleteProject` in `lib/supabase/content-actions.ts` | `projects` | `/projects`, `/projects/[slug]` |
| Projects Reorder (drag-drop) | same | `reorderProjects` | `projects.display_order` | ✅ |
| Services CRUD | `/admin/services` | `createService`, `updateService`, `deleteService` | `services` | `/services` |
| Services Reorder | same | `reorderServices` | `services.display_order` | ✅ |
| Team CRUD | `/admin/team` | `createTeamMember`, `updateTeamMember`, `deleteTeamMember` | `team_members` | `/team` |
| Team Reorder | same | `reorderTeam` | `team_members.display_order` | ✅ |
| Testimonials CRUD | `/admin/testimonials` | `createTestimonial`, `updateTestimonial`, `deleteTestimonial` | `testimonials` | `/testimonials` |
| Testimonials Reorder | same | `reorderTestimonials` | `testimonials.display_order` | ✅ |
| Jobs (postings) CRUD | `/admin/jobs` | `createJobPosting`, `updateJobPosting`, `deleteJobPosting` | `job_postings` | (careers page, if exists) |
| Site Settings | `/admin/settings/site` | `updateMultipleSettings` in `lib/supabase/settings-actions.ts` | `site_settings` | Used by `lib/utils/get-site-settings.ts` |
| Contacts Management | `/admin/contacts` | `updateContactStatus`, `deleteContact` | `contacts` | n/a (inbox) |
| Inquiries Management | `/admin/inquiries` | `updateInquiryStatus`, `updateInquiryNotes` | `client_inquiries` | n/a (inbox) |
| Consultations Management | `/admin/consultations` | via API: `/api/consultations/[id]` | `consultation_requests` | n/a (inbox) |
| Complaints Management | `/admin/complaints` | via API | `complaints` | n/a (inbox) |
| Partnerships Management | `/admin/partnerships` | via API | `partnerships` | n/a (inbox) |
| Job Applications | `/admin/applications` | direct Supabase client | `job_applications` | n/a (inbox) |
| Newsletter Subscribers | `/admin/subscribers` | direct Supabase client | `newsletter_subscribers` | n/a (inbox) |
| Admin Management | `/admin/admins` | `addAdmin`, `removeAdmin`, `updateAdminRole` | `admin_profiles` | auth |
| CRM Leads | `/admin/crm/leads` | full CRUD in `lib/supabase/crm-actions.ts` | `crm_leads` | n/a |
| CRM Deals | `/admin/crm/deals` | full CRUD | `crm_deals` | n/a |
| CRM Activities | `/admin/crm/activities` | full CRUD | `crm_activities` | n/a |
| CRM Tasks | `/admin/crm/tasks` | full CRUD | `crm_tasks` | n/a |

### ⚠️ Broken/Incomplete CMS Features

| Feature | Issue |
|---|---|
| Homepage Settings | Form renders with hard-coded default values; Save button is a no-op. No server action wired. |
| Settings sub-pages (6 of 8) | Pages don't exist; all 6 links from Settings index 404. |
| Notifications — Partnerships section | Queries `partnership_requests` table; actual table is `partnerships`. Returns empty silently. |

### ❌ Not Present at All

- **Blog / Posts** — No blog CMS. No `blog_posts` table in any schema. No `/admin/blog` page.
- **Media Library** — Settings index links to `/admin/settings/media` but it doesn't exist. No dedicated media browser.
- **Homepage Dynamic Content** — The `site_settings` table stores homepage text but the public `app/page.tsx` reads from it only if `SITE_SETTINGS_SCHEMA.sql` was applied to Supabase. No confirmation this schema was applied.

---

## Section D: Database Schema Summary

### ORM / Database
- **Supabase** (PostgreSQL), **no Prisma**, using `@supabase/supabase-js` directly
- Auth via Supabase Auth (`auth.users` table)
- Admin profiles stored in `admin_profiles` table (custom, not Supabase built-in)

### Models Present (confirmed in schema SQL files)

**Core schema** (`supabase/schema/DATABASE_SCHEMA.sql`):

| Table | Purpose |
|---|---|
| `contacts` | Contact form submissions |
| `service_inquiries` | Service inquiry form (basic version) |
| `projects` | Portfolio projects |
| `team_members` | Team profiles |
| `services` | Service offerings |
| `testimonials` | Client testimonials |
| `job_applications` | Job applications |
| `job_postings` | Open positions |
| `newsletter_subscribers` | Email newsletter signups |
| `settings` | Key-value site settings |
| `audit_logs` | Admin action log |
| `analytics` | Page view analytics |

**Extended schema** (`supabase/schema/CLIENT_INQUIRIES_SCHEMA.sql`):

| Table | Purpose |
|---|---|
| `client_inquiries` | Detailed project inquiry form (more fields than `service_inquiries`) |

**CRM schema** (`supabase/schema/CRM_DATABASE_SCHEMA.sql`):

| Table | Purpose |
|---|---|
| `crm_leads` | Sales leads with scoring |
| `crm_deals` | Pipeline deals |
| `crm_activities` | Interaction log |
| `crm_tasks` | Task management |
| `crm_tags` | Flexible tagging |
| `crm_notes` | Internal notes |
| `crm_email_templates` | Email templates |
| `crm_pipeline_stages` | Pipeline configuration |
| `crm_settings` | CRM-specific config |

**Site settings schema** (`supabase/schema/SITE_SETTINGS_SCHEMA.sql`):

| Table | Purpose |
|---|---|
| `site_settings` | Category/key/JSONB settings for site, homepage, theme, email, security |

**Other schemas** (migrations + schema files):

| Table | Purpose |
|---|---|
| `consultation_requests` | Consultation booking form |
| `partnerships` | Partnership applications |
| `complaints` | Complaint submissions |
| `admin_profiles` | Admin users and roles (high/low) |
| `user_profiles` | Public user profiles |

### Models Missing (referenced in code but no schema found)

| Table Referenced | Where | Issue |
|---|---|---|
| `partnership_requests` | `app/api/admin/notifications/route.ts`, `app/admin/(dashboard)/notifications/page.tsx` | Should be `partnerships`; wrong name used |
| `profiles` | `supabase/schema/CONSULTATION_REQUESTS_SCHEMA.sql` RLS policies | References `profiles.role` but the actual table appears to be `admin_profiles` |

---

## Section E: Specific Issues Found

### Issue 1 — Homepage Settings form is completely non-functional
**File:** `app/admin/(dashboard)/settings/homepage/page.tsx`  
**Severity:** High  
**Detail:** The page is a Server Component that fetches from `site_settings` (with `.single()` which will error if the row doesn't exist). All the form sections (`<form>`) have no `action` or `onSubmit`. The sticky Save button at the bottom renders as `<Button size="lg">` with no event handler. No server action is called. Saving is silently impossible.

### Issue 2 — Six Settings sub-pages missing
**File:** `app/admin/(dashboard)/settings/page.tsx` links to:
- `/admin/settings/media` — directory does not exist
- `/admin/settings/theme` — directory does not exist
- `/admin/settings/email` — directory does not exist
- `/admin/settings/security` — directory does not exist
- `/admin/settings/database` — directory does not exist
- `/admin/settings/advanced` — directory does not exist  

**Severity:** Medium — cosmetically broken but not a runtime crash.

### Issue 3 — Notifications API wrong table name
**Files:**  
- `app/api/admin/notifications/route.ts` line ~90: `supabase.from('partnership_requests')`  
- `app/admin/(dashboard)/notifications/page.tsx` line ~42: `supabase.from('partnership_requests')`  

The actual table is `partnerships`. This causes the Partnerships count to always be 0 in the notifications panel, and may cause a Supabase error log silently.

### Issue 4 — `service_inquiries` vs `client_inquiries` confusion
**Detail:**  
- `app/api/service-inquiry/route.ts` inserts into `service_inquiries` (the simpler table from DATABASE_SCHEMA.sql).  
- `app/api/inquiries/route.ts` inserts into `client_inquiries` (the detailed table from CLIENT_INQUIRIES_SCHEMA.sql).  
- The admin `/admin/inquiries` page reads from `client_inquiries`.  
- `lib/supabase/content-actions.ts` functions `updateInquiryStatus`, `updateInquiryNotes`, `deleteInquiry` all operate on `client_inquiries`.  
- So data submitted via `/services/inquiry` (which hits `/api/service-inquiry`) goes into `service_inquiries` but **never appears in the admin panel** which reads `client_inquiries`.

### Issue 5 — `site_settings` table deployment unknown
**Detail:** The `site_settings` table (with categories for homepage, theme, email, security) is defined in `supabase/schema/SITE_SETTINGS_SCHEMA.sql`. There is no migration file for it in `supabase/migrations/`. The Site Settings admin page (`/admin/settings/site`) calls `getSiteSettings('site')` which will return an empty array if the table doesn't exist, causing the form to load with hard-coded fallback values but fail silently on save. No `.env` contains a migration version flag. **The schema may not have been applied.**

### Issue 6 — RLS Policy mismatch in CONSULTATION_REQUESTS_SCHEMA.sql
**File:** `supabase/schema/CONSULTATION_REQUESTS_SCHEMA.sql`  
**Detail:** The RLS SELECT/UPDATE policies reference `profiles.role` (`'admin'`, `'super_admin'`), but the actual admin system uses `admin_profiles` with roles `'high'` and `'low'`. If these policies are active in production, **no admin can read consultation requests** through the RLS-restricted Supabase client.

### Issue 7 — Subscribers export calls missing API route
**File:** `app/admin/(dashboard)/subscribers/page.tsx`  
The Export CSV button calls `fetch('/api/subscribers/export')`, but `app/api/subscribers/` **does not exist**. (There is `app/admin/(dashboard)/subscribers/export-csv-button.tsx` which is a separate component.) The export will fail with a 404.

### Issue 8 — Environment variables: only 3 set
**File:** `.env`  
Only three keys are configured:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

Missing from `.env` (present in `.env.example`):
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` / `ADMIN_EMAIL` — email notifications will fail silently
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — CAPTCHA disabled
- `NEXT_PUBLIC_ABSTRACT_API_KEY` — email validation disabled on registration

---

## Section F: Recommended Fixes in Priority Order

### Priority 1 — Fix `client_inquiries` vs `service_inquiries` routing (data loss)
The `/services/inquiry` public form submits to `/api/service-inquiry` which writes to `service_inquiries`, but admins only see `client_inquiries`. Either:
- (a) Change `app/api/service-inquiry/route.ts` to insert into `client_inquiries` instead, or  
- (b) Change the admin inquiries page to read from `service_inquiries`.  
Option (a) is preferable since `client_inquiries` has more fields and the admin panel is already built for it.

### Priority 2 — Fix Notifications table name bug
In both `app/api/admin/notifications/route.ts` and `app/admin/(dashboard)/notifications/page.tsx`, change `partnership_requests` → `partnerships`. Two simple find-and-replace changes.

### Priority 3 — Fix Homepage Settings form (wire submit action)
Convert `app/admin/(dashboard)/settings/homepage/page.tsx` from a server component to a client component (or extract a form client component like `site-settings-form.tsx` already is). Wire a submit handler that calls `updateMultipleSettings()` from `lib/supabase/settings-actions.ts` using `category: 'homepage'`.

### Priority 4 — Fix Subscribers CSV export (missing API route)
Create `app/api/subscribers/export/route.ts` that queries `newsletter_subscribers` and returns a CSV file response. The admin page already has the client-side download logic; only the API route is missing.

### Priority 5 — Apply `site_settings` schema to Supabase
Run `supabase/schema/SITE_SETTINGS_SCHEMA.sql` in the Supabase SQL Editor. Then verify the Site Settings form (`/admin/settings/site`) can read and save data.

### Priority 6 — Fix RLS policies in consultation_requests
Run a corrective SQL that replaces the `profiles.role` references with `admin_profiles` checks:
```sql
DROP POLICY "Admins can view all consultation requests" ON consultation_requests;
CREATE POLICY "Admins can view all consultation requests"
  ON consultation_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
```
Same for the UPDATE policy.

### Priority 7 — Add missing Settings sub-pages (stubs → functional)
Create the 6 missing sub-pages. At minimum create stub pages that redirect to `/admin/settings` to avoid 404s. Full implementation order:
1. `/admin/settings/email` — SMTP/notification config (maps to `site_settings` category `email`)
2. `/admin/settings/theme` — color/font config (maps to `site_settings` category `theme`)
3. `/admin/settings/security` — CAPTCHA toggle, rate limiting config
4. `/admin/settings/media` — file/logo manager
5. `/admin/settings/database` — export/backup info page
6. `/admin/settings/advanced` — env variable info page

### Priority 8 — Add email env vars
Add `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ADMIN_EMAIL` to `.env` to enable contact form email notifications. The `lib/mail.ts` already uses nodemailer with these variables.

### Priority 9 — Add a Careers/Jobs public page
`job_postings` is fully managed in the admin panel but there is no public `/careers` or `/jobs` page in `app/`. Create a public listing page that reads active job postings so the CMS round-trip is complete.
