import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Clock, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function AdminInquiriesPage() {
  const supabase = await createClient()

  const { data: inquiries, error } = await supabase
    .from('service_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Service Inquiries</h1>
        <p className="text-muted-foreground text-sm mt-1">All service inquiry submissions from potential clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['new','contacted','in-progress','converted','rejected'].map((status) => (
          <div key={status} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {inquiries?.filter(i => i.status === status).length || 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold capitalize">{status}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-destructive text-sm">Error: {error.message}</div>}
        {!error && (!inquiries || inquiries.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-semibold">No service inquiries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/60 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries?.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{inquiry.name}</p>
                      <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                      {inquiry.company && <p className="text-xs text-muted-foreground">{inquiry.company}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-primary/10 text-primary/80 border border-primary/20 px-2.5 py-1 rounded-full capitalize">
                        {inquiry.service_type?.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground capitalize">
                      {inquiry.timeline?.replace(/-/g, ' ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground">{inquiry.budget || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inquiry.status === 'new' ? 'bg-primary/10 text-primary border border-primary/20' :
                        inquiry.status === 'contacted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        inquiry.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        inquiry.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-destructive border border-red-500/20'
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/inquiries/${inquiry.id}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
