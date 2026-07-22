import React from 'react'
import { requireAdmin } from '@/lib/auth/admin-guard'
import AdminLayoutClient from './admin-layout-client'

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
