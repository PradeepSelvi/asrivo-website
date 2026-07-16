import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  FolderGit,
  Mail,
  Users,
  MailCheck,
  ArrowUpRight,
  Clock,
  Shield,
  MessageSquareOff,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
  const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true })
  const { count: inquiriesCount } = await supabase.from('service_inquiries').select('*', { count: 'exact', head: true })
  const { count: applicationsCount } = await supabase.from('job_applications').select('*', { count: 'exact', head: true })
  const { count: subscribersCount } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
  const { count: teamCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true })

  const { data: recentContacts } = await supabase
    .from('contacts')
    .select('id, name, email, company, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentInquiries } = await supabase
    .from('service_inquiries')
    .select('id, name, email, service_type, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { name: 'Total Projects',         value: projectsCount || 0,    icon: FolderGit, href: '/admin/projects',    color: 'text-primary bg-primary/10' },
    { name: 'Contact Submissions',    value: contactsCount || 0,    icon: Mail,      href: '/admin/contacts',    color: 'text-accent bg-accent/10' },
    { name: 'Team Size',              value: teamCount || 0,        icon: Users,     href: '/admin/team',        color: 'text-primary bg-primary/10' },
    { name: 'Newsletter Subscribers', value: subscribersCount || 0, icon: MailCheck, href: '/admin/subscribers', color: 'text-accent bg-accent/10' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Real-time analytics and management dashboard for Asrivo Tech.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-extrabold text-foreground mt-2 tracking-tight group-hover:text-primary transition-colors">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} transition-all group-hover:scale-110`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Inbox Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Recent Contacts */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Recent Contact Messages
            </h2>
            <Link href="/admin/contacts" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-3 text-xs uppercase tracking-wider">Name</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentContacts && recentContacts.length > 0 ? (
                  recentContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted/50 transition-all">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{contact.email}</p>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          contact.status === 'unread'
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : contact.status === 'read'
                            ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                            : 'bg-green-500/10 text-green-600 border border-green-500/20'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground text-xs">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      <MessageSquareOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No recent contact form messages.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Service Inquiries
            </h2>
            <Link href="/admin/inquiries" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-3 text-xs uppercase tracking-wider">Client</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Service</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentInquiries && recentInquiries.length > 0 ? (
                  recentInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-muted/50 transition-all">
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-foreground">{inquiry.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{inquiry.email}</p>
                      </td>
                      <td className="py-3.5 text-muted-foreground capitalize text-xs">
                        {inquiry.service_type.replace('-', ' ')}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          inquiry.status === 'new'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : inquiry.status === 'contacted'
                            ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                            : 'bg-green-500/10 text-green-600 border border-green-500/20'
                        }`}>
                          {inquiry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      <MessageSquareOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No recent service inquiries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Security Info */}
      <div className="bg-muted/30 border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Active Session Security Policy</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              This CMS enforces multi-tier role checks on both the client (UI rendering) and database level (Row Level Security).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-xs font-mono text-green-600">Database Guard Active</span>
        </div>
      </div>
    </div>
  )
}
