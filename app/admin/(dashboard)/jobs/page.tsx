import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/supabase/admin-actions'
import { Plus, Pencil, Trash2, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function AdminJobsPage() {
  const supabase = await createClient()
  const adminResult = await getCurrentAdmin()
  const isHigh = adminResult.user?.role === 'high'

  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Job Postings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage open positions and job listings.</p>
        </div>
        {isHigh && (
          <Link href="/admin/jobs/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Position
          </Link>
        )}
      </div>

      {!isHigh && (
        <div className="border border-blue-900/40 bg-blue-950/30 rounded-xl px-5 py-4 text-sm text-blue-300 flex items-center gap-3">
          <span className="text-lg">ℹ️</span>
          You have <strong>Editor</strong> access. You can edit job postings but cannot create or delete them.
        </div>
      )}

      <div className="space-y-4">
        {error && <div className="text-red-400 text-sm">Error: {error.message}</div>}
        {!error && (!jobs || jobs.length === 0) && (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="font-semibold">No job postings yet.</p>
          </div>
        )}
        {jobs?.map((job) => (
          <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-lg flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="font-bold text-slate-100 text-base">{job.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${job.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'}`}>
                  {job.active ? 'Hiring' : 'Closed'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-400">
                  {job.employment_type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {job.experience_level}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{job.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                {job.salary_range && <span className="text-emerald-500/70">{job.salary_range}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/admin/jobs/${job.id}/edit`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {isHigh && (
                <Link href={`/admin/jobs/${job.id}/delete`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
