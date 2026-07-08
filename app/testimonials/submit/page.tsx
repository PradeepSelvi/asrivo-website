'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Send, CheckCircle, ArrowLeft } from 'lucide-react'

export default function SubmitTestimonialPage() {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const data = {
      client_name: `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim(),
      client_title: formData.get('client_title')?.toString() || null,
      client_company: formData.get('client_company')?.toString() || null,
      content: formData.get('content')?.toString(),
      rating,
    }

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Failed to submit review')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Share Your Experience
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Leave a Review
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Worked with us? We'd love to hear about your experience. Your feedback helps us grow and helps others make informed decisions.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {submitted ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground">Thank You!</h2>
              <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                Your review has been submitted and is pending approval. We appreciate you taking the time to share your experience.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Review
                </Button>
                <Button asChild>
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-1">Your Review</h2>
              <p className="text-sm text-muted-foreground mb-8">
                All fields marked with * are required. Reviews are moderated before publishing.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" placeholder="Smith" required />
                  </div>
                </div>

                {/* Role & Company */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client_title">Job Title / Role</Label>
                    <Input id="client_title" name="client_title" placeholder="CEO, Product Manager..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_company">Company</Label>
                    <Input id="client_company" name="client_company" placeholder="Your company name" />
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hovered || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-muted-foreground">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || rating]}
                    </span>
                  </div>
                </div>

                {/* Review content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Your Review *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Share your experience working with us — what went well, what you appreciated, and how our work impacted your business..."
                    rows={6}
                    required
                    minLength={20}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 20 characters</p>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Review
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to Start a Project Together?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Let's build something great. Schedule a free consultation with our team.
          </p>
          <Button
            size="lg"
            className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            asChild
          >
            <Link href="/schedule">Schedule a Call</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
