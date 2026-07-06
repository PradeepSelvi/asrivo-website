"use client"

import { Users, Shield, Zap, HeartHandshake } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const reasons = [
  {
    icon: Users,
    title: "Expert Team",
    description: "Our team consists of highly skilled developers, designers, and strategists with proven track records in delivering complex projects.",
  },
  {
    icon: Shield,
    title: "Secure & Scalable",
    description: "We build solutions with enterprise-grade security and architecture that scales with your business growth.",
  },
  {
    icon: Zap,
    title: "Agile Development",
    description: "Our agile methodology ensures faster delivery, continuous feedback, and flexibility to adapt to changing requirements.",
  },
  {
    icon: HeartHandshake,
    title: "Long-Term Support",
    description: "We provide ongoing maintenance and support to ensure your solutions continue to perform optimally.",
  },
]

function ReasonCard({ reason, index }: { reason: typeof reasons[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.2)

  return (
    <div
      ref={ref}
      className={`group rounded-2xl bg-primary-foreground/10 backdrop-blur-sm p-8 transition-all duration-700 hover:bg-primary-foreground/20 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating particles on hover */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary-foreground/30 opacity-0 group-hover:opacity-100 animate-float transition-opacity duration-500" />
      <div className="absolute bottom-8 left-6 w-1.5 h-1.5 rounded-full bg-primary-foreground/20 opacity-0 group-hover:opacity-100 animate-float-reverse transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-foreground/20 transition-all duration-500 group-hover:bg-primary-foreground/30 group-hover:scale-110 group-hover:rotate-3">
          <reason.icon className="h-8 w-8 text-primary-foreground transition-transform duration-500 group-hover:scale-110" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-primary-foreground">
          {reason.title}
        </h3>
        <p className="mt-3 text-primary-foreground/80 leading-relaxed">
          {reason.description}
        </p>
      </div>
    </div>
  )
}

export function WhyChooseUs() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  return (
    <section className="bg-primary py-24 lg:py-32 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[80px] animate-float-reverse" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div 
          ref={titleRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider px-4 py-1.5 bg-primary-foreground/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-pulse" />
            Why Choose Us
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl text-balance">
            What Sets Us{" "}
            <span className="relative">
              Apart
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary-foreground/40" />
              </svg>
            </span>
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
            We combine technical excellence with a client-first approach to deliver exceptional results.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <ReasonCard key={reason.title} reason={reason} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
