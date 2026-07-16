import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { MailCheck, CheckCircle, XCircle } from 'lucide-react'
import ExportCsvButton from './export-csv-button'

export default async function AdminSubscribersPage() {
  const supabase = await createClient()

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const active = subscribers?.filter(s => s.subscribed && s.verified).length || 0
  const pending = subscribers?.filter(s => s.subscribed && !s.verified).length || 0
  const unsubscribed = subscribers?.filter(s => !s.subscribed).length || 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all email newsletter subscriptions.</p>
        </div>
        <ExportCsvButton subscribers={subscribers || []} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{active}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Active & Verified</p>
        </div>
        <div className="bg-card border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pending}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Pending Verification</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{unsubscribed}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Unsubscribed</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-destructive text-sm">Error: {error.message}</div>}
        {!error && (!subscribers || subscribers.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            <MailCheck className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">No subscribers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/60 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-foreground">{sub.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{sub.name || '—'}</td>
                    <td className="px-6 py-4">
                      {sub.verified
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-amber-400" />
                      }
                    </td>
                    <td className="px-6 py-4">
                      {sub.subscribed
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-destructive" />
                      }
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      {new Date(sub.created_at).toLocaleDateString()}
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
