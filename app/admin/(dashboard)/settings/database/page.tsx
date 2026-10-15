import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Database, ExternalLink, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Database Management - Admin Panel',
}

const tables = [
  { name: 'contacts', purpose: 'Contact form submissions from the website', category: 'Inbox' },
  { name: 'client_inquiries', purpose: 'Detailed service inquiry form submissions', category: 'Inbox' },
  { name: 'service_inquiries', purpose: 'Simple service inquiry form (legacy)', category: 'Inbox' },
  { name: 'consultation_requests', purpose: 'Consultation booking requests', category: 'Inbox' },
  { name: 'complaints', purpose: 'Complaint submissions from users', category: 'Inbox' },
  { name: 'partnerships', purpose: 'Partnership application submissions', category: 'Inbox' },
  { name: 'job_applications', purpose: 'Job application submissions', category: 'Inbox' },
  { name: 'newsletter_subscribers', purpose: 'Email newsletter signups', category: 'Inbox' },
  { name: 'projects', purpose: 'Portfolio projects shown on the public site', category: 'CMS' },
  { name: 'services', purpose: 'Service offerings shown on the public site', category: 'CMS' },
  { name: 'team_members', purpose: 'Team profiles shown on the public site', category: 'CMS' },
  { name: 'testimonials', purpose: 'Client testimonials shown on the public site', category: 'CMS' },
  { name: 'job_postings', purpose: 'Open job positions managed in the admin', category: 'CMS' },
  { name: 'site_settings', purpose: 'Key-value configuration for site, homepage, theme, email, security', category: 'Config' },
  { name: 'admin_profiles', purpose: 'Admin user accounts and roles (high/low)', category: 'Auth' },
  { name: 'user_profiles', purpose: 'Public user profiles (registered users)', category: 'Auth' },
  { name: 'crm_leads', purpose: 'CRM sales leads with scoring', category: 'CRM' },
  { name: 'crm_deals', purpose: 'CRM pipeline deals', category: 'CRM' },
  { name: 'crm_activities', purpose: 'CRM interaction/activity log', category: 'CRM' },
  { name: 'crm_tasks', purpose: 'CRM task management', category: 'CRM' },
  { name: 'crm_notes', purpose: 'CRM internal notes', category: 'CRM' },
  { name: 'crm_tags', purpose: 'Flexible tagging for CRM records', category: 'CRM' },
  { name: 'audit_logs', purpose: 'Admin action audit trail', category: 'System' },
  { name: 'analytics', purpose: 'Page view analytics', category: 'System' },
]

const categories = ['CMS', 'Inbox', 'CRM', 'Config', 'Auth', 'System']
const categoryColors: Record<string, string> = {
  CMS: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Inbox: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  CRM: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Config: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Auth: 'bg-red-500/10 text-red-600 dark:text-red-400',
  System: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
}

export default async function DatabaseSettingsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Database Management</h1>
            <p className="text-sm text-muted-foreground">View tables, manage backups, and export data</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Category Legend */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[cat]}`}>
                {cat}
              </span>
            ))}
          </div>

          {/* Tables List */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">All Tables ({tables.length})</h2>
              </div>
            </div>
            <div className="divide-y divide-border">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                  <code className="text-sm font-mono text-foreground w-56 shrink-0">{table.name}</code>
                  <span className="text-sm text-muted-foreground flex-1">{table.purpose}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[table.category]}`}>
                    {table.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Backup & Export</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use the Supabase dashboard to create database backups, export data, and run SQL queries.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Supabase Dashboard
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/docs/guides/database/backups" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Backup Guide
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
