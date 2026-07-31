import React from 'react'
import { requireAdmin } from '@/lib/auth/admin-guard'
import AdminLayoutClient from './admin-layout-client'

// Force dynamic rendering for all admin pages to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAdmin()
  const isHigh = user.role === 'high'

  return (
    <AdminLayoutClient user={user} isHigh={isHigh}>
      {children}
    </AdminLayoutClient>
  )
}
