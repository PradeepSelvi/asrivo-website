import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ServicesDndTable from './services-dnd-table'

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()
  const isHigh = adminResult.user?.role === 'high'

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Services</h1>
          <p className="text-slate-400 text-sm mt-1">Manage the service offerings for your website. Drag to reorder.</p>
        </div>
        {isHigh && (
          <Link href="/admin/services/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        )}
      </div>

      {!isHigh && (
        <div className="border border-blue-900/40 bg-blue-950/30 rounded-xl px-5 py-4 text-sm text-blue-300 flex items-center gap-3">
          <span className="text-lg">ℹ️</span>
          You have <strong>Editor</strong> access. You can edit and reorder services but cannot create or delete them.
        </div>
      )}

      {error && <div className="p-6 text-red-400 text-sm bg-slate-900 border border-slate-800 rounded-2xl">Error loading services: {error.message}</div>}
      {!error && (!services || services.length === 0) ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-2xl mb-2">🛠️</p>
          <p className="font-semibold">No services yet.</p>
        </div>
      ) : (
        services && <ServicesDndTable services={services} isHigh={isHigh} />
      )}
    </div>
  )
}
