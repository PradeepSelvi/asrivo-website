'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateMultipleSettings } from '@/lib/supabase/settings-actions'
import { toast } from 'sonner'

interface EmailSettingsFormProps {
  initialSettings: Record<string, any>
}

export function EmailSettingsForm({ initialSettings }: EmailSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const settings = Array.from(formData.entries()).map(([key, value]) => ({
        category: 'email',
        key,
        value: value.toString(),
      }))

      const result = await updateMultipleSettings(settings)

      if (result.success) {
        toast.success('Email settings saved successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">SMTP Configuration</h2>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> SMTP credentials (username, password) must be set as environment variables
            <code className="ml-1 font-mono bg-amber-500/10 px-1 rounded">GMAIL_USER</code>,
            <code className="ml-1 font-mono bg-amber-500/10 px-1 rounded">GMAIL_APP_PASSWORD</code> in your <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code> file.
            The fields below configure display names and notification preferences only.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Name</label>
              <input
                type="text"
                name="smtp_from_name"
                defaultValue={initialSettings.smtp_from_name || 'Asrivo Tech'}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Asrivo Tech"
              />
              <p className="text-xs text-muted-foreground">Display name in sent emails</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Email</label>
              <input
                type="email"
                name="smtp_from_email"
                defaultValue={initialSettings.smtp_from_email || 'noreply@asrivotech.in'}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="noreply@asrivotech.in"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Admin Notification Email</label>
            <input
              type="email"
              name="admin_email"
              defaultValue={initialSettings.admin_email || ''}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="admin@asrivotech.com"
            />
            <p className="text-xs text-muted-foreground">Receives notifications for new contacts, inquiries, etc.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">SMTP Host</label>
            <input
              type="text"
              name="smtp_host"
              defaultValue={initialSettings.smtp_host || 'smtp.gmail.com'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="smtp.gmail.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">SMTP Port</label>
            <input
              type="text"
              name="smtp_port"
              defaultValue={initialSettings.smtp_port || '587'}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
              placeholder="587"
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
              <><Save className="w-4 h-4 mr-2" />Save Settings</>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
