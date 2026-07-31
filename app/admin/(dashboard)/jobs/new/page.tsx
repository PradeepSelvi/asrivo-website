'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createJobPosting } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [location, setLocation] = useState('Remote')
  const [employmentType, setEmploymentType] = useState('full-time')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [active, setActive] = useState(true)
  const [department, setDepartment] = useState('')

  // Lists
  const [reqInput, setReqInput] = useState('')
  const [requirements, setRequirements] = useState<string[]>([])
  
  const [respInput, setRespInput] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>([])

  const handleAddReq = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()])
      setReqInput('')
    }
  }

  const handleRemoveReq = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleAddResp = () => {
    if (respInput.trim() && !responsibilities.includes(respInput.trim())) {
      setResponsibilities([...responsibilities, respInput.trim()])
      setRespInput('')
    }
  }

  const handleRemoveResp = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index))
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await createJobPosting({
      title,
      slug,
      description,
      requirements,
      responsibilities,
      salary_range: salaryRange || undefined,
      location: location || undefined,
      employment_type: employmentType,
      experience_level: experienceLevel,
      active,
      department: department || undefined
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create job posting')
      setLoading(false)
    } else {
      router.push('/admin/jobs')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/jobs" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Job Posting</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Publish a new job opening to your careers page.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Slug (URL path)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              placeholder="e.g. Engineering, Design, Marketing"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              placeholder="e.g. Remote, New York..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Salary Range</label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              placeholder="e.g. $80k - $120k"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:mt-6 bg-background/40 p-4 border border-slate-850 rounded-xl">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-primary"
            />
            <label htmlFor="active" className="text-sm font-medium text-foreground cursor-pointer select-none">
              Active / Actively hiring
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Brief Role Summary</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none h-24 resize-none"
            placeholder="Introduce the role..."
            required
          />
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Requirements</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReq())}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none"
              placeholder="e.g. 3+ years experience with React"
            />
            <button type="button" onClick={handleAddReq} className="bg-muted hover:bg-muted text-foreground px-4 rounded-xl text-sm font-semibold border border-border">Add</button>
          </div>
          {requirements.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-background/60 rounded-xl border border-slate-850">
              {requirements.map((req, index) => (
                <div key={req} className="flex items-center justify-between text-xs text-foreground bg-card border border-slate-850 px-3 py-1.5 rounded-lg">
                  <span>{req}</span>
                  <button type="button" onClick={() => handleRemoveReq(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Responsibilities */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Responsibilities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResp())}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none"
              placeholder="e.g. Build and maintain dashboard UI features"
            />
            <button type="button" onClick={handleAddResp} className="bg-muted hover:bg-muted text-foreground px-4 rounded-xl text-sm font-semibold border border-border">Add</button>
          </div>
          {responsibilities.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-background/60 rounded-xl border border-slate-850">
              {responsibilities.map((resp, index) => (
                <div key={resp} className="flex items-center justify-between text-xs text-foreground bg-card border border-slate-850 px-3 py-1.5 rounded-lg">
                  <span>{resp}</span>
                  <button type="button" onClick={() => handleRemoveResp(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link href="/admin/jobs" className="bg-muted hover:bg-slate-755 text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl border border-border transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Publish Posting
          </button>
        </div>
      </form>
    </div>
  )
}
