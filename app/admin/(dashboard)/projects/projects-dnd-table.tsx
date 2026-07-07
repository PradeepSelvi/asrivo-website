'use client'

import React from 'react'
import { reorderProjects } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2, ExternalLink, Star } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsDndTable({ projects, isHigh }: { projects: any[]; isHigh: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Header */}
      <div className="bg-slate-950/60 border-b border-slate-800 grid grid-cols-[1fr_120px_90px_60px_100px] px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Project</span>
        <span>Category</span>
        <span>Status</span>
        <span>Featured</span>
        <span>Actions</span>
      </div>

      <ReorderableList
        items={projects}
        onReorder={reorderProjects}
        droppableId="projects-list"
        renderItem={(project) => (
          <div className="grid grid-cols-[1fr_120px_90px_60px_100px] items-center px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
            <div>
              <p className="font-semibold text-slate-100 text-sm">{project.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{project.description}</p>
            </div>
            <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full capitalize w-fit">
              {project.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit ${
              project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              project.status === 'ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}>
              {project.status}
            </span>
            <div>
              {project.featured ? (
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Star className="w-4 h-4 text-slate-700" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all" title="View Live">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <Link href={`/admin/projects/${project.id}/edit`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {isHigh && (
                <Link href={`/admin/projects/${project.id}/delete`}
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
