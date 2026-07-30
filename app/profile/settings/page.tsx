import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/supabase/profile-actions'
import { ProfileSettingsForm } from './profile-settings-form'
import { ArrowLeft, Settings } from 'lucide-react'

export const metadata = {
  title: 'Profile Settings - Asrivo Tech',
  description: 'Edit your profile settings',
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { profile } = await getCurrentUserProfile()

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Update your profile information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-background border border-border rounded-2xl p-6 md:p-8">
          <ProfileSettingsForm initialProfile={profile} userEmail={user.email || ''} />
        </div>
      </div>
    </div>
  )
}
