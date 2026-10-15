import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmailSettingsForm } from './email-settings-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Email Settings - Admin Panel',
}

export default async function EmailSettingsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('category', 'email')

  const settingsMap = (settings ?? []).reduce((acc, setting) => {
    try {
      acc[setting.key] = JSON.parse(setting.value)
    } catch {
      acc[setting.key] = setting.value
    }
    return acc
  }, {} as Record<string, any>)

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
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Settings</h1>
            <p className="text-sm text-muted-foreground">Configure email notifications and SMTP settings</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <EmailSettingsForm initialSettings={settingsMap} />
        </div>
      </div>
    </div>
  )
}
