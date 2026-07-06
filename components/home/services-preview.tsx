"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Code2, 
  Globe, 
  Smartphone, 
  Cloud, 
  Bot, 
  Users,
  ArrowRight 
} from "lucide-react"
import { useScrollAnimation, useTilt } from "@/hooks/use-scroll-animation"

const services = [
  {
    icon: Code2,
    title: "Software Development",
    description: "Custom software solutions tailored to your business needs with cutting-edge technologies.",
    href: "/services#software",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: Globe,
    title: "Web Applications",
    description: "Modern, responsive web applications that deliver exceptional user experiences.",
    href: "/services#web",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    description: "Native and cross-platform mobile apps for iOS and Android platforms.",
    href: "/services#mobile",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description: "Scalable cloud infrastructure and automated deployment pipelines.",
    href: "/services#cloud",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Bot,
    title: "Web-Hosting",
    description: "Intelligent automation solutions powered by machine learning and AI.",
    href: "/services#ai",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: Users,
    title: "IT Consulting",
    description: "Strategic technology consulting to drive digital transformation.",
    href: "/services#consulting",
    gradient: "from-rose-500/20 to-red-500/20",
  },
]

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref: tiltRef, transform } = useTilt(5)
  const { ref: scrollRef, isVisible } = useScrollAnimation(0.1)

  return (
    <div 
      ref={scrollRef}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link href={service.href}>
        <div
          ref={tiltRef}
          className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-2xl hover:border-primary/30 h-full overflow-hidden"
          style={{ transform, transition: 'transform 0.1s ease-out' }}
        >
          {/* Gradient background on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* Glow effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10" />
          
          <div className="relative z-10">
            {/* Icon with animation */}
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-3">
              <service.icon className="h-8 w-8 text-primary transition-all duration-300 group-hover:text-primary-foreground group-hover:scale-110" />
            </div>
            
            <h3 className="mt-6 text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {service.title}
            </h3>
            
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {service.description}
            </p>
            
            {/* Arrow indicator */}
            <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Learn more
              <ArrowRight className="ml-2 h-4 w-4 group-hover:animate-bounce-subtle" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function ServicesPreview() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px] animate-float-reverse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div 
          ref={titleRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider px-4 py-1.5 bg-primary/5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Our Services
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
            Comprehensive Technology{" "}
            <span className="gradient-text">Solutions</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            From concept to deployment, we offer end-to-end services to bring your digital vision to life.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>

        <div className={`mt-16 text-center transition-all duration-700 delay-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button size="lg" className="h-14 px-10 group" asChild>
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
