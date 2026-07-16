import React from 'react'
import { signOutAdmin } from '@/lib/supabase/admin-actions'
import { requireAdmin } from '@/lib/auth/admin-guard'
import { redirect } from 'next/navigation'
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
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await requireAdmin()
  const isHigh = user.role === 'high'

  const handleSignOut = async () => {
    'use server'
    await signOutAdmin()
    redirect('/admin/login')
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderGit },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Team Members', href: '/admin/team', icon: Users },
    { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'Job Postings', href: '/admin/jobs', icon: FileText },
  ]

  const inboxItems = [
    { name: 'Contacts', href: '/admin/contacts', icon: Mail },
    { name: 'Service Inquiries', href: '/admin/inquiries', icon: Sparkles },
    { name: 'Job Applications', href: '/admin/applications', icon: FileUser },
    { name: 'Subscribers', href: '/admin/subscribers', icon: MailCheck },
  ]

  const systemItems = []
  if (isHigh) {
    systemItems.push({ name: 'Manage Admins', href: '/admin/admins', icon: ShieldCheck })
    systemItems.push({ name: 'Settings', href: '/admin/settings', icon: Settings })
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Header/Logo */}
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Content Management
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Inbox Submissions
              </p>
              {inboxItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {systemItems.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  System Settings
                </p>
                {systemItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border bg-background/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-foreground">{user.email}</p>
              <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.25 rounded uppercase tracking-wider ${isHigh ? 'bg-red-500/20 text-destructive border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                {user.role} Admin
              </span>
            </div>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-muted/50 hover:bg-destructive/10 hover:text-red-300 hover:border-red-900/30 text-muted-foreground rounded-lg py-2.5 text-xs font-semibold transition-all border border-border"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Security Clearance:</span>
            <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${isHigh ? 'bg-red-500/10 text-destructive border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              Level {isHigh ? '2 (High/Root)' : '1 (Low/Edit)'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            System time: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
