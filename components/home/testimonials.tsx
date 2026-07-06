"use client"

import { Quote, Star } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const testimonials = [
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
]

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.2)

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-border bg-card p-8 transition-all duration-700 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />
      
      <div className="relative z-10">
        {/* Quote icon with animation */}
        <div className="relative">
          <Quote className="h-12 w-12 text-primary/20 transition-all duration-500 group-hover:text-primary/40 group-hover:scale-110" />
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Rating stars */}
        <div className="mt-4 flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform duration-300"
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        
        <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
          &ldquo;{testimonial.content}&rdquo;
        </p>
        
        <div className="mt-8 flex items-center gap-4">
          {/* Avatar with animated ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm scale-110" />
            <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-2 ring-border group-hover:ring-primary/50 transition-all duration-500">
              <span className="text-sm font-bold text-primary">
                {testimonial.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {testimonial.author}
            </p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

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
            Testimonials
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            What Our <span className="gradient-text">Clients</span> Say
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Hear from the businesses we have helped transform through technology.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
