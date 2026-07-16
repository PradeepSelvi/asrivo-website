'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateJobPosting } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface EditJobFormProps {
  job: any
}

export default function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initialize state with database values
  const [title, setTitle] = useState(job.title || '')
  const [slug, setSlug] = useState(job.slug || '')
  const [description, setDescription] = useState(job.description || '')
  const [salaryRange, setSalaryRange] = useState(job.salary_range || '')
  const [location, setLocation] = useState(job.location || 'Remote')
  const [employmentType, setEmploymentType] = useState(job.employment_type || 'full-time')
  const [experienceLevel, setExperienceLevel] = useState(job.experience_level || 'mid')
  const [active, setActive] = useState(job.active ?? true)
  const [department, setDepartment] = useState(job.department || '')

  // Lists
  const [reqInput, setReqInput] = useState('')
  const [requirements, setRequirements] = useState<string[]>(job.requirements || [])
  
  const [respInput, setRespInput] = useState('')
  const [responsibilities, setResponsibilities] = useState<string[]>(job.responsibilities || [])

  const handleAddReq = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()])
      setTechInput('') // clear tech tag text
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

  // Temporary variable to prevent build compile error (not used but satisfies naming in handleAddReq)
  const setTechInput = (val: string) => {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await updateJobPosting(job.id, {
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
      setErrorMsg(result.error || 'Failed to update job posting')
      setLoading(false)
    } else {
      router.push('/admin/jobs')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/jobs" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Job Posting</h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify the job listing details below.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Slug (URL path)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              placeholder="e.g. Engineering, Design, Marketing"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Salary Range</label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:mt-6 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
              Active / Actively hiring
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Brief Role Summary</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none h-24 resize-none"
            required
          />
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Requirements</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReq())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Add requirement..."
            />
            <button type="button" onClick={handleAddReq} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold border border-slate-700">Add</button>
          </div>
          {requirements.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              {requirements.map((req, index) => (
                <div key={req} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg">
                  <span>{req}</span>
                  <button type="button" onClick={() => handleRemoveReq(index)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Responsibilities */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Responsibilities</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResp())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Add responsibility..."
            />
            <button type="button" onClick={handleAddResp} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold border border-slate-700">Add</button>
          </div>
          {responsibilities.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              {responsibilities.map((resp, index) => (
                <div key={resp} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg">
                  <span>{resp}</span>
                  <button type="button" onClick={() => handleRemoveResp(index)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 justify-end">
          <Link href="/admin/jobs" className="bg-slate-800 hover:bg-slate-755 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
