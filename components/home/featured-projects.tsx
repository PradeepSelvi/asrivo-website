"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import { useScrollAnimation, useTilt } from "@/hooks/use-scroll-animation"

const projects = [
  {
    title: "FinTech Dashboard",
    description: "A comprehensive financial analytics platform with real-time data visualization and AI-powered insights.",
    tags: ["React", "Node.js", "PostgreSQL", "AWS"],
    gradient: "from-blue-500/30 via-indigo-500/20 to-purple-500/30",
    href: "/projects#fintech-dashboard",
  },
  {
    title: "Healthcare App",
    description: "Mobile application for patient management and telemedicine consultations.",
    tags: ["React Native", "Firebase", "AI/ML"],
    gradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
    href: "/projects#healthcare-app",
  },
  {
    title: "E-commerce Platform",
    description: "Scalable multi-vendor marketplace with advanced inventory management.",
    tags: ["Next.js", "Stripe", "MongoDB"],
    gradient: "from-orange-500/30 via-amber-500/20 to-yellow-500/30",
    href: "/projects#ecommerce-platform",
  },
  {
    title: "IoT Management System",
    description: "Enterprise IoT platform for monitoring and controlling industrial equipment.",
    tags: ["Python", "MQTT", "TimescaleDB"],
    gradient: "from-rose-500/30 via-pink-500/20 to-fuchsia-500/30",
    href: "/projects#iot-system",
  },
]

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const { ref: tiltRef, transform } = useTilt(5)
  const { ref: scrollRef, isVisible } = useScrollAnimation(0.1)

  return (
    <div
      ref={scrollRef}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Link href={project.href}>
        <div
          ref={tiltRef}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-2xl hover:border-primary/30"
          style={{ transform, transition: 'transform 0.1s ease-out' }}
        >
          {/* Animated gradient background */}
          <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${project.gradient}`}>
            {/* Animated mesh pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
            
            {/* Floating elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl animate-float" />
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-lg animate-float-reverse delay-300" />
            
            {/* Large letter */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[120px] font-black text-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                {project.title.charAt(0)}
              </span>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="p-6 relative">
            {/* Tags with stagger animation */}
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, tagIndex) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                  style={{ transitionDelay: `${tagIndex * 50}ms` }}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h3 className="mt-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {project.title}
            </h3>
            
            <p className="mt-2 text-muted-foreground leading-relaxed">
              {project.description}
            </p>
            
            <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              View Project
              <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function FeaturedProjects() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation()

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px] animate-float-reverse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div 
          ref={titleRef}
          className={`flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider px-4 py-1.5 bg-primary/5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Our Work
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Explore some of our recent projects that showcase our expertise and innovation.
            </p>
          </div>
          <Button variant="outline" className="bg-transparent group h-12 px-6" asChild>
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
