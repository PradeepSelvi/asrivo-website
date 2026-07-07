'use client'

import React from 'react'
import { reorderTeam } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2, User } from 'lucide-react'
import Link from 'next/link'

export default function TeamDndList({ members, isHigh }: { members: any[]; isHigh: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <ReorderableList
        items={members}
        onReorder={reorderTeam}
        droppableId="team-list"
        renderItem={(member) => (
          <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
            {/* Avatar */}
            {member.image_url ? (
              <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-100 text-sm truncate">{member.name}</p>
              <p className="text-xs text-indigo-400 font-medium">{member.position}</p>
              <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${member.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                {member.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/team/${member.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Link>
              {isHigh && (
                <Link href={`/admin/team/${member.id}/delete`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Link>
              )}
            </div>
          </div>
        )}
      />
    </div>
  )
}
