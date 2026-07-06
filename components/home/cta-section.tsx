"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Rocket } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div 
          ref={ref}
          className={`relative overflow-hidden rounded-3xl bg-primary px-8 py-20 text-center shadow-2xl sm:px-16 lg:px-24 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-primary-foreground/10 blur-[100px] animate-blob" />
            <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-accent/20 blur-[100px] animate-blob delay-200" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-3 h-3 rounded-full bg-primary-foreground/20 animate-float" />
            <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-accent/30 animate-float-slow delay-300" />
            <div className="absolute bottom-16 left-1/4 w-4 h-4 rounded-full bg-primary-foreground/15 animate-float-reverse delay-500" />
            <div className="absolute bottom-24 right-1/3 w-2 h-2 rounded-full bg-primary-foreground/25 animate-float delay-700" />
          </div>

          {/* Orbiting rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary-foreground/10 rounded-full animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-sm font-medium mb-6">
              <Rocket className="h-4 w-4 animate-bounce-subtle" />
              Ready to Launch?
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl text-balance">
              Let&apos;s Build Your Next
              <span className="block mt-2">
                <span className="relative inline-block">
                  Product Together
                  <Sparkles className="absolute -top-4 -right-6 h-6 w-6 text-accent animate-pulse" />
                </span>
              </span>
            </h2>
            
            <p className="mx-auto mt-8 max-w-2xl text-lg text-primary-foreground/80 leading-relaxed">
              Ready to transform your ideas into reality? Our team is here to help you build 
              innovative solutions that drive your business forward.
            </p>
            
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                variant="secondary" 
                className="h-14 px-10 text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 group hover-lift" 
                asChild
              >
                <Link href="/contact">
                  Start a Project
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-10 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent hover-lift" 
                asChild
              >
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-foreground/60 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Available for new projects
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/40" />
                Response within 24 hours
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-foreground/40" />
                Free consultation
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
