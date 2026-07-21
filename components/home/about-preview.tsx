"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Award, Users, Globe, ArrowRight, CheckCircle2, Sparkles, Rocket, ShieldCheckIcon, Zap, Briefcase } from "lucide-react"

/** * INTERNALS: Custom Hooks (Injected for Single-File Portability)
 * In a production app, these would remain in @/hooks 
 */
function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  const startAnimation = () => setStarted(true)

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return { count, startAnimation }
}

/** * COMPONENT: AnimatedStat
 * Features: Glassmorphism, Hover Lifting, Progressive Count-up
 */
function AnimatedStat({ icon: Icon, value, label, description, delay }: { 
  icon: React.ElementType; 
  value: string; 
  label: string; 
  description: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.2)
  const numericValue = parseInt(value.replace(/\D/g, ''))
  const suffix = value.replace(/\d/g, '')
  const { count, startAnimation } = useCountUp(numericValue, 2000)

  useEffect(() => {
    if (isVisible) startAnimation()
  }, [isVisible])

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-700 hover:-translate-y-2 hover:border-white/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Dynamic Hover Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner transition-all duration-500 group-hover:bg-primary group-hover:scale-110">
          <Icon className="h-7 w-7 text-primary transition-colors duration-500 group-hover:text-white" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{count}{suffix}</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">{label}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground/80">{description}</p>
        </div>
      </div>
    </div>
  )
}

/** * MAIN COMPONENT: AboutPreview
 * A full-screen width section with floating background orbs and glass panels.
 */
export function AboutPreview() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  const highlights = [
  { icon: Briefcase, value: "6+", label: "Core Services", description: "Comprehensive technology solutions for modern businesses." },
  { icon: Users, value: "24/7", label: "Support Availability", description: "Continuous assistance for seamless operations." },
  { icon: Globe, value: "10+", label: "Technology Stack", description: "Modern tools and frameworks powering solutions." }, 
  { icon: ShieldCheckIcon, value: "99%", label: "System Reliability", description: "Stable infrastructure powering every service." }
  ]

  const features = [
    "Next-Gen AI Integration",
    "Cloud-Native Architecture",
    "Zero-Trust Security",
    "Reliability Service",
    "High-Velocity DevOps",
    "Post-Launch Maintenance"
  ]

  return (
    <section className="relative isolate overflow-hidden bg-slate-50 py-24 sm:py-32">
      {/* BACKGROUND ANIMATION ELEMENTS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] h-[400px] w-[400px] rounded-full bg-purple-400/20 blur-[100px] [animation-duration:8s] animate-bounce" style={{ animation: 'bounce 10s infinite' }} />
        <div className="absolute -bottom-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-[150px]" />
        
        {/* SVG Grid Overlay */}
        <svg className="absolute inset-0 h-full w-full stroke-gray-300/30 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" x="50%" y="-1">
              <path d="M.5 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-2">
          
          {/* LEFT CONTENT: Text & Glass List */}
          <div 
            ref={titleRef}
            className={`transition-all duration-1000 ${titleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-primary shadow-sm">
              <Sparkles className="h-4 w-4 fill-primary/20" />
              Elite Engineering
            </div>
            
            <h2 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Engineering the <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Next Digital Frontier
              </span>
            </h2>

            <p className="mt-8 text-lg leading-8 text-slate-600">
              Asrivo Tech isn't just a dev shop. We are a Digital Product Studio where 
              performance meets aesthetics. We take the "impossible" ideas and build them into 
              lightning-fast, secure, and beautiful realities.
            </p>

            {/* Feature Grid - Glass Cards */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/40 p-3 backdrop-blur-sm transition-transform hover:scale-105"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
              >
                View Our Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/book-consult"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-8 py-4 text-sm font-bold text-slate-900 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
              >
                Book a Consultation
              </Link>
            </div>
          </div>

          {/* RIGHT CONTENT: Stats Stack */}
          <div className="relative flex flex-col justify-center gap-6">
            {/* Background Accent for Stats */}
            <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            
            {highlights.map((item, index) => (
              <AnimatedStat
                key={item.label}
                icon={item.icon}
                value={item.value}
                label={item.label}
                description={item.description}
                delay={index * 200}
              />
            ))}

            {/* Extra Glass Teaser Box */}
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent p-1">
               <div className="flex items-center gap-4 rounded-[calc(1rem-1px)] bg-white/60 p-4 backdrop-blur-xl">
                  <div className="rounded-full bg-emerald-500/20 p-2">
                    <Zap className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    We are currently accepting new projects for Q3 2026.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}