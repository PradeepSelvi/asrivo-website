'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateMultipleSettings } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'

interface SecuritySettingsFormProps {
  initialSettings: Record<string, any>
}

export function SecuritySettingsForm({ initialSettings }: SecuritySettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Handle unchecked checkboxes (they don't appear in FormData)
      const checkboxFields = ['captcha_enabled', 'rate_limit_enabled']
      const settings = []

      for (const [key, value] of Array.from(formData.entries())) {
        settings.push({ category: 'security', key, value: value.toString() })
      }

      // Ensure unchecked boxes are saved as false
      for (const field of checkboxFields) {
        if (!formData.has(field)) {
          settings.push({ category: 'security', key: field, value: 'false' })
        }
      }

      const result = await updateMultipleSettings(settings)

      if (result.success) {
        toast.success('Security settings saved successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving security settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const captchaEnabled =
    initialSettings.captcha_enabled === true ||
    initialSettings.captcha_enabled === 'true'

  const rateLimitEnabled =
    initialSettings.rate_limit_enabled === true ||
    initialSettings.rate_limit_enabled === 'true'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* CAPTCHA */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">CAPTCHA</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Enable reCAPTCHA</p>
              <p className="text-xs text-muted-foreground mt-1">Protect forms from spam and bots</p>
            </div>
            <input
              type="checkbox"
              name="captcha_enabled"
              defaultChecked={captchaEnabled}
              value="true"
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">reCAPTCHA Site Key</label>
            <input
              type="text"
              name="recaptcha_site_key"
              defaultValue={initialSettings.recaptcha_site_key || ''}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="6Lc..."
            />
            <p className="text-xs text-muted-foreground">
              Get your keys at{' '}
              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                google.com/recaptcha/admin
              </a>
              . The secret key should be in your .env file as <code className="font-mono bg-muted px-1 rounded">RECAPTCHA_SECRET_KEY</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Rate Limiting</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Rate Limiting</p>
              <p className="text-xs text-muted-foreground mt-1">Limit the number of requests per IP</p>
            </div>
            <input
              type="checkbox"
              name="rate_limit_enabled"
              defaultChecked={rateLimitEnabled}
              value="true"
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Max Requests / Minute</label>
              <input
                type="number"
                name="max_requests_per_minute"
                defaultValue={initialSettings.max_requests_per_minute || 60}
                min={1}
                max={1000}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Session Timeout (seconds)</label>
              <input
                type="number"
                name="session_timeout"
                defaultValue={initialSettings.session_timeout || 3600}
                min={300}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Password Length</label>
            <input
              type="number"
              name="password_min_length"
              defaultValue={initialSettings.password_min_length || 8}
              min={6}
              max={128}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              <><Save className="w-4 h-4 mr-2" />Save Security Settings</>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
