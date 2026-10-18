"use client"

import React from "react"
import { Quote, Star } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import type { HomeContent } from "@/lib/supabase/content-helpers"

export interface TestimonialItem {
  id?: string | number
  content: string
  author: string
  role: string
  company?: string
  rating: number
  avatar?: string | null
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    content: "Asrivo Tech transformed our outdated systems into a modern, efficient platform. Their team's expertise and dedication exceeded our expectations.",
    author: "Jennifer Walsh",
    role: "CTO, TechCorp Industries",
    company: "TechCorp Industries",
    rating: 5,
  },
  {
    content: "The mobile app they developed for us has significantly improved our customer engagement. Professional team with excellent communication.",
    author: "Robert Martinez",
    role: "CEO, HealthFirst",
    company: "HealthFirst",
    rating: 5,
  },
  {
    content: "Working with Asrivo Tech was a game-changer. They delivered our e-commerce platform on time and the results speak for themselves.",
    author: "Amanda Foster",
    role: "Founder, ShopEase",
    company: "ShopEase",
    rating: 5,
  },
  {
    content: "Outstanding service and delivery! The AI-powered analytics dashboard they built has revolutionized how we make business decisions. Highly recommended.",
    author: "Michael Chen",
    role: "VP of Technology, DataDrive Inc",
    company: "DataDrive Inc",
    rating: 5,
  },
  {
    content: "From concept to deployment, Asrivo Tech demonstrated exceptional technical expertise. Our IoT platform now handles millions of requests seamlessly.",
    author: "Sarah Johnson",
    role: "Director of Engineering, SmartHome Solutions",
    company: "SmartHome Solutions",
    rating: 5,
  },
  {
    content: "The team's attention to detail and commitment to quality is unmatched. They delivered a scalable cloud infrastructure that supports our rapid growth.",
    author: "David Kumar",
    role: "CTO, CloudNine Technologies",
    company: "CloudNine Technologies",
    rating: 5,
  },
  {
    content: "Asrivo Tech's blockchain solution provided the security and transparency we needed for our financial platform. Exceptional work from start to finish.",
    author: "Emily Rodriguez",
    role: "CEO, FinSecure",
    company: "FinSecure",
    rating: 5,
  },
  {
    content: "Their DevOps transformation saved us countless hours and significantly reduced our deployment time. The ROI was evident within the first month.",
    author: "James Anderson",
    role: "Head of Infrastructure, TechFlow Systems",
    company: "TechFlow Systems",
    rating: 5,
  },
  {
    content: "The custom CRM they developed has streamlined our entire sales process. Intuitive design coupled with powerful features. Couldn't be happier!",
    author: "Lisa Thompson",
    role: "Sales Director, GrowthHub",
    company: "GrowthHub",
    rating: 5,
  },
  {
    content: "Asrivo Tech delivered beyond expectations. Their microservices architecture improved our application performance by 300%. True professionals!",
    author: "Mark Williams",
    role: "Chief Architect, ScaleUp Solutions",
    company: "ScaleUp Solutions",
    rating: 5,
  },
]

function TestimonialCardItem({
  testimonial,
  fullWidth = false,
}: {
  testimonial: TestimonialItem
  fullWidth?: boolean
}) {
  const initials = (testimonial.author || 'Client')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={fullWidth ? "w-full" : "flex-shrink-0 w-[320px] sm:w-[400px] flex flex-col"}>
      <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-700 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />

        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div>
            {/* Quote icon with animation */}
            <div className="relative">
              <Quote className="h-12 w-12 text-primary/20 transition-all duration-500 group-hover:text-primary/40 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Rating stars */}
            <div className="mt-4 flex gap-1">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform duration-300"
                  style={{ transitionDelay: `${i * 50}ms` }}
                />
              ))}
            </div>

            <p className="mt-4 text-muted-foreground leading-relaxed text-base line-clamp-4">
              &ldquo;{testimonial.content}&rdquo;
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            {/* Avatar with animated ring */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm scale-110" />
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="relative h-14 w-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-all duration-500"
                />
              ) : (
                <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-2 ring-border group-hover:ring-primary/50 transition-all duration-500">
                  <span className="text-sm font-bold text-primary">
                    {initials || 'CL'}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                {testimonial.author}
              </p>
              <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Testimonials({
  content,
  testimonials = [],
}: {
  content?: HomeContent
  testimonials?: any[]
}) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  const badge = content?.testimonials_badge ?? 'Testimonials'
  const title = content?.testimonials_title ?? 'What Our Clients Say'
  const subtitle =
    content?.testimonials_subtitle ??
    "Hear from the businesses we have helped transform through technology."

  // Normalize testimonials from database
  const normalizedDbTestimonials: TestimonialItem[] = (testimonials || []).map((t: any) => ({
    id: t.id,
    content: t.content,
    author: t.client_name || t.author || 'Valued Client',
    role:
      [t.client_title, t.client_company].filter(Boolean).join(', ') ||
      t.role ||
      'Client',
    company: t.client_company || t.company || '',
    rating: Number(t.rating) || 5,
    avatar: t.client_image_url || t.avatar || null,
  }))

  const hasDbTestimonials = normalizedDbTestimonials.length > 0

  // Combine DB testimonials with defaults so approved DB reviews appear first,
  // while ensuring a rich, full showcase.
  const combinedTestimonials: TestimonialItem[] = hasDbTestimonials
    ? [
        ...normalizedDbTestimonials,
        ...DEFAULT_TESTIMONIALS.filter(
          (d) => !normalizedDbTestimonials.some((db) => db.author.toLowerCase() === d.author.toLowerCase())
        ),
      ]
    : DEFAULT_TESTIMONIALS

  // Ensure there are at least 8 items in the sequence so the marquee smoothly spans any screen size
  let marqueeItems = combinedTestimonials
  while (marqueeItems.length < 8) {
    marqueeItems = [...marqueeItems, ...combinedTestimonials]
  }

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[80px] animate-float-reverse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div
          ref={titleRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider px-4 py-1.5 bg-primary/5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {badge}
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            What Our <span className="gradient-text">Clients</span> Say
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">{subtitle}</p>
        </div>

        {/* Infinite Auto-Scrolling Carousel with zero seam gap */}
        <div className="mt-16 relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden w-full">
            <div
              className="flex w-max animate-scroll-testimonials hover:[animation-play-state:paused]"
              style={{ animationDuration: `${Math.max(45, marqueeItems.length * 5)}s` }}
            >
              {/* First set of testimonials */}
              <div className="flex shrink-0 items-stretch gap-8 pr-8">
                {marqueeItems.map((testimonial, index) => (
                  <TestimonialCardItem
                    key={`set1-${index}-${testimonial.id ?? index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
              {/* Duplicate identical set for seamless 50% loop */}
              <div className="flex shrink-0 items-stretch gap-8 pr-8" aria-hidden="true">
                {marqueeItems.map((testimonial, index) => (
                  <TestimonialCardItem
                    key={`set2-${index}-${testimonial.id ?? index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
