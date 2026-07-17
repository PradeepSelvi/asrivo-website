'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/supabase/content-actions'
import { FolderGit, ArrowLeft, Loader2, Plus, X, AlertCircle } from 'lucide-react'
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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()])
      setTechInput('')
    }
  }

  const handleRemoveTech = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  // Validation helpers
  const isValidUrl = (url: string): boolean => {
    if (!url) return true // Empty is valid (optional fields)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'title':
        if (!value.trim()) return 'Title is required'
        if (value.length < 3) return 'Title must be at least 3 characters'
        if (value.length > 200) return 'Title must be less than 200 characters'
        return null
      case 'slug':
        if (!value.trim()) return 'Slug is required'
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug can only contain lowercase letters, numbers, and hyphens'
        if (value.length < 3) return 'Slug must be at least 3 characters'
        if (value.length > 200) return 'Slug must be less than 200 characters'
        return null
      case 'description':
        if (!value.trim()) return 'Short description is required'
        if (value.length < 10) return 'Description must be at least 10 characters'
        if (value.length > 500) return 'Description must be less than 500 characters'
        return null
      case 'longDescription':
        if (value && value.length > 5000) return 'Detailed description must be less than 5000 characters'
        return null
      case 'imageUrl':
      case 'featuredImageUrl':
      case 'liveUrl':
      case 'githubUrl':
        if (value && !isValidUrl(value)) return 'Please enter a valid URL (e.g., https://example.com)'
        return null
      case 'displayOrder':
        const num = parseInt(value)
        if (isNaN(num) || num < 1) return 'Display order must be a positive number'
        return null
      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    const titleError = validateField('title', title)
    if (titleError) newErrors.title = titleError
    
    const slugError = validateField('slug', slug)
    if (slugError) newErrors.slug = slugError
    
    const descError = validateField('description', description)
    if (descError) newErrors.description = descError
    
    const longDescError = validateField('longDescription', longDescription)
    if (longDescError) newErrors.longDescription = longDescError
    
    const imageUrlError = validateField('imageUrl', imageUrl)
    if (imageUrlError) newErrors.imageUrl = imageUrlError
    
    const featuredImageUrlError = validateField('featuredImageUrl', featuredImageUrl)
    if (featuredImageUrlError) newErrors.featuredImageUrl = featuredImageUrlError
    
    const liveUrlError = validateField('liveUrl', liveUrl)
    if (liveUrlError) newErrors.liveUrl = liveUrlError
    
    const githubUrlError = validateField('githubUrl', githubUrl)
    if (githubUrlError) newErrors.githubUrl = githubUrlError
    
    const displayOrderError = validateField('displayOrder', displayOrder)
    if (displayOrderError) newErrors.displayOrder = displayOrderError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    clearError('title')
    const newSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(newSlug)
    clearError('slug')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!validateForm()) {
      setErrorMsg('Please fix the validation errors below')
      return
    }

    setLoading(true)

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
        <Link href="/admin/projects" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Project</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Publish a new portfolio project to your site.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-red-200 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="e.g. E-Commerce Platform"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{title.length}/200 characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Slug (URL Path) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                clearError('slug')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 font-mono ${
                errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="e.g. e-commerce-platform"
              maxLength={200}
            />
            {errors.slug && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.slug}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
          </div>
        </div>

        {/* Short description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              clearError('description')
            }}
            className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 h-20 resize-none ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
            }`}
            placeholder="A brief teaser shown in project grids..."
            maxLength={500}
          />
          {errors.description && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
        </div>

        {/* Long description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Detailed Description</label>
          <textarea
            value={longDescription}
            onChange={(e) => {
              setLongDescription(e.target.value)
              clearError('longDescription')
            }}
            className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 h-36 ${
              errors.longDescription ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
            }`}
            placeholder="Detailed overview about the challenges, architecture, and results..."
            maxLength={5000}
          />
          {errors.longDescription && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {errors.longDescription}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{longDescription.length}/5000 characters</p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => {
                setDisplayOrder(e.target.value)
                clearError('displayOrder')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.displayOrder ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              min="1"
            />
            {errors.displayOrder && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.displayOrder}
              </p>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                clearError('imageUrl')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.imageUrl ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="https://..."
            />
            {errors.imageUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.imageUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Featured Image URL</label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => {
                setFeaturedImageUrl(e.target.value)
                clearError('featuredImageUrl')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.featuredImageUrl ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="https://..."
            />
            {errors.featuredImageUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.featuredImageUrl}
              </p>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Live Project URL</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => {
                setLiveUrl(e.target.value)
                clearError('liveUrl')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.liveUrl ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="https://..."
            />
            {errors.liveUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.liveUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">GitHub Repository URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                clearError('githubUrl')
              }}
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 ${
                errors.githubUrl ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
              }`}
              placeholder="https://github.com/..."
            />
            {errors.githubUrl && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.githubUrl}
              </p>
            )}
          </div>
        </div>

        {/* Status / Featured flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Project Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:mt-6 bg-background/40 p-4 border border-slate-850 rounded-xl">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-primary focus:ring-offset-slate-900"
            />
            <label htmlFor="featured" className="text-sm font-medium text-foreground select-none cursor-pointer">
              Feature this project on the homepage
            </label>
          </div>
        </div>

        {/* Technologies tagging input */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Technologies Used</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Type technology (e.g. Next.js) and press Enter or Add"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-muted hover:bg-muted text-foreground px-4 rounded-xl text-sm font-semibold transition-all border border-border"
            >
              Add
            </button>
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-background/60 rounded-xl border border-slate-850">
              {technologies.map((tech, index) => (
                <span key={tech} className="inline-flex items-center gap-1 bg-muted text-foreground px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-750">
                  {tech}
                  <button type="button" onClick={() => handleRemoveTech(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link href="/admin/projects" className="bg-muted hover:bg-slate-755 text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl border border-border transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
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
