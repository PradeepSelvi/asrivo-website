'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Briefcase,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SiteSetting {
  id: number
  setting_key: string
  setting_value: string
  setting_type: string
  description: string
}

export default function CareersSettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    careers_page_enabled: true,
    job_applications_enabled: true,
    accept_applications: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  const supabase = createClient()

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', [
          'careers_page_enabled',
          'job_applications_enabled',
          'accept_applications',
        ])

      if (error) throw error

      const settingsMap: Record<string, boolean> = {}
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value === 'true'
      })

      setSettings(settingsMap)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({
        type: 'error',
        text: 'Failed to load settings',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage({ type: null, text: '' })

      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            setting_key: key,
            setting_value: String(value),
          }),
        })
      )

      const results = await Promise.all(updates)
      const allSuccessful = results.every((res) => res.ok)

      if (allSuccessful) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!',
        })
        setTimeout(() => setMessage({ type: null, text: '' }), 3000)
      } else {
        throw new Error('Some settings failed to update')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/settings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Careers Page Settings</h1>
        <p className="text-muted-foreground mt-1">
          Control the visibility and behavior of the careers page and job applications
        </p>
      </div>

      {/* Success/Error Messages */}
      {message.type && (
        <Alert
          className={
            message.type === 'success'
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-red-500/50 bg-red-500/10'
          }
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}
          >
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Careers Page Visibility */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <Label htmlFor="careers_page_enabled" className="text-lg font-semibold">
                  Careers Page
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable or disable the entire careers page. When disabled, users visiting{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/careers</code>{' '}
                will see a "Coming Soon" or "Not Available" message.
              </p>
            </div>
            <Switch
              id="careers_page_enabled"
              checked={settings.careers_page_enabled}
              onCheckedChange={() => handleToggle('careers_page_enabled')}
            />
          </div>
        </div>

        {/* Job Application Method */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <Label htmlFor="job_applications_enabled" className="text-lg font-semibold">
                  Use Dedicated Application Form
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Choose how applicants submit their applications:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${settings.job_applications_enabled ? 'bg-green-500' : 'bg-muted-foreground'}`}
                  />
                  <div>
                    <strong>ON (Recommended):</strong> Dedicated application form at{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/apply</code> with
                    resume upload, LinkedIn, portfolio fields. Applications saved to{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      job_applications
                    </code>{' '}
                    table.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full ${!settings.job_applications_enabled ? 'bg-orange-500' : 'bg-muted-foreground'}`}
                  />
                  <div>
                    <strong>OFF (Legacy):</strong> Uses contact form at{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/contact</code>.
                    Applications mixed with general inquiries in{' '}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">contacts</code>{' '}
                    table.
                  </div>
                </div>
              </div>
            </div>
            <Switch
              id="job_applications_enabled"
              checked={settings.job_applications_enabled}
              onCheckedChange={() => handleToggle('job_applications_enabled')}
              disabled={!settings.careers_page_enabled}
            />
          </div>
        </div>

        {/* Accept New Applications */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <Label htmlFor="accept_applications" className="text-lg font-semibold">
                  Accept New Applications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When disabled, the "Apply Now" button will be hidden and a message will inform
                users that applications are temporarily closed. Jobs will still be visible on
                the careers page.
              </p>
            </div>
            <Switch
              id="accept_applications"
              checked={settings.accept_applications}
              onCheckedChange={() => handleToggle('accept_applications')}
              disabled={!settings.careers_page_enabled}
            />
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Current Configuration
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${settings.careers_page_enabled ? 'bg-green-500' : 'bg-red-500'}`}
            />
            Careers page is{' '}
            <strong className="text-foreground">
              {settings.careers_page_enabled ? 'VISIBLE' : 'HIDDEN'}
            </strong>
          </div>
          {settings.careers_page_enabled && (
            <>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${settings.job_applications_enabled ? 'bg-green-500' : 'bg-orange-500'}`}
                />
                Using{' '}
                <strong className="text-foreground">
                  {settings.job_applications_enabled
                    ? 'DEDICATED APPLICATION FORM'
                    : 'CONTACT FORM (LEGACY)'}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${settings.accept_applications ? 'bg-green-500' : 'bg-orange-500'}`}
                />
                Applications are{' '}
                <strong className="text-foreground">
                  {settings.accept_applications ? 'OPEN' : 'CLOSED'}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
        <Button variant="outline" onClick={fetchSettings} disabled={loading || saving}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  )
}
