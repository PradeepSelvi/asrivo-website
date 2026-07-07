import React from 'react'
import { getCurrentAdmin, getSettings, updateSetting } from '@/lib/supabase/admin-actions'
import { redirect } from 'next/navigation'
import { Settings, Save, AlertTriangle, Bell, Key } from 'lucide-react'

export default async function AdminSettingsPage() {
  // Server-side gate: only high admins can reach this page
  const adminResult = await getCurrentAdmin()
  if (!adminResult.success || adminResult.user?.role !== 'high') {
    redirect('/admin')
  }

  const settingsResult = await getSettings()
  const settings = settingsResult.success ? settingsResult.data : []

  // Group settings
  const companySettings = settings?.filter((s: any) =>
    ['company_name', 'company_email', 'company_phone', 'company_website', 'office_address', 'office_city', 'office_country', 'timezone', 'support_email', 'careers_email'].includes(s.key)
  ) ?? []
  const socialSettings = settings?.filter((s: any) =>
    ['linkedin_url', 'github_url', 'twitter_url'].includes(s.key)
  ) ?? []
  const featureSettings = settings?.filter((s: any) =>
    ['newsletter_enabled', 'contact_form_enabled', 'service_inquiry_enabled'].includes(s.key)
  ) ?? []
  const notificationSettings = settings?.filter((s: any) =>
    ['admin_notification_emails', 'slack_webhook_url'].includes(s.key)
  ) ?? []
  const apiKeySettings = settings?.filter((s: any) =>
    ['external_api_key_google', 'external_api_key_supabase'].includes(s.key)
  ) ?? []

  const handleUpdate = async (formData: FormData) => {
    'use server'
    const key = formData.get('key') as string
    const value = formData.get('value') as string
    await updateSetting(key, value)
    redirect('/admin/settings?saved=true')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Global Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage website configuration and company information.</p>
      </div>

      {/* Warning */}
      <div className="border border-amber-900/40 bg-amber-950/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-300">High Admin Only</p>
          <p className="text-xs text-amber-500/80 mt-0.5">
            Changes made here affect the live website. Only High role admins can modify settings.
          </p>
        </div>
      </div>

      {/* Company Info */}
      <SettingsGroup
        title="Company Information"
        icon={<Settings className="w-4 h-4 text-indigo-400" />}
        settings={companySettings}
        handleUpdate={handleUpdate}
      />

      {/* Social Links */}
      <SettingsGroup
        title="Social Links"
        icon={<Settings className="w-4 h-4 text-indigo-400" />}
        settings={socialSettings}
        handleUpdate={handleUpdate}
      />

      {/* Feature Toggles */}
      <SettingsGroup
        title="Feature Toggles"
        icon={<Settings className="w-4 h-4 text-indigo-400" />}
        settings={featureSettings}
        handleUpdate={handleUpdate}
      />

      {/* Notification Preferences */}
      <SettingsGroup
        title="Notification Preferences"
        icon={<Bell className="w-4 h-4 text-amber-400" />}
        settings={notificationSettings}
        handleUpdate={handleUpdate}
      />

      {/* API Keys */}
      <SettingsGroup
        title="API Keys & Integrations"
        icon={<Key className="w-4 h-4 text-emerald-400" />}
        settings={apiKeySettings}
        handleUpdate={handleUpdate}
      />
    </div>
  )
}

function SettingsGroup({
  title,
  icon,
  settings,
  handleUpdate,
}: {
  title: string
  icon: React.ReactNode
  settings: any[]
  handleUpdate: (formData: FormData) => Promise<void>
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      <div className="divide-y divide-slate-800/50">
        {!settings || settings.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No settings in this group.</p>
        ) : (
          settings.map((setting: any) => (
            <form key={setting.id} action={handleUpdate} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/10 transition-colors group">
              <input type="hidden" name="key" value={setting.key} />
              <div className="flex-1 min-w-0">
                <label htmlFor={`setting-${setting.key}`} className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                {setting.description && (
                  <p className="text-xs text-slate-600 mb-1">{setting.description}</p>
                )}
                <input
                  id={`setting-${setting.key}`}
                  name="value"
                  defaultValue={setting.value || ''}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
            </form>
          ))
        )}
      </div>
    </div>
  )
}
