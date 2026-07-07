import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  FolderGit,
  Mail,
  Users,
  MailCheck,
  ArrowUpRight,
  Clock,
  User,
  Shield,
  MessageSquareOff,
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Fetch exact counts from various tables
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: contactsCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })

  const { count: inquiriesCount } = await supabase
    .from('service_inquiries')
    .select('*', { count: 'exact', head: true })

  const { count: applicationsCount } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })

  const { count: subscribersCount } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })

  const { count: teamCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })

  // 2. Fetch recent contact form submissions (latest 5)
  const { data: recentContacts } = await supabase
    .from('contacts')
    .select('id, name, email, company, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  // 3. Fetch recent service inquiries (latest 5)
  const { data: recentInquiries } = await supabase
    .from('service_inquiries')
    .select('id, name, email, service_type, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { name: 'Total Projects', value: projectsCount || 0, icon: FolderGit, href: '/admin/projects', color: 'text-indigo-400 bg-indigo-500/10' },
    { name: 'Contacts Submissions', value: contactsCount || 0, icon: Mail, href: '/admin/contacts', color: 'text-emerald-400 bg-emerald-500/10' },
    { name: 'Team Size', value: teamCount || 0, icon: Users, href: '/admin/team', color: 'text-blue-400 bg-blue-500/10' },
    { name: 'Newsletter Subscribers', value: subscribersCount || 0, icon: MailCheck, href: '/admin/subscribers', color: 'text-amber-400 bg-amber-500/10' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">System Dashboard</h1>
        <p className="text-slate-400 mt-2 text-sm">
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
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 hover:bg-slate-800/20 transition-all flex items-center justify-between group shadow-lg"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight group-hover:text-indigo-400 transition-colors">
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

      {/* Grid Layout for Inbox Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Contacts Submissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                Recent Contact Messages
              </h2>
              <Link
                href="/admin/contacts"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3 text-xs uppercase tracking-wider">Name</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentContacts && recentContacts.length > 0 ? (
                    recentContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-slate-850/30 transition-all">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-slate-200">{contact.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{contact.email}</p>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            contact.status === 'unread' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : contact.status === 'read' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-400 text-xs font-mono">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-600">
                        <MessageSquareOff className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        No recent contact form messages.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Service Inquiries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Recent Service Inquiries
              </h2>
              <Link
                href="/admin/inquiries"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3 text-xs uppercase tracking-wider">Client</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Service</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentInquiries && recentInquiries.length > 0 ? (
                    recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-slate-850/30 transition-all">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-slate-200">{inquiry.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{inquiry.email}</p>
                        </td>
                        <td className="py-3.5 text-slate-300 capitalize text-xs">
                          {inquiry.service_type.replace('-', ' ')}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            inquiry.status === 'new' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                              : inquiry.status === 'contacted'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {inquiry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-600">
                        <MessageSquareOff className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                        No recent service inquiries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Internal Security Quick Info */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-500 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Active Session Security Policy</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              This CMS enforces multi-tier role checks on both the client (UI rendering) and database level (Row Level Security).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <span className="text-xs font-mono text-emerald-400">Database Guard Active</span>
        </div>
      </div>
    </div>
  )
}
