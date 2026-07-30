import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from './profile-view'
import { getCurrentUserProfile } from '@/lib/supabase/profile-actions'

export const metadata = {
  title: 'My Profile - Asrivo Tech',
  description: 'View and manage your profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { profile } = await getCurrentUserProfile()

  return <ProfileView initialProfile={profile} user={user} />
}
