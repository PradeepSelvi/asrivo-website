# Database Schema Documentation

## Overview

This document describes the complete database schema for the Asrivo Tech website built with Supabase and Next.js.

## Tables

### 1. **contacts** 
- **Purpose**: Store general contact form submissions
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `email` (TEXT): Visitor's email
  - `name` (TEXT): Visitor's name
  - `message` (TEXT): Message content
  - `company` (TEXT): Company name (optional)
  - `phone` (TEXT): Phone number (optional)
  - `subject` (TEXT): Message subject (optional)
  - `status` (TEXT): 'unread', 'read', 'responded' (default: 'unread')
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: created_at, email, status
- **RLS**: Public can insert, authenticated users can read

---

### 2. **service_inquiries**
- **Purpose**: Store inquiries for specific services
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `email` (TEXT): Inquirer's email
  - `name` (TEXT): Inquirer's name
  - `company` (TEXT): Company name
  - `phone` (TEXT): Contact phone
  - `service_type` (TEXT): Type of service ('software-dev', 'web-app', 'mobile-app', 'cloud-devops', 'ai-automation', 'it-consulting')
  - `project_description` (TEXT): Description of the project
  - `timeline` (TEXT): Project timeline ('urgent', '1-3-months', '3-6-months', '6-12-months')
  - `budget` (TEXT): Budget range
  - `status` (TEXT): Status tracking ('new', 'contacted', 'in-progress', 'converted', 'rejected')
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: service_type, status, created_at
- **RLS**: Public can insert

---

### 3. **projects**
- **Purpose**: Store completed and ongoing projects for portfolio
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `title` (TEXT): Project title
  - `slug` (TEXT): URL-friendly identifier (UNIQUE)
  - `description` (TEXT): Short description
  - `long_description` (TEXT): Detailed description
  - `category` (TEXT): Project type ('web-app', 'mobile-app', 'saas', 'ecommerce', 'ai-ml', 'other')
  - `client_name` (TEXT): Client company name
  - `technologies` (TEXT[]): Array of technologies used
  - `image_url` (TEXT): Project image URL
  - `featured_image_url` (TEXT): Hero/featured image URL
  - `live_url` (TEXT): Live project URL
  - `github_url` (TEXT): GitHub repository URL
  - `status` (TEXT): Project status ('completed', 'ongoing', 'planned')
  - `featured` (BOOLEAN): Is featured project (default: false)
  - `display_order` (INTEGER): Display order on website
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: slug, featured, category, display_order
- **RLS**: Public can read

---

### 4. **team_members**
- **Purpose**: Store team member information
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `name` (TEXT): Member's name
  - `position` (TEXT): Job title ('CEO', 'CTO', 'Senior Developer', etc.)
  - `email` (TEXT): Work email
  - `bio` (TEXT): Bio/description
  - `image_url` (TEXT): Profile image URL
  - `expertise` (TEXT[]): Array of skills/expertise
  - `social_links` (JSONB): JSON object with social profiles {linkedin: '', github: '', twitter: ''}
  - `display_order` (INTEGER): Order on website
  - `active` (BOOLEAN): Is active/public (default: true)
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: active, display_order, position
- **RLS**: Public can read

---

### 5. **services**
- **Purpose**: Store service offerings
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `title` (TEXT): Service name
  - `slug` (TEXT): URL-friendly identifier (UNIQUE)
  - `description` (TEXT): Short description
  - `full_description` (TEXT): Detailed description
  - `icon` (TEXT): Icon name/class for display
  - `features` (TEXT[]): Array of service features
  - `technologies` (TEXT[]): Related technologies
  - `display_order` (INTEGER): Display order
  - `active` (BOOLEAN): Is active (default: true)
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: slug, active, display_order
- **RLS**: Public can read

---

### 6. **testimonials**
- **Purpose**: Store client testimonials and reviews
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `client_name` (TEXT): Client's name
  - `client_title` (TEXT): Client's job title
  - `client_company` (TEXT): Client's company
  - `client_image_url` (TEXT): Client's photo URL
  - `content` (TEXT): Testimonial content
  - `rating` (INTEGER): Rating 1-5 stars (default: 5)
  - `project_id` (BIGINT): Reference to related project (FK)
  - `featured` (BOOLEAN): Is featured testimonial (default: false)
  - `display_order` (INTEGER): Display order
  - `verified` (BOOLEAN): Is verified by admin (default: false)
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: featured, project_id, rating
- **RLS**: Public can read

---

### 7. **job_applications**
- **Purpose**: Store job applications from candidates
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `job_title` (TEXT): Applied job title
  - `position_id` (TEXT): Reference to job posting
  - `full_name` (TEXT): Applicant's full name
  - `email` (TEXT): Applicant's email
  - `phone` (TEXT): Contact phone
  - `resume_url` (TEXT): Resume file URL
  - `cover_letter` (TEXT): Cover letter content
  - `linkedin_url` (TEXT): LinkedIn profile URL
  - `portfolio_url` (TEXT): Portfolio/website URL
  - `experience_years` (INTEGER): Years of experience
  - `status` (TEXT): Application status ('new', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired')
  - `notes` (TEXT): Internal notes from hiring team
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: status, position_id, created_at, email
- **RLS**: Public can insert

---

### 8. **job_postings**
- **Purpose**: Store open job positions
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `title` (TEXT): Job title
  - `slug` (TEXT): URL-friendly identifier (UNIQUE)
  - `description` (TEXT): Job description
  - `requirements` (TEXT[]): Array of job requirements
  - `responsibilities` (TEXT[]): Array of job responsibilities
  - `salary_range` (TEXT): Salary range, e.g., "$80,000 - $120,000"
  - `location` (TEXT): Job location
  - `employment_type` (TEXT): 'full-time', 'part-time', 'contract', 'remote'
  - `experience_level` (TEXT): 'junior', 'mid', 'senior'
  - `active` (BOOLEAN): Is actively hiring (default: true)
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: slug, active
- **RLS**: Public can read

---

### 9. **newsletter_subscribers**
- **Purpose**: Store email newsletter subscriptions
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `email` (TEXT): Subscriber email (UNIQUE)
  - `name` (TEXT): Subscriber name (optional)
  - `subscribed` (BOOLEAN): Is subscribed (default: true)
  - `verification_token` (TEXT): Email verification token
  - `verified` (BOOLEAN): Is email verified (default: false)
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: email, subscribed
- **RLS**: Public can insert and read

---

### 10. **settings**
- **Purpose**: Store website configuration settings
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `key` (TEXT): Setting key name (UNIQUE)
  - `value` (TEXT): Setting value
  - `description` (TEXT): Setting description
  - `type` (TEXT): Data type ('email', 'url', 'text', 'number', 'json', 'boolean')
  - `created_at` (TIMESTAMP): Creation timestamp
  - `updated_at` (TIMESTAMP): Last update timestamp
- **Indexes**: key
- **RLS**: Public can read
- **Default Settings**:
  - company_name, company_email, company_phone
  - Social media URLs (LinkedIn, GitHub, Twitter)
  - Office address and location
  - Support and careers email addresses
  - Feature toggles (newsletter_enabled, contact_form_enabled, etc.)

---

### 11. **audit_logs**
- **Purpose**: Track changes and admin actions for compliance
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `table_name` (TEXT): Modified table name
  - `record_id` (BIGINT): ID of modified record
  - `action` (TEXT): Action type ('create', 'update', 'delete')
  - `user_id` (TEXT): User who made the change
  - `old_values` (JSONB): Previous values before change
  - `new_values` (JSONB): New values after change
  - `ip_address` (TEXT): IP address of user
  - `user_agent` (TEXT): Browser/client information
  - `created_at` (TIMESTAMP): When the change occurred
- **Indexes**: table_name, created_at, user_id
- **RLS**: Authenticated users only

---

### 12. **analytics**
- **Purpose**: Track page views, clicks, and user interactions
- **Fields**:
  - `id` (BIGSERIAL): Primary key
  - `page_path` (TEXT): Page URL path
  - `page_title` (TEXT): Page title
  - `referrer` (TEXT): Referrer URL
  - `user_agent` (TEXT): Browser information
  - `ip_address` (TEXT): User's IP address
  - `session_id` (TEXT): Session identifier
  - `duration_ms` (INTEGER): Time spent in milliseconds
  - `event_type` (TEXT): Type of event ('page_view', 'click', 'form_submit', 'scroll')
  - `event_details` (JSONB): Additional event data
  - `created_at` (TIMESTAMP): Event timestamp
- **Indexes**: page_path, created_at, session_id, event_type
- **RLS**: Public can insert

---

## How to Use

### 1. Copy the SQL Schema
- Open [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)
- Copy all the SQL code

### 2. Execute in Supabase
1. Go to your Supabase Dashboard
2. Click **SQL Editor** → **New Query**
3. Paste the entire SQL
4. Click **Run**

### 3. Verify Creation
1. Go to **Table Editor** in Supabase
2. You should see all 12 tables created
3. The settings table will have default data

---

## Common Queries

### Get all contacts
```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

### Get open job postings
```sql
SELECT * FROM job_postings WHERE active = true ORDER BY created_at DESC;
```

### Get featured projects
```sql
SELECT * FROM projects WHERE featured = true ORDER BY display_order;
```

### Get all team members
```sql
SELECT * FROM team_members WHERE active = true ORDER BY display_order;
```

### Get service inquiries by status
```sql
SELECT * FROM service_inquiries WHERE status = 'new' ORDER BY created_at DESC;
```

### Get verified testimonials
```sql
SELECT * FROM testimonials WHERE verified = true ORDER BY display_order;
```

### Get company settings
```sql
SELECT key, value FROM settings WHERE key LIKE 'company_%';
```

---

## Row Level Security (RLS)

All tables have RLS enabled for security:

- **Public Insert**: Contact forms, service inquiries, job applications, newsletter signup
- **Public Read**: Projects, team members, services, testimonials, job postings, settings
- **Authenticated Read**: Contact messages, job applications (admin only)
- **Authenticated Required**: Audit logs

To modify policies, go to **Authentication** → **Policies** in Supabase dashboard.

---

## Relationships

```
projects (1) ──── (N) testimonials
                        
job_postings (1) ──── (N) job_applications
```

---

## Tips

1. **Always backup** your database before making schema changes
2. **Test RLS policies** thoroughly before going to production
3. **Use slug** fields for URL-friendly identifiers
4. **Track changes** with the audit_logs table for compliance
5. **Index commonly queried** fields for better performance
6. **Use JSONB** for flexible data structures (social_links, event_details)
7. **Set display_order** to control content order on the website

---

## Next Steps

1. ✅ Create all tables (via SQL Editor)
2. ✅ Configure RLS policies (via Authentication → Policies)
3. ✅ Insert your company settings (via Table Editor or SQL)
4. ✅ Create initial projects, services, team members
5. ✅ Start collecting data from forms

For more help: [Supabase Database Docs](https://supabase.com/docs/guides/database)
