import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Sparkles, ImageIcon, Type, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Homepage Settings - Admin Panel',
}

export default async function HomepageSettingsPage() {
  const user = await requireAdmin()
  
  if (user.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch homepage settings (you'll need to create this table)
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'homepage')
    .single()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Homepage Content</h1>
              <p className="text-sm text-muted-foreground">Edit hero section, featured content, and layout</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/" target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview Live
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Hero Section</h2>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Main Headline
                </label>
                <input
                  type="text"
                  name="hero_title"
                  defaultValue="Building Tomorrow's Digital Solutions"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter hero headline"
                />
                <p className="text-xs text-muted-foreground">Main heading displayed on the homepage</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subheadline
                </label>
                <textarea
                  name="hero_subtitle"
                  rows={3}
                  defaultValue="We transform ideas into powerful digital experiences through innovative software solutions."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Enter hero subheadline"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    name="hero_cta_primary"
                    defaultValue="Start Your Project"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    name="hero_cta_secondary"
                    defaultValue="View Our Work"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Featured Projects Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Layout className="w-4 h-4 text-purple-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Featured Projects</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Project Display</p>
                  <p className="text-xs text-muted-foreground mt-1">Currently showing projects marked as "featured"</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/projects">
                    Manage Projects
                  </Link>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Section Title
                </label>
                <input
                  type="text"
                  defaultValue="Featured Projects"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Section Description
                </label>
                <textarea
                  rows={2}
                  defaultValue="Explore some of our recent projects that showcase our expertise and innovation."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* About Preview Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Type className="w-4 h-4 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">About Section</h2>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Section Title
                </label>
                <input
                  type="text"
                  defaultValue="Why Choose Asrivo Tech"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  rows={4}
                  defaultValue="We are a team of passionate developers and designers committed to delivering exceptional digital solutions."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>
            </form>
          </div>

          {/* CTA Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Call-to-Action Section</h2>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  CTA Headline
                </label>
                <input
                  type="text"
                  defaultValue="Ready to Build Something Amazing?"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  CTA Description
                </label>
                <textarea
                  rows={2}
                  defaultValue="Let's discuss your project and turn your vision into reality."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Button Text
                </label>
                <input
                  type="text"
                  defaultValue="Get Started Today"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </form>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Changes will be visible immediately after saving
              </p>
              <Button size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
