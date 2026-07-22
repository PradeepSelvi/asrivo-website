'use client'

import React from 'react'
import { reorderTeam } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2, User } from 'lucide-react'
import Link from 'next/link'

export default function TeamDndList({ members, isHigh }: { members: any[]; isHigh: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      <ReorderableList
        items={members}
        onReorder={reorderTeam}
        droppableId="team-list"
        renderItem={(member) => (
          <>
            {/* Desktop View */}
            <div className="hidden lg:flex items-center gap-4 px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
              {/* Avatar */}
              {member.image_url ? (
                <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-border shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{member.name}</p>
                <p className="text-xs text-primary font-medium">{member.position}</p>
                <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${member.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-muted-foreground'}`}>
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/team/${member.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                {isHigh && (
                  <Link href={`/admin/team/${member.id}/delete`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {member.image_url ? (
                  <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-border shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{member.name}</p>
                  <p className="text-xs text-primary font-medium">{member.position}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${member.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-muted-foreground'}`}>
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Link href={`/admin/team/${member.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                {isHigh && (
                  <Link href={`/admin/team/${member.id}/delete`}
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
