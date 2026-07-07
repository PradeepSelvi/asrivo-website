'use client'

import React from 'react'
import { reorderServices } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ServicesDndTable({ services, isHigh }: { services: any[]; isHigh: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950/60 border-b border-slate-800 grid grid-cols-[1fr_140px_80px_60px_80px] px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Service</span>
        <span>Slug</span>
        <span>Status</span>
        <span>Order</span>
        <span>Actions</span>
      </div>

      <ReorderableList
        items={services}
        onReorder={reorderServices}
        droppableId="services-list"
        renderItem={(service) => (
          <div className="grid grid-cols-[1fr_140px_80px_60px_80px] items-center px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
            <div>
              <p className="font-semibold text-slate-100 text-sm">{service.title}</p>
              <p className="text-xs text-slate-500 truncate max-w-xs">{service.description}</p>
            </div>
            <span className="font-mono text-xs text-slate-400">{service.slug}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${service.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
              {service.active ? 'Active' : 'Inactive'}
            </span>
            <span className="text-slate-400 text-xs">{service.display_order}</span>
            <div className="flex items-center gap-2">
              <Link href={`/admin/services/${service.id}/edit`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {isHigh && (
                <Link href={`/admin/services/${service.id}/delete`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      />
    </div>
  )
}
