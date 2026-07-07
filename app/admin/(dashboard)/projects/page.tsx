import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ProjectsDndTable from './projects-dnd-table'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()
  const isHigh = adminResult.user?.role === 'high'

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your portfolio of projects. Drag to reorder.</p>
        </div>
        {isHigh && (
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
        )}
      </div>

      {/* Role Notice for Low Admins */}
      {!isHigh && (
        <div className="border border-blue-900/40 bg-blue-950/30 rounded-xl px-5 py-4 text-sm text-blue-300 flex items-center gap-3">
          <span className="text-lg">ℹ️</span>
          You have <strong>Editor</strong> access. You can view, edit, and reorder projects but cannot create or delete them.
        </div>
      )}

      {/* Projects Table */}
      {error && (
        <div className="p-6 text-red-400 text-sm bg-slate-900 border border-slate-800 rounded-2xl">Error loading projects: {error.message}</div>
      )}

      {!error && (!projects || projects.length === 0) ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-2xl mb-2">📁</p>
          <p className="font-semibold">No projects yet.</p>
          {isHigh && (
            <Link href="/admin/projects/new" className="mt-3 inline-block text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              + Create the first project
            </Link>
          )}
        </div>
      ) : (
        projects && <ProjectsDndTable projects={projects} isHigh={isHigh} />
      )}
    </div>
  )
}
