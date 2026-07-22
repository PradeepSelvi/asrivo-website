import React from 'react'
import { requireAdmin } from '@/lib/auth/admin-guard'
import AdminSidebar from './admin-sidebar'
import NotificationBell from '@/components/admin/notification-bell'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAdmin()
  const isHigh = user.role === 'high'

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="flex min-h-screen">
        <AdminSidebar user={user} />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-4 lg:px-8 flex items-center gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm text-muted-foreground hidden sm:inline">Security Clearance:</span>
              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${isHigh ? 'bg-red-500/10 text-destructive border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                Level {isHigh ? '2' : '1'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground hidden md:block">
                {new Date().toLocaleDateString()}
              </div>
              <NotificationBell />
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
