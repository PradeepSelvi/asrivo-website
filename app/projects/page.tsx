import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Projects - Asrivo Tech",
  description: "Explore our portfolio of successful projects across various industries. See how we've helped businesses transform through technology.",
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching projects:', error)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Our Work
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Projects & Case Studies
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Explore our portfolio of successful projects across various industries. 
              See how we&apos;ve helped businesses transform through innovative technology solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: "10+", label: "Projects Bulit" },
              { value: "2+", label: "Start Up Partners" },
              { value: "10+", label: "Developer Community" },
              { value: "100%", label: "Commitment to Quality" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {!projects || projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found. Run the database migration to add sample projects.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-border bg-background overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                >
                  <div className="grid lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-8 relative overflow-hidden">
                      {project.featured_image_url || project.image_url ? (
                        <img
                          src={project.featured_image_url || project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <span className="text-8xl font-bold text-primary/10">{project.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-8 lg:p-10">
                      <div className="flex flex-wrap gap-2">
                        {project.status && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            project.status === 'ongoing' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {project.status}
                          </span>
                        )}
                        {project.category && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                            {project.category.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-foreground">{project.title}</h2>
                      <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{project.description}</p>
                      
                      {project.challenge && (
                        <div className="mt-6">
                          <h3 className="text-sm font-semibold text-foreground">Challenge</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.challenge}</p>
                        </div>
                      )}

                      {project.results && project.results.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-foreground">Results</h3>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {project.results.slice(0, 3).map((result, idx) => (
                              <li
                                key={idx}
                                className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground"
                              >
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {project.technologies.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.technologies.length > 5 && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                              +{project.technologies.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <Button asChild>
                          <Link href={`/projects/${project.slug}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        {project.live_url && (
                          <Button variant="outline" asChild>
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Ready to Build Something Great?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Let&apos;s discuss your project and see how we can help you achieve your goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                asChild
              >
                <Link href="/contact">
                  Start a Product Innovation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" 
                asChild
              >
                <Link href="/services">Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
