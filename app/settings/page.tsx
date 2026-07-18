'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Setting {
  id: number
  key: string
  value: string
  description: string
  type: string
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        toast.error('Unauthorized access - Please login')
        router.push('/') // Redirect to home page
        return
      }

      setAuthenticated(true)
      fetchSettings()
    } catch (error) {
      toast.error('Authentication error')
      router.push('/')
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (response.ok) {
        setSettings(data.settings)
        // Extract social links
        const linkedin = data.settings.find((s: Setting) => s.key === 'linkedin_url')?.value || ''
        const github = data.settings.find((s: Setting) => s.key === 'github_url')?.value || ''
        const twitter = data.settings.find((s: Setting) => s.key === 'twitter_url')?.value || ''
        setSocialLinks({ linkedin, github, twitter })
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      toast.error('Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSocialLinks = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socialLinks),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Social links updated successfully!')
        fetchSettings() // Refresh settings
      } else {
        toast.error(data.error || 'Failed to update social links')
      }
    } catch (error) {
      toast.error('Error updating social links')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !authenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Update your company's social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/company/yourcompany"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/yourcompany"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, github: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/yourcompany"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
              />
            </div>
          </div>
          <Button
            onClick={handleSaveSocialLinks}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save Social Links'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Settings</CardTitle>
          <CardDescription>
            Current configuration values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((setting) => (
              <div key={setting.key} className="p-4 border rounded-lg">
                <div className="font-medium">{setting.key}</div>
                <div className="text-sm text-muted-foreground">{setting.description}</div>
                <div className="mt-1 font-mono text-sm">{setting.value || '(empty)'}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}