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
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden lg:grid bg-background/60 border-b border-border grid-cols-[1.5fr_2fr_1fr_100px_100px_60px_80px] px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
          <>
            {/* Desktop View */}
            <div className="hidden lg:grid grid-cols-[1.5fr_2fr_1fr_100px_100px_60px_80px] items-center px-6 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors">
              {/* Client info */}
              <div className="flex items-center gap-3 min-w-0">
                {testimonial.client_image_url ? (
                  <img src={testimonial.client_image_url} alt={testimonial.client_name} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate text-sm">{testimonial.client_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
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
                      : 'bg-red-500/10 text-destructive border-red-500/20 hover:bg-red-500/20'
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${testimonial.featured ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  {testimonial.featured ? 'Featured' : 'Standard'}
                </span>
              </div>

              {/* Order */}
              <span className="text-muted-foreground text-xs">{testimonial.display_order}</span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link href={`/admin/testimonials/${testimonial.id}/edit`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
                  <Pencil className="w-4 h-4" />
                </Link>
                {isHigh && (
                  <Link href={`/admin/testimonials/${testimonial.id}/delete`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-500/10 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 border-b border-border/50 hover:bg-muted/20 transition-colors space-y-3">
              <div className="flex items-center gap-3">
                {testimonial.client_image_url ? (
                  <img src={testimonial.client_image_url} alt={testimonial.client_name} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{testimonial.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.client_title ? `${testimonial.client_title}, ` : ''}
                    {testimonial.client_company || ''}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-455 italic line-clamp-3">
                &ldquo;{testimonial.content}&rdquo;
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (testimonial.rating ?? 5) ? 'fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVerify(testimonial.id, testimonial.verified ?? false)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                    testimonial.verified
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-destructive border-red-500/20'
                  }`}
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${testimonial.featured ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  {testimonial.featured ? 'Featured' : 'Standard'}
                </span>
                <span className="text-xs text-muted-foreground">#{testimonial.display_order}</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href={`/admin/testimonials/${testimonial.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
                {isHigh && (
                  <Link href={`/admin/testimonials/${testimonial.id}/delete`}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-destructive hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      />
    </div>
  )
}
