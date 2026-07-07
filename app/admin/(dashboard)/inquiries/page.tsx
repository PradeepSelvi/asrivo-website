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
        <h1 className="text-3xl font-bold text-white tracking-tight">Service Inquiries</h1>
        <p className="text-slate-400 text-sm mt-1">All service inquiry submissions from potential clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['new','contacted','in-progress','converted','rejected'].map((status) => (
          <div key={status} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {inquiries?.filter(i => i.status === status).length || 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold capitalize">{status}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-red-400 text-sm">Error: {error.message}</div>}
        {!error && (!inquiries || inquiries.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold">No service inquiries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {inquiries?.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-100">{inquiry.name}</p>
                      <p className="text-xs text-slate-500">{inquiry.email}</p>
                      {inquiry.company && <p className="text-xs text-slate-600">{inquiry.company}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full capitalize">
                        {inquiry.service_type?.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 capitalize">
                      {inquiry.timeline?.replace(/-/g, ' ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">{inquiry.budget || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inquiry.status === 'new' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        inquiry.status === 'contacted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        inquiry.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        inquiry.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/inquiries/${inquiry.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="View Details">
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
