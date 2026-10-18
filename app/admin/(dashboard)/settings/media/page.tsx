import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image, FolderOpen, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Media & Assets - Admin Panel',
}

const mediaSections = [
  {
    title: 'Project Images',
    description: 'Images for portfolio projects are uploaded directly when adding or editing a project.',
    link: '/admin/projects',
    linkLabel: 'Manage Projects',
    color: 'blue',
  },
  {
    title: 'Team Member Photos',
    description: 'Team member profile photos are uploaded when adding or editing a team member.',
    link: '/admin/team',
    linkLabel: 'Manage Team',
    color: 'green',
  },
  {
    title: 'Service Icons & Images',
    description: 'Service page images are managed per-service in the services admin.',
    link: '/admin/services',
    linkLabel: 'Manage Services',
    color: 'purple',
  },
]

export default async function MediaSettingsPage() {
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
            <Image className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Media & Assets</h1>
            <p className="text-sm text-muted-foreground">Manage images, logos, and media files</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Media Sections */}
          <div className="grid gap-4 md:grid-cols-3">
            {mediaSections.map((section) => (
              <div key={section.title} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={section.link}>{section.linkLabel}</Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Supabase Storage Link */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Supabase Storage</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://supabase.com/docs/guides/storage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Storage Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
