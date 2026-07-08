import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Clock, FileUser, ExternalLink, Briefcase } from 'lucide-react'

export default async function AdminApplicationsPage() {
  const supabase = await createClient()

  const { data: applications, error } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch job postings to map position_id to job title
  const { data: jobPostings } = await supabase
    .from('job_postings')
    .select('id, title')

  const jobTitleMap: Record<string, string> = {}
  jobPostings?.forEach((job) => {
    jobTitleMap[String(job.id)] = job.title
  })

  const statusColors: Record<string, string> = {
    new: 'bg-primary/10 text-primary border border-primary/20',
    reviewed: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    shortlisted: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    interviewed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    hired: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-red-500/10 text-destructive border border-red-500/20',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Applications</h1>
        <p className="text-muted-foreground text-sm mt-1">All submitted job applications from candidates.</p>
      </div>

      {/* Status quick stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.keys(statusColors).map((status) => (
          <div key={status} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{applications?.filter(a => a.status === status).length || 0}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5 capitalize">{status}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {error && <div className="p-6 text-destructive text-sm">Error: {error.message}</div>}
        {!error && (!applications || applications.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            <FileUser className="w-8 h-8 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold">No applications yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/60 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Posting</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Links</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{app.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                      {app.phone && <p className="text-xs text-muted-foreground">{app.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {app.position_id && jobTitleMap[String(app.position_id)] ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-primary/80">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          {jobTitleMap[String(app.position_id)]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">{app.job_title || '—'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{app.experience_years} years</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                            <ExternalLink className="w-3 h-3" /> Resume
                          </a>
                        )}
                        {app.linkedin_url && (
                          <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:text-primary/80">LinkedIn ↗</a>
                        )}
                        {app.portfolio_url && (
                          <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300">Portfolio ↗</a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-700 text-muted-foreground'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
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
