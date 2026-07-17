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
1. Go to Supabase SQL Editor
2. Run `DATABASE_SCHEMA.sql`
3. Run `ADMIN_SETUP_MINIMAL.sql`
4. Run `FIX_RLS.sql`

### 5. Run Development Server
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

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed deployment guide.

## 🗂️ Project Structure

```
asrivo-tech/
├── app/                      # Next.js app directory
│   ├── (public)/            # Public pages
│   ├── admin/               # Admin panel
│   │   ├── login/          # Login page
│   │   └── (dashboard)/    # Dashboard pages
│   ├── api/                # API routes
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   └── layout.tsx          # Root layout
├── lib/                     # Utility libraries
│   ├── auth/               # Auth guards
│   ├── supabase/           # Supabase clients & actions
│   └── utils/              # Utilities (logger, rate-limit)
├── components/              # React components
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware
└── next.config.mjs         # Next.js configuration
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

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Admin Login Status Report](./ADMIN_LOGIN_STATUS_REPORT.md)
- [All Fixes Complete](./ALL_FIXES_COMPLETE.md)
- [Database Schema](./DATABASE_SCHEMA.sql)

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
  "clean": "rm -rf .next node_modules/.cache"
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
