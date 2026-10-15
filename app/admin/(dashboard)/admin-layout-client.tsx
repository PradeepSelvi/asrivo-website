'use client'

import React, { useState, useEffect } from 'react'
import AdminSidebar from './admin-sidebar'
import NotificationBell from '@/components/admin/notification-bell'
import AutoLogout from '@/components/admin/auto-logout'
import AdminMobileBack from '@/components/admin/admin-mobile-back'
import { SessionRefresh } from '@/components/admin/session-refresh'
import { Menu } from 'lucide-react'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: { email: string; role: 'high' | 'low' }
  isHigh: boolean
}

export default function AdminLayoutClient({ children, user, isHigh }: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('')

  // Set date on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AutoLogout />
      <SessionRefresh />
      <div className="flex min-h-screen">
        <AdminSidebar 
          user={user} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-4 lg:px-8 flex items-center gap-4 sticky top-0 z-30">
            <AdminMobileBack />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {currentDate && (
                <div className="text-xs text-muted-foreground hidden md:block">
                  {currentDate}
                </div>
              )}
              <NotificationBell />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
