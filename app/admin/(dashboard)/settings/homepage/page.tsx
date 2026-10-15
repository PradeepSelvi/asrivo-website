import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Eye, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HomepageSettingsForm } from './homepage-settings-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Homepage Settings - Admin Panel',
}

export default async function HomepageSettingsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  const supabase = await createClient()

  // Fetch homepage settings — returns [] if table doesn't exist yet
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('category', 'homepage')

  // Convert array to key → value map
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
        <div className="max-w-5xl mx-auto">
          {Object.keys(settingsMap).length === 0 && (
            <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
              <strong>Note:</strong> No homepage settings found in the database. The form shows default values.
              To persist changes, first apply <code className="font-mono bg-amber-500/10 px-1 rounded">supabase/schema/SITE_SETTINGS_SCHEMA.sql</code> in your Supabase SQL Editor.
              See <code className="font-mono bg-amber-500/10 px-1 rounded">supabase/migrations/apply_site_settings_schema.md</code> for instructions.
            </div>
          )}
          <HomepageSettingsForm initialSettings={settingsMap} />
        </div>
      </div>
    </div>
  )
}
