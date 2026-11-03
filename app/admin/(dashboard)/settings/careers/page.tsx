import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { CareersSettingsClient } from './careers-settings-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Careers Settings - Admin Panel',
}

export default async function CareersSettingsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  return <CareersSettingsClient />
}
