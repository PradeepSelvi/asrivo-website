import { requireAdmin } from '@/lib/auth/admin-guard'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell, Mail, MessageSquare, Calendar, FileUser, Handshake, ShieldAlert, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Notifications - Admin Panel',
  description: 'View all client requests and notifications',
}

export default async function NotificationsPage() {
  await requireAdmin()
  
  const supabase = await createClient()
  
  // Fetch all pending items
  const [contacts, inquiries, consultations, applications, partnerships, complaints] = await Promise.all([
    supabase.from('contacts').select('*').eq('status', 'unread').order('created_at', { ascending: false }),
    supabase.from('client_inquiries').select('*').eq('status', 'new').order('created_at', { ascending: false }),
    supabase.from('consultation_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('job_applications').select('*').eq('status', 'new').order('created_at', { ascending: false }),
    supabase.from('partnership_requests').select('*').eq('status', 'new').order('created_at', { ascending: false }),
    supabase.from('complaints').select('*').eq('status', 'new').order('created_at', { ascending: false }),
  ])

  const sections = [
    {
      title: 'Contact Messages',
      icon: Mail,
      color: 'blue',
      count: contacts.data?.length || 0,
      items: contacts.data || [],
      link: '/admin/contacts',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: item.email,
        description: item.message,
        date: item.created_at,
        link: `/admin/contacts/${item.id}`
      })
    },
    {
      title: 'Service Inquiries',
      icon: MessageSquare,
      color: 'purple',
      count: inquiries.data?.length || 0,
      items: inquiries.data || [],
      link: '/admin/inquiries',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: item.company,
        description: `${item.service_type} - ${item.project_description?.substring(0, 100)}`,
        date: item.created_at,
        link: `/admin/inquiries/${item.id}`
      })
    },
    {
      title: 'Consultation Requests',
      icon: Calendar,
      color: 'green',
      count: consultations.data?.length || 0,
      items: consultations.data || [],
      link: '/admin/consultations',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: item.email,
        description: item.consultation_type || 'General consultation',
        date: item.created_at,
        link: `/admin/consultations/${item.id}`
      })
    },
    {
      title: 'Job Applications',
      icon: FileUser,
      color: 'orange',
      count: applications.data?.length || 0,
      items: applications.data || [],
      link: '/admin/applications',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.full_name,
        subtitle: item.email,
        description: `Applied for: ${item.position_applied}`,
        date: item.created_at,
        link: '/admin/applications'
      })
    },
    {
      title: 'Partnership Requests',
      icon: Handshake,
      color: 'pink',
      count: partnerships.data?.length || 0,
      items: partnerships.data || [],
      link: '/admin/partnerships',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.company_name,
        subtitle: item.contact_person,
        description: item.partnership_type || 'Partnership inquiry',
        date: item.created_at,
        link: '/admin/partnerships'
      })
    },
    {
      title: 'Complaints',
      icon: ShieldAlert,
      color: 'red',
      count: complaints.data?.length || 0,
      items: complaints.data || [],
      link: '/admin/complaints',
      renderItem: (item: any) => ({
        id: item.id,
        title: item.name,
        subtitle: item.email,
        description: item.complaint_type || 'General complaint',
        date: item.created_at,
        link: `/admin/complaints/${item.id}`
      })
    },
  ]

  const totalNotifications = sections.reduce((sum, section) => sum + section.count, 0)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 lg:px-8 py-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">All Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {totalNotifications > 0 
                ? `You have ${totalNotifications} pending notification${totalNotifications !== 1 ? 's' : ''}`
                : 'All caught up! No pending notifications'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Sections */}
      <div className="px-4 lg:px-8 space-y-8">
        {sections.map((section) => {
          const Icon = section.icon
          const colorClasses = {
            blue: 'text-blue-500 bg-blue-500/10',
            purple: 'text-purple-500 bg-purple-500/10',
            green: 'text-green-500 bg-green-500/10',
            orange: 'text-orange-500 bg-orange-500/10',
            pink: 'text-pink-500 bg-pink-500/10',
            red: 'text-red-500 bg-red-500/10',
          }[section.color]

          return (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${colorClasses} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {section.title}
                  </h2>
                  {section.count > 0 && (
                    <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      {section.count}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={section.link}>
                    View all
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              {section.count === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No new {section.title.toLowerCase()}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {section.items.slice(0, 5).map((item) => {
                    const rendered = section.renderItem(item)
                    return (
                      <Link
                        key={rendered.id}
                        href={rendered.link}
                        className="block rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{rendered.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{rendered.subtitle}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{rendered.description}</p>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(rendered.date).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  {section.count > 5 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={section.link}>
                        View all {section.count} {section.title.toLowerCase()}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
