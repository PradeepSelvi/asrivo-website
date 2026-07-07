'use client'

import React from 'react'
import { reorderTestimonials, toggleTestimonialVerified } from '@/lib/supabase/content-actions'
import ReorderableList from '@/components/admin/reorderable-list'
import { Pencil, Trash2, Star, User, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TestimonialsDndTable({ testimonials, isHigh }: { testimonials: any[]; isHigh: boolean }) {
  const router = useRouter()

  const handleToggleVerify = async (id: string | number, currentStatus: boolean) => {
    const result = await toggleTestimonialVerified(id, currentStatus)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to toggle verification status')
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950/60 border-b border-slate-800 grid grid-cols-[1.5fr_2fr_1fr_100px_100px_60px_80px] px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Client</span>
        <span>Content</span>
        <span>Rating</span>
        <span>Verified</span>
        <span>Featured</span>
        <span>Order</span>
        <span>Actions</span>
      </div>

      <ReorderableList
        items={testimonials}
        onReorder={reorderTestimonials}
        droppableId="testimonials-list"
        renderItem={(testimonial) => (
          <div className="grid grid-cols-[1.5fr_2fr_1fr_100px_100px_60px_80px] items-center px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
            {/* Client info */}
            <div className="flex items-center gap-3 min-w-0">
              {testimonial.client_image_url ? (
                <img src={testimonial.client_image_url} alt={testimonial.client_name} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-100 truncate text-sm">{testimonial.client_name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {testimonial.client_title ? `${testimonial.client_title}, ` : ''}
                  {testimonial.client_company || ''}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xs truncate pr-4">
              <p className="text-xs text-slate-455 italic">&ldquo;{testimonial.content}&rdquo;</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < (testimonial.rating ?? 5) ? 'fill-amber-400' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Verified status */}
            <div>
              <button
                type="button"
                onClick={() => handleToggleVerify(testimonial.id, testimonial.verified ?? false)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  testimonial.verified
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                }`}
                title="Click to toggle verification status"
              >
                {testimonial.verified ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Approved
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Pending
                  </>
                )}
              </button>
            </div>

            {/* Featured status */}
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${testimonial.featured ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'}`}>
                {testimonial.featured ? 'Featured' : 'Standard'}
              </span>
            </div>

            {/* Order */}
            <span className="text-slate-400 text-xs">{testimonial.display_order}</span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/admin/testimonials/${testimonial.id}/edit`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Edit">
                <Pencil className="w-4 h-4" />
              </Link>
              {isHigh && (
                <Link href={`/admin/testimonials/${testimonial.id}/delete`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      />
    </div>
  )
}
