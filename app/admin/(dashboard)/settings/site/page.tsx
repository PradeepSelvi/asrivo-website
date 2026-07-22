import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, Mail, Phone, MapPin, Linkedin, Instagram, Twitter, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Site Configuration - Admin Panel',
}

export default async function SiteConfigPage() {
  const user = await requireAdmin()
  
  if (user.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('category', 'site')

  // Convert array to object for easier access
  const settingsMap = settings?.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, any>) || {}

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Site Configuration</h1>
            <p className="text-sm text-muted-foreground">Manage website metadata, contact information, and SEO</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Basic Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Basic Information</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Site Name
                </label>
                <input
                  type="text"
                  name="site_name"
                  defaultValue={settingsMap.site_name || "Asrivo Tech"}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your Company Name"
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
                  defaultValue={settingsMap.site_tagline || "Building Tomorrow's Digital Solutions"}
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
                  defaultValue={settingsMap.site_description || "Innovative software development and digital transformation services"}
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
                  defaultValue={settingsMap.site_keywords || "software development, web design, mobile apps"}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Comma-separated keywords"
                />
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Contact Information</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={settingsMap.contact_email || "contact@asrivotech.com"}
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
                  defaultValue={settingsMap.contact_phone || "+1 (555) 123-4567"}
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
                  defaultValue={settingsMap.contact_address || "123 Tech Street\nSan Francisco, CA 94105"}
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
                    defaultValue={settingsMap.business_hours || "Mon-Fri: 9AM-6PM"}
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
                    defaultValue={settingsMap.support_email || "support@asrivotech.com"}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Social Media Links */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Social Media</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-500" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="social_linkedin"
                  defaultValue={settingsMap.social_linkedin || "https://linkedin.com/company/asrivotech"}
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
                  defaultValue={settingsMap.social_instagram || "https://instagram.com/asrivotech"}
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
                  defaultValue={settingsMap.social_twitter || "https://twitter.com/asrivotech"}
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
                  defaultValue={settingsMap.social_github || "https://github.com/asrivotech"}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="https://github.com/yourcompany"
                />
              </div>
            </form>
          </div>

          {/* SEO Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">SEO & Analytics</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  name="google_analytics_id"
                  defaultValue={settingsMap.google_analytics_id || ""}
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
                  defaultValue={settingsMap.google_tag_manager_id || ""}
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
                  defaultValue={settingsMap.facebook_pixel_id || ""}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
                  placeholder="XXXXXXXXXXXXXXXX"
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> These tracking codes will be automatically injected into your website. Make sure to comply with privacy regulations (GDPR, CCPA) when using tracking technologies.
                </p>
              </div>
            </form>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Changes will be applied site-wide immediately
              </p>
              <Button size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
