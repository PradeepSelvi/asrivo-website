'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTestimonial } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

interface NewTestimonialFormProps {
  projects: { id: any; title: string }[]
}

export default function NewTestimonialForm({ projects }: NewTestimonialFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [clientName, setClientName] = useState('')
  const [clientTitle, setClientTitle] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientImageUrl, setClientImageUrl] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState('5')
  const [projectId, setProjectId] = useState('')
  const [displayOrder, setDisplayOrder] = useState('1')
  const [featured, setFeatured] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await createTestimonial({
      client_name: clientName,
      client_title: clientTitle || undefined,
      client_company: clientCompany || undefined,
      client_image_url: clientImageUrl || undefined,
      content,
      rating: parseInt(rating) || 5,
      project_id: projectId ? parseInt(projectId) : null,
      display_order: parseInt(displayOrder) || 1,
      featured,
      verified: false // default verified to false until admin reviews/approves
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create testimonial')
      setLoading(false)
    } else {
      router.push('/admin/testimonials')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/testimonials" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Testimonial</h1>
          <p className="text-xs text-slate-500 mt-0.5">Publish a new client testimonial or review.</p>
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Sarah Jenkins"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Title / Role</label>
            <input
              type="text"
              value={clientTitle}
              onChange={(e) => setClientTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Chief Marketing Officer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Company</label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Client Photo URL</label>
            <input
              type="url"
              value={clientImageUrl}
              onChange={(e) => setClientImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Related Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">None / General</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title}
                </option>
              ))}
            </select>
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

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Testimonial Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32"
            placeholder="Write the client's detailed testimonial or review here..."
            required
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
          <input
            id="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
            Featured (highlights testimonial on key pages)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 justify-end">
          <Link href="/admin/testimonials" className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Testimonial
          </button>
        </div>
      </form>
    </div>
  )
}
