'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeamMember } from '@/lib/supabase/content-actions'
import { ArrowLeft, Loader2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface EditTeamFormProps {
  member: any
}

export default function EditTeamForm({ member }: EditTeamFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initialize state from database values
  const [name, setName] = useState(member.name || '')
  const [position, setPosition] = useState(member.position || '')
  const [email, setEmail] = useState(member.email || '')
  const [bio, setBio] = useState(member.bio || '')
  const [imageUrl, setImageUrl] = useState(member.image_url || '')
  const [displayOrder, setDisplayOrder] = useState(String(member.display_order || '1'))
  const [active, setActive] = useState(member.active ?? true)
  
  // Social links
  const [linkedin, setLinkedin] = useState(member.social_links?.linkedin || '')
  const [github, setGithub] = useState(member.social_links?.github || '')
  const [twitter, setTwitter] = useState(member.social_links?.twitter || '')

  // Expertise array tags
  const [expInput, setExpInput] = useState('')
  const [expertise, setExpertise] = useState<string[]>(member.expertise || [])

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

    const result = await updateTeamMember(member.id, {
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
      setErrorMsg(result.error || 'Failed to update team member')
      setLoading(false)
    } else {
      router.push('/admin/team')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/team" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Team Member</h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify profile details below.</p>
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Profile Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Social profiles */}
        <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Social Links</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Twitter URL</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Expertise tags */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Expertise / Skills</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expInput}
              onChange={(e) => setExpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExp())}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              placeholder="e.g. React"
            />
            <button type="button" onClick={handleAddExp} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-sm font-semibold border border-slate-700">Add</button>
          </div>
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850">
              {expertise.map((exp, index) => (
                <span key={exp} className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-750">
                  {exp}
                  <button type="button" onClick={() => handleRemoveExp(index)} className="text-slate-500 hover:text-red-400">
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
            Active (show profile on directory directory page)
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-slate-800 justify-end">
          <Link href="/admin/team" className="bg-slate-800 hover:bg-slate-755 text-slate-300 text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all">
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
