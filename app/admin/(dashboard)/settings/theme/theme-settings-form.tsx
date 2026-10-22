'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateMultipleSettings } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'

interface ThemeSettingsFormProps {
  initialSettings: Record<string, any>
}

export function ThemeSettingsForm({ initialSettings }: ThemeSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const settings = Array.from(formData.entries()).map(([key, value]) => ({
        category: 'theme',
        key,
        value: value.toString(),
      }))

      const result = await updateMultipleSettings(settings)

      if (result.success) {
        toast.success('Theme settings saved successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving theme settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const darkModeDefault =
    initialSettings.dark_mode_enabled === true ||
    initialSettings.dark_mode_enabled === 'true'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Colors */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Brand Colors</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue={initialSettings.primary_color || '#2b6cb0'}
                className="h-10 w-16 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                defaultValue={initialSettings.primary_color || '#2b6cb0'}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-foreground font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="secondary_color"
                defaultValue={initialSettings.secondary_color || '#4fd1ed'}
                className="h-10 w-16 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                defaultValue={initialSettings.secondary_color || '#4fd1ed'}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-foreground font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="accent_color"
                defaultValue={initialSettings.accent_color || '#805ad5'}
                className="h-10 w-16 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                defaultValue={initialSettings.accent_color || '#805ad5'}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-foreground font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Typography</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Heading Font</label>
            <input
              type="text"
              name="font_heading"
              defaultValue={initialSettings.font_heading || 'Inter'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Inter"
            />
            <p className="text-xs text-muted-foreground">Google Font name for headings</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Body Font</label>
            <input
              type="text"
              name="font_body"
              defaultValue={initialSettings.font_body || 'Inter'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Inter"
            />
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Display Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode Default</p>
              <p className="text-xs text-muted-foreground mt-1">Set dark mode as the default theme for new visitors</p>
            </div>
            <input
              type="checkbox"
              name="dark_mode_enabled"
              defaultChecked={darkModeDefault}
              value="true"
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Logo URL</label>
            <input
              type="text"
              name="logo_url"
              defaultValue={initialSettings.logo_url || '/asrivo.png'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="/asrivo.png"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Favicon URL</label>
            <input
              type="text"
              name="favicon_url"
              defaultValue={initialSettings.favicon_url || '/favicon.ico'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="/favicon.ico"
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Changes applied immediately</p>
          <Button size="lg" type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Theme</>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
