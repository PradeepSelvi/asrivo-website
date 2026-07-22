'use client'

import React from 'react'
import { reorderServices } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ServicesDndTable({ services, isHigh }: { services: any[]; isHigh: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[1fr_140px_80px_60px_80px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
          <>
            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-[1fr_140px_80px_60px_80px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
              <div>
                <p className="font-semibold text-foreground text-sm">{service.title}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{service.description}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{service.slug}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${service.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-muted-foreground'}`}>
                {service.active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-muted-foreground text-xs">{service.display_order}</span>
              <div className="flex items-center gap-2">
                <Link href={`/admin/services/${service.id}/edit`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
                  <Pencil className="w-4 h-4" />
                </Link>
                {isHigh && (
                  <Link href={`/admin/services/${service.id}/delete`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-500/10 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{service.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${service.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-muted-foreground'}`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
                <span className="font-mono text-xs text-muted-foreground">#{service.display_order}</span>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{service.slug}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href={`/admin/services/${service.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
                {isHigh && (
                  <Link href={`/admin/services/${service.id}/delete`}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-destructive hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      />
    </div>
  )
}
