'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Phone, MapPin, Linkedin, Instagram, Twitter, Github, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateMultipleSettings } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'

interface SiteSettingsFormProps {
  initialSettings: Record<string, any>
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Build array of settings to update
      const settings = Array.from(formData.entries()).map(([key, value]) => ({
        category: 'site',
        key,
        value: value.toString()
      }))

      const result = await updateMultipleSettings(settings)

      if (result.success) {
        toast.success('Settings updated successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Basic Information</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Site Name
            </label>
            <input
              type="text"
              name="site_name"
              defaultValue={initialSettings.site_name || "Asrivo Tech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Your Company Name"
              required
            />
            <p className="text-xs text-muted-foreground">Displayed in browser tabs and search results</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tagline
            </label>
            <input
              type="text"
              name="site_tagline"
              defaultValue={initialSettings.site_tagline || "Building Tomorrow's Digital Solutions"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Short description of your business"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Meta Description
            </label>
            <textarea
              name="site_description"
              rows={3}
              defaultValue={initialSettings.site_description || "Innovative software development and digital transformation services"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              placeholder="Description for search engines (150-160 characters)"
            />
            <p className="text-xs text-muted-foreground">Used by search engines in search results</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Keywords
            </label>
            <input
              type="text"
              name="site_keywords"
              defaultValue={initialSettings.site_keywords || "software development, web design, mobile apps"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Comma-separated keywords"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Contact Information</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Address
            </label>
            <input
              type="email"
              name="contact_email"
              defaultValue={initialSettings.contact_email || "contact@asrivotech.com"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number
            </label>
            <input
              type="tel"
              name="contact_phone"
              defaultValue={initialSettings.contact_phone || "+1 (555) 123-4567"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Business Address
            </label>
            <textarea
              name="contact_address"
              rows={3}
              defaultValue={initialSettings.contact_address || "123 Tech Street\nSan Francisco, CA 94105"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              placeholder="Street address, City, State, ZIP"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Business Hours
              </label>
              <input
                type="text"
                name="business_hours"
                defaultValue={initialSettings.business_hours || "Mon-Fri: 9AM-6PM"}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Support Email
              </label>
              <input
                type="email"
                name="support_email"
                defaultValue={initialSettings.support_email || "support@asrivotech.com"}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Social Media</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-blue-500" />
              LinkedIn
            </label>
            <input
              type="url"
              name="social_linkedin"
              defaultValue={initialSettings.social_linkedin || "https://linkedin.com/company/asrivotech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              Instagram
            </label>
            <input
              type="url"
              name="social_instagram"
              defaultValue={initialSettings.social_instagram || "https://instagram.com/asrivotech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://instagram.com/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Twitter className="w-4 h-4 text-blue-400" />
              Twitter / X
            </label>
            <input
              type="url"
              name="social_twitter"
              defaultValue={initialSettings.social_twitter || "https://twitter.com/asrivotech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://twitter.com/yourcompany"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Github className="w-4 h-4 text-gray-600" />
              GitHub
            </label>
            <input
              type="url"
              name="social_github"
              defaultValue={initialSettings.social_github || "https://github.com/asrivotech"}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://github.com/yourcompany"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">SEO & Analytics</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Google Analytics ID
            </label>
            <input
              type="text"
              name="google_analytics_id"
              defaultValue={initialSettings.google_analytics_id || ""}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            />
            <p className="text-xs text-muted-foreground">Google Analytics tracking ID</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Google Tag Manager ID
            </label>
            <input
              type="text"
              name="google_tag_manager_id"
              defaultValue={initialSettings.google_tag_manager_id || ""}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              name="facebook_pixel_id"
              defaultValue={initialSettings.facebook_pixel_id || ""}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="XXXXXXXXXXXXXXXX"
            />
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> These tracking codes will be automatically injected into your website. Make sure to comply with privacy regulations (GDPR, CCPA) when using tracking technologies.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Changes will be applied site-wide immediately
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
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
