'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Sparkles, Layout, Type, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateMultipleSettings } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'

interface HomepageSettingsFormProps {
  initialSettings: Record<string, any>
}

export function HomepageSettingsForm({ initialSettings }: HomepageSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const settings = Array.from(formData.entries()).map(([key, value]) => ({
        category: 'homepage',
        key,
        value: value.toString(),
      }))

      const result = await updateMultipleSettings(settings)

      if (result.success) {
        toast.success('Homepage settings saved successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Hero Section</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Main Headline
            </label>
            <input
              type="text"
              name="hero_title"
              defaultValue={initialSettings.hero_title || "Building Tomorrow's Digital Solutions"}
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
              defaultValue={initialSettings.hero_subtitle || "We transform ideas into powerful digital experiences through innovative software solutions."}
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
                defaultValue={initialSettings.hero_cta_primary || "Start Your Project"}
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
                defaultValue={initialSettings.hero_cta_secondary || "View Our Work"}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Layout className="w-4 h-4 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Featured Projects Section</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Project Display</p>
              <p className="text-xs text-muted-foreground mt-1">Currently showing projects marked as "featured"</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/projects">Manage Projects</a>
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Section Title</label>
            <input
              type="text"
              name="featured_projects_title"
              defaultValue={initialSettings.featured_projects_title || "Featured Projects"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Section Description</label>
            <textarea
              name="featured_projects_description"
              rows={2}
              defaultValue={initialSettings.featured_projects_description || "Explore some of our recent projects that showcase our expertise and innovation."}
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

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Section Title</label>
            <input
              type="text"
              name="about_title"
              defaultValue={initialSettings.about_title || "Why Choose Asrivo Tech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="about_description"
              rows={4}
              defaultValue={initialSettings.about_description || "We are a team of passionate developers and designers committed to delivering exceptional digital solutions."}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Call-to-Action Section</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CTA Headline</label>
            <input
              type="text"
              name="cta_title"
              defaultValue={initialSettings.cta_title || "Ready to Build Something Amazing?"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CTA Description</label>
            <textarea
              name="cta_description"
              rows={2}
              defaultValue={initialSettings.cta_description || "Let's discuss your project and turn your vision into reality."}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Button Text</label>
            <input
              type="text"
              name="cta_button"
              defaultValue={initialSettings.cta_button || "Get Started Today"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Changes will be visible immediately after saving
          </p>
          <Button size="lg" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
