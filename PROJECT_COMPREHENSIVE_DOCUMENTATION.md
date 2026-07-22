# Asrivo Tech - Complete Project Documentation

**Version:** 1.0.0  
**Last Updated:** July 22, 2026  
**Status:** Production Ready ✅

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Security Implementation](#security-implementation)
6. [Database Schema](#database-schema)
7. [CRM System](#crm-system)
8. [Setup & Installation](#setup--installation)
9. [Production Deployment](#production-deployment)
10. [Testing Guide](#testing-guide)
11. [Admin Panel](#admin-panel)
12. [API Documentation](#api-documentation)
13. [Troubleshooting](#troubleshooting)
14. [Maintenance](#maintenance)

---

## Project Overview

Asrivo Tech is a modern, full-stack corporate website with comprehensive content management system (CMS) and Customer Relationship Management (CRM) capabilities. Built with Next.js 16, it provides a professional public-facing website and powerful admin panel for managing all aspects of the business.

### Key Highlights

- **Modern Stack**: Next.js 16 with App Router, React 19, TypeScript 5
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Deployment**: Vercel with automatic deployments
- **Security**: Enterprise-grade security with multiple layers
- **Performance**: Optimized for Core Web Vitals
- **CRM**: Built-in lead and deal management system

### Project Statistics

- **Total Routes**: 48+ pages (12 static, 36 dynamic)
- **Database Tables**: 21+ tables
- **API Endpoints**: 15+ REST endpoints
- **Admin Features**: 10+ management modules
- **Security Score**: 76% (Good)
- **Build Time**: ~15 seconds
- **TypeScript Coverage**: 100%

---

## Tech Stack

### Frontend

**Core Framework**
- Next.js 16.0.10 (App Router)
- React 19.2 (Server Components)
- TypeScript 5

**Styling & UI**
- Tailwind CSS 4.1.9
- Radix UI (30+ components)
- Lucide React (icons)
- next-themes (dark mode)

**Forms & Validation**
- react-hook-form 7.60
- Zod 3.25 (schema validation)
- input-otp (OTP inputs)

**Rich Features**
- react-markdown (content rendering)
- Leaflet + react-leaflet (maps)
- @hello-pangea/dnd (drag-and-drop)
- recharts (charts)
- embla-carousel (carousels)

### Backend

**Database & Auth**
- Supabase 2.110 (PostgreSQL)
- @supabase/ssr (server-side auth)
- Row Level Security (RLS)

**Email & Communication**
- Resend 6.17 (email service)
- Nodemailer 8.0 (backup email)

**Analytics & Monitoring**
- @vercel/analytics 1.3
- Production logger utility
- Error boundary system

### Development Tools

**Code Quality**
- ESLint 9.18 (Next.js config)
- TypeScript strict mode
- Prettier (formatting)

**Build & Deploy**
- Turbopack (development)
- Vercel (deployment)
- pnpm (package manager)

---

## Architecture

### Application Structure

```
asrivo-tech/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public pages
│   │   ├── page.tsx            # Homepage
│   │   ├── about/              # About page
│   │   ├── services/           # Services & inquiry
│   │   ├── projects/           # Project showcase
│   │   ├── team/               # Team profiles
│   │   ├── contact/            # Contact form
│   │   ├── book-consult/       # Consultation booking
│   │   └── ...
│   ├── admin/                   # Admin panel
│   │   ├── login/              # Admin authentication
│   │   └── (dashboard)/        # Protected admin routes
│   │       ├── page.tsx        # Dashboard
│   │       ├── projects/       # Project management
│   │       ├── services/       # Service management
│   │       ├── team/           # Team management
│   │       ├── jobs/           # Job posting management
│   │       ├── testimonials/   # Testimonial management
│   │       ├── contacts/       # Contact submissions
│   │       ├── inquiries/      # Service inquiries
│   │       ├── consultations/  # Consultation requests
│   │       ├── crm/            # CRM system
│   │       ├── admins/         # Admin user management
│   │       └── settings/       # Site settings
│   ├── api/                     # API routes
│   │   ├── contacts/           # Contact form API
│   │   ├── inquiries/          # Inquiry API
│   │   ├── newsletter/         # Newsletter API
│   │   ├── consultations/      # Consultation API
│   │   ├── testimonials/       # Testimonial API
│   │   └── upload/             # File upload API
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout
│   └── sitemap.ts              # Dynamic sitemap
├── components/                  # React components
│   ├── admin/                  # Admin-specific components
│   ├── home/                   # Homepage sections
│   ├── ui/                     # Reusable UI components
│   └── ...
├── lib/                         # Utility libraries
│   ├── auth/                   # Authentication guards
│   ├── supabase/               # Supabase clients & actions
│   ├── crm/                    # CRM utilities
│   └── utils/                  # Helper functions
├── public/                      # Static assets
├── middleware.ts               # Next.js middleware
├── next.config.mjs             # Next.js configuration
└── package.json                # Dependencies
```

### Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─> Public Pages (SSR/SSG)
       │   └─> Supabase Client (anon key)
       │
       ├─> API Routes
       │   └─> Server Actions
       │       └─> Supabase Server (service role key)
       │
       └─> Admin Panel
           └─> Middleware (auth check)
               └─> Admin Routes
                   └─> Server Actions (role check)
                       └─> Supabase Server
                           └─> PostgreSQL Database
```

### Security Layers

1. **Network Layer**: HTTPS, security headers, CORS
2. **Application Layer**: Middleware authentication
3. **Authorization Layer**: Role-based access control
4. **Data Layer**: Row Level Security (RLS) policies
5. **Input Layer**: Validation and sanitization

---

## Features

### Public Website

#### 1. Homepage
- Hero section with CTA
- About preview
- Services overview
- Featured projects
- Team introduction
- Client testimonials
- Newsletter signup
- Contact section

#### 2. Services
- Service categories
- Detailed service pages
- Service inquiry form (4-step wizard)
- Project type selection
- Budget and timeline estimation
- Reference links

#### 3. Projects
- Project showcase grid
- Drag-and-drop ordering
- Project detail pages
- Technology stack display
- Live demo links
- Case studies

#### 4. Team
- Team member profiles
- Role and bio display
- Social media links
- Drag-and-drop ordering

#### 5. Contact & Forms
- Contact form with validation
- WhatsApp integration
- Email notifications
- Status tracking
- Form persistence (auto-save)
- CAPTCHA protection

#### 6. Consultation Booking
- Multi-step booking form
- Date/time selection
- Service type selection
- Status checker
- Email confirmations

#### 7. Job Board
- Active job listings
- Job detail pages
- Application form
- Resume upload
- Application tracking

### Admin Panel

#### 1. Dashboard
- Key metrics overview
- Recent activity feed
- Quick actions
- Stat cards
- Real-time updates

#### 2. Content Management
**Projects**
- Create, edit, delete projects
- Image upload (Supabase Storage)
- Featured project toggle
- Drag-and-drop reordering
- Technology stack management

**Services**
- Service CRUD operations
- Icon selection
- Active/inactive toggle
- Display order management

**Team Members**
- Add/edit team members
- Profile image upload
- Social links
- Role assignment
- Display order

**Job Postings**
- Create job listings
- Job type classification
- Application tracking
- Active/inactive status

**Testimonials**
- Client testimonial management
- Star rating system
- Featured toggle
- Display order

#### 3. Communication Management
**Contacts**
- View all contact submissions
- Status management (new, contacted, resolved)
- Internal notes
- Email integration

**Service Inquiries**
- View detailed inquiries
- Budget and timeline info
- Project requirements
- PRD file downloads
- Status pipeline
- Convert to CRM lead

**Consultations**
- Consultation requests
- Schedule management
- Status tracking
- Client communication

**Newsletter Subscribers**
- Subscriber list
- Email campaign management
- Export to CSV

#### 4. CRM System (Complete)