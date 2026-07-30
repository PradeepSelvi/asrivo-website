# Asrivo Tech - Corporate Website & Admin CMS

A modern, production-ready Next.js application with Supabase backend and comprehensive admin panel.

## 🚀 Features

### Public Website
- ✅ Responsive design with modern UI
- ✅ Dynamic content management
- ✅ Project showcase
- ✅ Service pages
- ✅ Team profiles
- ✅ Testimonials
- ✅ Contact forms
- ✅ Newsletter subscription
- ✅ Job postings

### Admin Panel
- ✅ Secure authentication with Supabase
- ✅ Role-based access control (High/Low)
- ✅ Content management for all sections
- ✅ Drag-and-drop reordering
- ✅ Image upload and optimization
- ✅ Real-time updates
- ✅ Activity tracking

### Security
- ✅ Row Level Security (RLS) policies
- ✅ HTTPS enforced
- ✅ Security headers configured
- ✅ Rate limiting on API routes
- ✅ Session management
- ✅ CSRF protection

### Performance
- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Request-level caching
- ✅ Database query optimization

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Supabase account
- Vercel account (for deployment)

## 🏁 Getting Started

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd asrivo-tech
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set Up Database
Run the schema files in the Supabase SQL Editor (located in `supabase/schema/`):
1. `supabase/schema/DATABASE_SCHEMA.sql`
2. `supabase/schema/ADMIN_SETUP_MINIMAL.sql`
3. `supabase/schema/SUPABASE_FUNCTIONS_AND_ADMINS.sql`
4. `supabase/schema/SUPABASE_STORAGE_SETUP.sql`

Then apply incremental migrations from `supabase/migrations/` as needed.
One-off historical fixes and debug scripts are kept in `supabase/archive/` for reference.

### 5. Set Up Storage for Profile Pictures
```bash
pnpm run setup-storage
```

This creates the `user-profiles` storage bucket for avatar and cover images.

**If the automated script doesn't work**, follow manual setup in: `PROFILE-UPLOAD-SETUP.md`

### 6. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Access Admin Panel
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Default admin credentials (change in production):
- Email: `pradeepselvi126@gmail.com`
- Password: Your Supabase auth password

## 📦 Build & Deploy

### Local Build
```bash
pnpm build
pnpm start
```

### Deploy to Vercel
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

Set the environment variables from `.env.production.example` in the Vercel dashboard before deploying.

## 🗂️ Project Structure

```
asrivo-website/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel (login + dashboard route group)
│   ├── api/                 # API routes
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   └── layout.tsx           # Root layout
├── lib/                      # Utility libraries
│   ├── auth/                # Auth guards
│   ├── supabase/            # Supabase clients & actions
│   └── utils/               # Utilities (logger, rate-limit)
├── components/               # React components
├── hooks/                    # Shared React hooks
├── public/                   # Static assets
├── docs/                     # Project documentation
├── scripts/                  # Maintenance/utility scripts
├── supabase/
│   ├── schema/              # Canonical schema definitions
│   ├── migrations/          # Incremental migrations
│   └── archive/             # Historical one-off fixes & debug scripts
├── middleware.ts             # Next.js middleware
└── next.config.mjs          # Next.js configuration
```

## 🔐 Admin Panel Routes

- `/admin` - Dashboard overview
- `/admin/projects` - Manage projects
- `/admin/services` - Manage services
- `/admin/team` - Manage team members
- `/admin/jobs` - Manage job postings
- `/admin/testimonials` - Manage testimonials
- `/admin/contacts` - View contact submissions
- `/admin/inquiries` - View service inquiries
- `/admin/subscribers` - View newsletter subscribers
- `/admin/admins` - Manage admin users (High role only)
- `/admin/settings` - Site settings

## 🧪 Testing

### Type Check
```bash
pnpm type-check
```

### Lint
```bash
pnpm lint
```

### Build Test
```bash
pnpm build
```

## 📚 Documentation

- [Admin Auth Flow](./docs/admin-auth-flow.md)
- [Database Schema Reference](./docs/DATABASE_SCHEMA.md)
- [Canonical SQL Schema](./supabase/schema/)

## 🔧 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "type-check": "tsc --noEmit",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
  "clean": "node -e \"...\"  // cross-platform cache clean"
}
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

### TypeScript Errors in IDE
```bash
# Restart TypeScript server in VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Database Connection Issues
1. Check Supabase URL and keys
2. Verify RLS policies are set up
3. Check admin_profiles table exists

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm type-check && pnpm lint`
4. Submit a pull request

## 📄 License

Private - All rights reserved

## 👥 Team

Developed by Asrivo Tech

## 📞 Support

For support, email admin@asrivotech.com

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: July 16, 2026
