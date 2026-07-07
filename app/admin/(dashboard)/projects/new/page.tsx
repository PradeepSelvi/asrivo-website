'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/supabase/content-actions'
import { FolderGit, ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [category, setCategory] = useState('web-app')
  const [clientName, setClientName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [status, setStatus] = useState('completed')
  const [featured, setFeatured] = useState(false)
  const [displayOrder, setDisplayOrder] = useState('1')
  
  // Technologies array tags
  const [techInput, setTechInput] = useState('')
  const [technologies, setTechnologies] = useState<string[]>([])

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput('')
    }
  }

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  // Auto-generate slug from title
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

    const result = await createProject({
      title,
      slug,
      description,
      long_description: longDescription || undefined,
      category,
      client_name: clientName || undefined,
      technologies,
      image_url: imageUrl || undefined,
      featured_image_url: featuredImageUrl || undefined,
      live_url: liveUrl || undefined,
      github_url: githubUrl || undefined,
      status,
      featured,
      display_order: parseInt(displayOrder) || 1
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create project')
      setLoading(false)
    } else {
      router.push('/admin/projects')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Project</h1>
          <p className="text-xs text-slate-500 mt-0.5">Publish a new portfolio project to your site.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. E-Commerce Platform"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Slug (URL Path)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              placeholder="e.g. e-commerce-platform"
              required
            />
          </div>
        </div>

        {/* Short description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Short Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            placeholder="A brief teaser shown in project grids..."
            required
          />
        </div>

        {/* Long description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Detailed Description</label>
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-36"
            placeholder="Detailed overview about the challenges, architecture, and results..."
          />
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="web-app">Web App</option>
              <option value="mobile-app">Mobile App</option>
              <option value="saas">SaaS</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="ai-ml">AI/ML</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              min="1"
            />
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Featured Image URL</label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Project URL</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">GitHub Repository URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        {/* Status / Featured flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Project Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:mt-6 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="featured" className="text-sm font-medium text-slate-200 select-none cursor-pointer">
              Feature this project on the homepage
            </label>
          </div>
        </div>

        {/* Technologies tagging input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Technologies Used</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Type technology (e.g. Next.js) and press Enter or Add"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold transition-all border border-slate-700"
            >
              Add
            </button>
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              {technologies.map((tech, index) => (
                <span key={tech} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-750">
                  {tech}
                  <button type="button" onClick={() => handleRemoveTech(index)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 justify-end">
          <Link href="/admin/projects" className="bg-slate-800 hover:bg-slate-755 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
