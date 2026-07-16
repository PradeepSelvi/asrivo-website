'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateService } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface EditServiceFormProps {
  service: any
}

export default function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initialize state with database values
  const [title, setTitle] = useState(service.title || '')
  const [slug, setSlug] = useState(service.slug || '')
  const [description, setDescription] = useState(service.description || '')
  const [fullDescription, setFullDescription] = useState(service.full_description || '')
  const [icon, setIcon] = useState(service.icon || 'Briefcase')
  const [displayOrder, setDisplayOrder] = useState(String(service.display_order || '1'))
  const [active, setActive] = useState(service.active ?? true)
  const [pricing, setPricing] = useState(service.pricing || '')
  
  // Lists
  const [featInput, setFeatInput] = useState('')
  const [features, setFeatures] = useState<string[]>(service.features || [])
  
  const [techInput, setTechInput] = useState('')
  const [technologies, setTechnologies] = useState<string[]>(service.technologies || [])

  const handleAddFeat = () => {
    if (featInput.trim() && !features.includes(featInput.trim())) {
      setFeatures([...features, featInput.trim()])
      setFeatInput('')
    }
  }

  const handleRemoveFeat = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput('')
    }
  }

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
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

    const result = await updateService(service.id, {
      title,
      slug,
      description,
      full_description: fullDescription || undefined,
      icon,
      features,
      technologies,
      display_order: parseInt(displayOrder) || 1,
      active,
      pricing: pricing || undefined
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update service')
      setLoading(false)
    } else {
      router.push('/admin/services')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/services" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Service</h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify the service offering details below.</p>
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Service Title</label>
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Icon Class Name</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
              min="1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Short Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none h-20 resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Detailed Description</label>
          <textarea
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none h-32"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pricing / Estimate</label>
          <input
            type="text"
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            placeholder="e.g. Starting at $5,000 or Contact for quote"
          />
        </div>

        {/* Features list */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Key Features</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featInput}
              onChange={(e) => setFeatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeat())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Add key feature..."
            />
            <button type="button" onClick={handleAddFeat} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold border border-slate-700">Add</button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              {features.map((feat, index) => (
                <div key={feat} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg">
                  <span>{feat}</span>
                  <button type="button" onClick={() => handleRemoveFeat(index)} className="text-slate-500 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technologies list */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Technologies Used</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="Add technology..."
            />
            <button type="button" onClick={handleAddTech} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold border border-slate-700">Add</button>
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

        <div className="flex items-center gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
            Active (show service on listing pages)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 justify-end">
          <Link href="/admin/services" className="bg-slate-800 hover:bg-slate-755 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all">
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
