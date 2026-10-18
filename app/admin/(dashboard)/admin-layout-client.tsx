'use client'

import React, { useState, useEffect } from 'react'
import AdminSidebar from './admin-sidebar'
import NotificationBell from '@/components/admin/notification-bell'
import AutoLogout from '@/components/admin/auto-logout'
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
    <div className="h-screen overflow-hidden bg-background text-foreground font-sans">
      <AutoLogout />
      <SessionRefresh />
      
      {/* Single Top Header - spans full width */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center shrink-0 z-40">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2.5 ml-4 rounded-lg hover:bg-muted transition-colors text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Desktop: Logo section matching sidebar width */}
        <div className="hidden lg:flex items-center gap-3 w-72 px-5 border-r border-border shrink-0">
          <img
            src="/asrivo.png"
            alt="Asrivo Tech Logo"
            className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0 border border-border/50"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-foreground leading-tight">
              ASRIVO TECH
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Portal</span>
          </div>
        </div>
        
        {/* Right side content */}
        <div className="flex-1 flex items-center justify-end gap-3 px-4 lg:px-8">
          {currentDate && (
            <div className="text-xs text-muted-foreground hidden md:block">
              {currentDate}
            </div>
          )}
          <NotificationBell />
        </div>
      </header>

      {/* Content Container - below header */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <AdminSidebar 
          user={user} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
