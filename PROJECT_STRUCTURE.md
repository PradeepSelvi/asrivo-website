# Asrivo Tech Website - Project Structure

## 📁 Directory Organization

```
asrivo-website/
├── app/                           # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages (login, register)
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── (dashboard)/          # Dashboard layout group
│   │   │   ├── admins/          # Admin management
│   │   │   ├── applications/     # Job applications
│   │   │   ├── complaints/       # Customer complaints
│   │   │   ├── consultations/    # Consultation requests
│   │   │   ├── contacts/        # Contact form submissions
│   │   │   ├── inquiries/       # Service inquiries
│   │   │   ├── jobs/            # Job postings
│   │   │   ├── newsletters/     # Newsletter subscriptions
│   │   │   ├── partnerships/    # Partnership requests
│   │   │   ├── projects/        # Project management
│   │   │   ├── schedule/        # Scheduled meetings
│   │   │   ├── services/        # Services management
│   │   │   ├── settings/        # Admin settings (CMS, site config)
│   │   │   ├── team/            # Team member management
│   │   │   └── testimonials/    # Testimonial management
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── applications/        # Job application handling
│   │   ├── auth/                # Authentication
│   │   ├── complaints/          # Complaint submissions
│   │   ├── consultations/       # Consultation booking
│   │   ├── contacts/            # Contact form
│   │   ├── inquiries/           # Service inquiries
│   │   ├── newsletter/          # Newsletter signup
│   │   ├── partnerships/        # Partnership requests
│   │   ├── projects/            # Project operations
│   │   ├── schedule/            # Meeting scheduling
│   │   ├── services/            # Service operations
│   │   ├── status/              # Status lookup
│   │   ├── team/                # Team operations
│   │   ├── testimonials/        # Testimonial operations
│   │   └── upload/              # File uploads
│   ├── apply/                    # Job application page
│   ├── book-consult/             # Consultation booking page
│   ├── careers/                  # Careers/jobs listing page
│   ├── contact/                  # Contact page
│   ├── projects/                 # Projects showcase
│   ├── services/                 # Services pages
│   │   ├── inquiry/             # Service inquiry form
│   │   └── [slug]/              # Individual service pages
│   ├── status/                   # Request status tracking
│   ├── team/                     # Team page
│   └── page.tsx                  # Homepage
│
├── components/                   # React components
│   ├── admin/                   # Admin-specific components
│   ├── home/                    # Homepage sections
│   ├── services/                # Service components
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   └── [various components]     # Shared components
│
├── config/                       # Configuration files
│   ├── company.ts               # Company information
│   ├── services.ts              # Service definitions
│   └── team.ts                  # Team member data
│
├── docs/                         # Documentation
│   └── ARCHITECTURE.md          # System architecture
│
├── hooks/                        # Custom React hooks
│
├── lib/                          # Library code
│   ├── supabase/                # Supabase client & helpers
│   ├── utils/                   # Utility functions
│   ├── constants.ts             # App constants
│   └── types/                   # TypeScript type definitions
│
├── public/                       # Static assets
│   ├── team/                    # Team member photos
│   ├── projects/                # Project images
│   └── [other assets]           # Icons, logos, etc.
│
├── scripts/                      # Utility scripts
│
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   └── schema/                  # Database schema definitions
│
└── [config files]                # Next.js, TypeScript, etc.
```

---

## 🗄️ Database Structure

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|-------------|
| `admin_profiles` | Admin user management | Role-based access, super_admin flag |
| `page_content` | CMS for all pages | Flexible key-value content storage |
| `services` | Service catalog | Dynamic service management |
| `projects` | Portfolio/case studies | Featured projects with images |
| `team_members` | Team roster | With photos, social links, reorderable |
| `testimonials` | Client testimonials | Visible/hidden, reorderable |
| `job_postings` | Job listings | Active/inactive status |
| `job_applications` | Job applications | With document storage |
| `contacts` | Contact form | With type categorization |
| `service_inquiries` | Service requests | Lead management |
| `consultation_requests` | Consultation bookings | With preferred dates |
| `complaints` | Complaint tracking | With status workflow |
| `partnerships` | Partnership requests | With document storage |
| `newsletter_subscriptions` | Email list | Double opt-in ready |
| `user_profiles` | Public user profiles | For job applicants |
| `status_tokens` | Secure status lookup | Email-based OTP system |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage |
| **Authentication** | Supabase Auth |
| **Email** | Resend |
| **Deployment** | Vercel (recommended) |

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all Supabase tables
- ✅ Rate limiting on all public API routes
- ✅ Secure file upload with allowlist validation
- ✅ Email OTP for status lookup (no exposed tokens)
- ✅ Server-side validation for all forms
- ✅ CSRF protection via Next.js
- ✅ Environment variable security

---

## 📄 Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Auth middleware for protected routes |
| `next.config.mjs` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `components.json` | shadcn/ui configuration |
| `.env.local` | Environment variables (local dev) |
| `WEBSITE_AUDIT_COMPLETION_REPORT.md` | Full audit & status report |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (preferred) or npm
- Supabase account
- Resend account (for emails)

### Setup
```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase & Resend keys to .env.local

# Run development server
pnpm dev
```

### Database Setup
1. Create a new Supabase project
2. Run migrations in `supabase/migrations/` in order
3. Run schema files in `supabase/schema/`
4. Configure storage buckets (team-photos, user-profiles, etc.)

---

## 📝 Development Workflow

### Adding a New Page
1. Create route in `app/[page-name]/page.tsx`
2. Add content fields in CMS (admin panel or migration)
3. Create components in `components/`
4. Add metadata for SEO

### Adding a New Admin Feature
1. Create route in `app/admin/(dashboard)/[feature]/`
2. Add API routes in `app/api/[feature]/`
3. Create Supabase table with RLS policies
4. Add admin components in `components/admin/`

### Modifying Database
1. Create new migration file in `supabase/migrations/`
2. Test locally
3. Apply to production via Supabase dashboard

---

## 🔧 Maintenance

### Regular Tasks
- Update team photos as needed
- Add/update projects and testimonials
- Review and respond to inquiries/contacts
- Manage job postings and applications
- Monitor complaint status

### CMS Management
All content can be edited via Admin Dashboard > Settings > Page Content

---

## 📞 Support

For technical issues or questions, contact the development team.

---

**Last Updated**: October 16, 2026  
**Version**: 1.0.0
