'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTeamMember } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0


export default function NewTeamMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState('1')
  const [active, setActive] = useState(true)
  
  // Social links
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')

  // Expertise array tags
  const [expInput, setExpInput] = useState('')
  const [expertise, setExpertise] = useState<string[]>([])

  const handleAddExp = () => {
    if (expInput.trim() && !expertise.includes(expInput.trim())) {
      setExpertise([...expertise, expInput.trim()])
      setExpInput('')
    }
  }

  const handleRemoveExp = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const result = await createTeamMember({
      name,
      position,
      email: email || undefined,
      bio: bio || undefined,
      image_url: imageUrl || undefined,
      expertise,
      social_links: { linkedin, github, twitter },
      display_order: parseInt(displayOrder) || 1,
      active
    })

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create team member')
      setLoading(false)
    } else {
      router.push('/admin/team')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/team" className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Team Member</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Publish a new profile to your company directory.</p>
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
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Senior Software Architect"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="username@company.com"
            />
          </div>

          
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24"
            placeholder="A short professional profile summary..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Profile Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="https://..."
          />
        </div>

        {/* Social profiles */}
        <div className="bg-background/40 p-4 border border-slate-850 rounded-xl space-y-4">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">Social Links</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase">Twitter URL</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>

        {/* Expertise tagging */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Expertise / Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expInput}
              onChange={(e) => setExpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExp())}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Node.js"
            />
            <button type="button" onClick={handleAddExp} className="bg-muted hover:bg-muted text-foreground px-4 rounded-xl text-sm font-semibold border border-border">Add</button>
          </div>
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-background/60 rounded-xl border border-slate-850">
              {expertise.map((exp, index) => (
                <span key={exp} className="inline-flex items-center gap-1 bg-muted text-foreground px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-750">
                  {exp}
                  <button type="button" onClick={() => handleRemoveExp(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-background/40 p-4 border border-slate-850 rounded-xl">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-medium text-foreground cursor-pointer select-none">
            Active (show profile on team directory page)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border justify-end">
          <Link href="/admin/team" className="bg-muted hover:bg-muted text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl border border-border transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Member
          </button>
        </div>
      </form>
    </div>
  )
}
