import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Mail, Building, Clock, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function AdminContactsPage() {
  const supabase = await createClient()

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  const statusCounts = {
    unread: contacts?.filter(c => c.status === 'unread').length || 0,
    read: contacts?.filter(c => c.status === 'read').length || 0,
    responded: contacts?.filter(c => c.status === 'responded').length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Contact Messages</h1>
        <p className="text-slate-400 text-sm mt-1">All contact form submissions from website visitors.</p>
      </div>

      {/* Status Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-red-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{statusCounts.unread}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Unread</p>
        </div>
        <div className="bg-slate-900 border border-amber-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{statusCounts.read}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Read</p>
        </div>
        <div className="bg-slate-900 border border-emerald-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{statusCounts.responded}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Responded</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-red-400 text-sm">Error: {error.message}</div>}
        {!error && (!contacts || contacts.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">No contact messages yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject / Message</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {contacts?.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-800/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-100 flex items-center gap-2">
                        {contact.status === 'unread' && <span className="w-2 h-2 bg-red-400 rounded-full shrink-0"></span>}
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                      {contact.phone && <p className="text-xs text-slate-600">{contact.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {contact.company ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Building className="w-3.5 h-3.5" />
                          {contact.company}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {contact.subject && <p className="font-semibold text-slate-300 text-xs mb-0.5">{contact.subject}</p>}
                      <p className="text-xs text-slate-500 line-clamp-2">{contact.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        contact.status === 'unread' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        contact.status === 'read' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/contacts/${contact.id}`}
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
