import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Settings, 
  Globe, 
  Image, 
  Type, 
  Palette, 
  Mail,
  Shield,
  Database,
  FileCode,
  ArrowRight,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export const metadata = {
  title: 'Settings - Admin Panel',
  description: 'Manage website settings and configuration',
}

export default async function SettingsPage() {
  const user = await requireAdmin()
  
  // Only high admins can access settings
  if (user.role !== 'high') {
    redirect('/admin')
  }

  const settingsSections = [
    {
      title: 'Site Configuration',
      description: 'Manage website metadata, SEO, and general settings',
      icon: Globe,
      href: '/admin/settings/site',
      items: ['Site title', 'Meta description', 'Contact info', 'Social links']
    },
    {
      title: 'Homepage Content',
      description: 'Edit hero section, featured content, and homepage layout',
      icon: Type,
      href: '/admin/settings/homepage',
      items: ['Hero section', 'Featured projects', 'Call-to-action', 'About preview']
    },
    {
      title: 'Media & Assets',
      description: 'Manage images, logos, and media files',
      icon: Image,
      href: '/admin/settings/media',
      items: ['Logo uploads', 'Favicon', 'Default images', 'Image optimization']
    },
    {
      title: 'Theme & Branding',
      description: 'Customize colors, fonts, and visual identity',
      icon: Palette,
      href: '/admin/settings/theme',
      items: ['Color scheme', 'Typography', 'Button styles', 'Dark mode']
    },
    {
      title: 'Email Templates',
      description: 'Configure email notifications and templates',
      icon: Mail,
      href: '/admin/settings/email',
      items: ['SMTP settings', 'Email templates', 'Notification preferences']
    },
    {
      title: 'Security & Access',
      description: 'Manage authentication and security settings',
      icon: Shield,
      href: '/admin/settings/security',
      items: ['Admin roles', 'API keys', 'Rate limiting', 'CAPTCHA settings']
    },
    {
      title: 'Database Management',
      description: 'View and manage database tables and relationships',
      icon: Database,
      href: '/admin/settings/database',
      items: ['Backup & restore', 'Data export', 'Table management']
    },
    {
      title: 'Advanced Settings',
      description: 'Developer tools and advanced configuration',
      icon: FileCode,
      href: '/admin/settings/advanced',
      items: ['Environment variables', 'API endpoints', 'Webhooks', 'Custom scripts']
    },
  ]

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage website configuration and preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Lock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
            High Admin Only - Full website control
          </span>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 rounded-xl border border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/admins">
                <Shield className="w-4 h-4 mr-2" />
                Manage Admins
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/settings/database">
                <Database className="w-4 h-4 mr-2" />
                Database Backup
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/settings/security">
                <Lock className="w-4 h-4 mr-2" />
                Security Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
