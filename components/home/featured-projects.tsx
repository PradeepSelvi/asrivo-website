import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

// Gradient presets based on category
const categoryGradients: Record<string, string> = {
  'web-development': 'from-blue-500/30 via-indigo-500/20 to-purple-500/30',
  'mobile-app': 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
  'ecommerce': 'from-orange-500/30 via-amber-500/20 to-yellow-500/30',
  'iot': 'from-rose-500/30 via-pink-500/20 to-fuchsia-500/30',
  'ai-ml': 'from-violet-500/30 via-purple-500/20 to-pink-500/30',
  'default': 'from-slate-500/30 via-gray-500/20 to-zinc-500/30'
}

type Project = {
  id: number
  title: string
  slug: string
  description: string
  category: string
  technologies: string[]
  image_url?: string
  featured_image_url?: string
  status?: string
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const gradient = categoryGradients[project.category] || categoryGradients.default
  const imageUrl = project.featured_image_url || project.image_url

  return (
    <div
      className="transition-all duration-700 opacity-100 translate-y-0"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-2xl hover:border-primary/30">
          {/* Animated gradient background */}
          <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${gradient}`}>
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={project.title} 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <>
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
              </>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          
          <div className="p-6 relative">
            {/* Tags with stagger animation */}
            <div className="flex flex-wrap gap-2">
              {project.technologies?.slice(0, 4).map((tag, tagIndex) => (
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
            
            <p className="mt-2 text-muted-foreground leading-relaxed line-clamp-2">
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

export async function FeaturedProjects() {
  const supabase = await createClient()
  
  // Fetch featured projects from database (limit to 4)
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(4)

  // If no featured projects or error, fetch first 4 projects
  let displayProjects = projects || []
  if (!projects || projects.length === 0 || error) {
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(4)
    displayProjects = allProjects || []
  }

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[80px] animate-float-reverse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end transition-all duration-700 opacity-100 translate-y-0">
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

        {displayProjects.length === 0 ? (
          <div className="mt-12 text-center py-12 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No projects available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {displayProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
