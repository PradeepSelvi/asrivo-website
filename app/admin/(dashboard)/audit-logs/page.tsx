import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
import { AuditLogsClient } from './audit-logs-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Audit Logs - Admin Panel',
}

export default async function AuditLogsPage() {
  const user = await requireAdmin()

  if (user.role !== 'high') {
    redirect('/admin')
  }

  return <AuditLogsClient />
}
