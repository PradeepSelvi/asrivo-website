'use client'

import { useState, useEffect } from 'react'
import { signOutAdmin } from '@/lib/supabase/admin-actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FolderGit,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  Mail,
  Sparkles,
  FileUser,
  MailCheck,
  ShieldCheck,
  Settings,
  LogOut,
  User,
  ShieldAlert,
  Handshake,
  Calendar,
  Menu,
  X,
} from 'lucide-react'

interface AdminSidebarProps {
  user: { email: string; role: 'high' | 'low' }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const isHigh = user.role === 'high'

  const handleSignOut = async () => {
    await signOutAdmin()
    router.push('/admin/login')
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderGit },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Team Members', href: '/admin/team', icon: Users },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Job Postings', href: '/admin/jobs', icon: FileText },
  ]

  const crmItems = [
    { name: 'CRM Dashboard', href: '/admin/crm', icon: LayoutDashboard },
    { name: 'Leads', href: '/admin/crm/leads', icon: User },
    { name: 'Deals Pipeline', href: '/admin/crm/deals', icon: Briefcase },
    { name: 'Activities', href: '/admin/crm/activities', icon: MessageSquare },
    { name: 'Tasks', href: '/admin/crm/tasks', icon: FileText },
    { name: 'CRM Settings', href: '/admin/crm/settings', icon: Settings },
  ]

  const inboxItems = [
    { name: 'Contacts', href: '/admin/contacts', icon: Mail },
    { name: 'Service Inquiries', href: '/admin/inquiries', icon: Sparkles },
    { name: 'Consultations', href: '/admin/consultations', icon: Calendar },
    { name: 'Job Applications', href: '/admin/applications', icon: FileUser },
    { name: 'Partnerships', href: '/admin/partnerships', icon: Handshake },
    { name: 'Complaints', href: '/admin/complaints', icon: ShieldAlert },
    { name: 'Subscribers', href: '/admin/subscribers', icon: MailCheck },
  ]

  const systemItems = []
  if (isHigh) {
    systemItems.push({ name: 'Manage Admins', href: '/admin/admins', icon: ShieldCheck })
    systemItems.push({ name: 'Settings', href: '/admin/settings', icon: Settings })
  }

  return (
    <>
      {/* Mobile Menu Button - Fixed in top left with safe area */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed z-50 p-2.5 bg-card/95 backdrop-blur-md border-2 border-border rounded-xl shadow-xl hover:bg-muted hover:border-primary/50 transition-all active:scale-95 touch-manipulation"
        style={{
          top: 'max(12px, env(safe-area-inset-top))',
          left: '12px',
        }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-foreground" strokeWidth={2.5} />
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-72 bg-card border-r border-border flex flex-col shrink-0 h-screen transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:sticky top-0 z-50 lg:z-auto shadow-2xl lg:shadow-none overflow-hidden`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header/Logo - Fixed at top */}
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Admin Panel
            </span>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation Links - Scrollable with momentum scrolling for iOS */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Content
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-98 touch-manipulation"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              CRM
            </p>
            {crmItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-98 touch-manipulation"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>

          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Inbox
            </p>
            {inboxItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-98 touch-manipulation"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {systemItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                System
              </p>
              {systemItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-98 touch-manipulation"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Card & Logout - Fixed at bottom */}
        <div className="p-4 border-t border-border bg-background/40 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-foreground">{user.email}</p>
              <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isHigh ? 'bg-red-500/20 text-destructive border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-muted/50 hover:bg-destructive/10 hover:text-red-400 hover:border-red-900/30 text-muted-foreground rounded-lg py-2.5 text-xs font-semibold transition-all border border-border active:scale-95 touch-manipulation"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
