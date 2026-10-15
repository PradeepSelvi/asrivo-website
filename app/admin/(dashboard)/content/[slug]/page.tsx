import { requireAdmin } from '@/lib/auth/admin-guard'
import { getPageContentForEdit } from '@/lib/supabase/page-content-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ContentEditForm from './content-edit-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ALLOWED_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers'] as const
type PageSlug = typeof ALLOWED_PAGES[number]

const PAGE_NAMES: Record<PageSlug, string> = {
  home: 'Home Page',
  about: 'About Page',
  services: 'Services Page',
  contact: 'Contact Page',
  projects: 'Projects Page',
  team: 'Team Page',
  careers: 'Careers Page',
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await requireAdmin()

  const { slug } = await params

  // Validate slug
  if (!ALLOWED_PAGES.includes(slug as PageSlug)) {
    notFound()
  }

  const pageSlug = slug as PageSlug

  // Fetch current content
  const result = await getPageContentForEdit(pageSlug)

  if (!result.success) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/content">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pages
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Error Loading Content</h1>
        </div>
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
              {result.error || 'Failed to load content'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentContent = result.data || {}

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/content">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pages
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Edit {PAGE_NAMES[pageSlug]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Update content and SEO settings for /{pageSlug === 'home' ? '' : pageSlug}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <ContentEditForm slug={pageSlug} currentContent={currentContent} />
        </div>
      </div>
    </div>
  )
}
