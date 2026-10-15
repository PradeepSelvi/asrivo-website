import { requireAdmin } from '@/lib/auth/admin-guard'
import { getAllPagesMetadata } from '@/lib/supabase/content-helpers'
import Link from 'next/link'
import { Layout, Clock, Hash, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Page Content - Admin Panel',
}

const PAGE_NAMES: Record<string, string> = {
  home: 'Home Page',
  about: 'About Page',
  services: 'Services Page',
  contact: 'Contact Page',
  projects: 'Projects Page',
  team: 'Team Page',
  careers: 'Careers Page',
}

const ALL_PAGES = ['home', 'about', 'services', 'contact', 'projects', 'team', 'careers']

export default async function ContentManagementPage() {
  await requireAdmin()

  const metadata = await getAllPagesMetadata()

  // Create a map for quick lookup
  const metadataMap = new Map(metadata.map((m) => [m.slug, m]))

  // Ensure all pages are shown, even if they have no data yet
  const pageCards = ALL_PAGES.map((slug) => {
    const meta = metadataMap.get(slug)
    return {
      slug,
      name: PAGE_NAMES[slug] || slug,
      lastUpdated: meta?.lastUpdated || null,
      contentFields: meta?.contentFields || 0,
    }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Content</h1>
            <p className="text-sm text-muted-foreground">Manage content for all pages across your website</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageCards.map((page) => (
              <div
                key={page.slug}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{page.name}</h3>
                    <p className="text-xs text-muted-foreground">/{page.slug === 'home' ? '' : page.slug}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Layout className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span>{page.contentFields} field{page.contentFields !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {page.lastUpdated
                        ? new Date(page.lastUpdated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never updated'}
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/admin/content/${page.slug}`}>
                    Edit Content
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
