import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Projects - Asrivo Tech",
  description: "Explore our portfolio of successful projects across various industries. See how we've helped businesses transform through technology.",
}

const projects = [
    
  {
    id: "fintech-dashboard",
    title: "FinTech Analytics Dashboard",
    category: "Financial Services",
    description: "A comprehensive financial analytics platform with real-time data visualization, AI-powered insights, and automated reporting for investment firms.",
    challenge: "The client needed to consolidate data from multiple sources and provide actionable insights to their analysts in real-time.",
    solution: "We built a scalable dashboard using React and Node.js with real-time data streaming, custom visualization components, and ML-powered predictions.",
    results: ["40% faster decision-making", "60% reduction in manual reporting", "99.9% uptime"],
    tags: ["React", "Node.js", "PostgreSQL", "AWS", "Machine Learning"],
    image: "/images/fintech-dashboard.png",
  },
  {
    id: "healthcare-app",
    title: "Healthcare Mobile App",
    category: "Healthcare",
    description: "A comprehensive mobile application for patient management, telemedicine consultations, and health record management with HIPAA compliance.",
    challenge: "Healthcare providers needed a secure, user-friendly platform for virtual consultations and patient data management.",
    solution: "We developed a cross-platform mobile app with end-to-end encryption, video calling integration, and seamless EHR system integration.",
    results: ["50,000+ active users", "4.8 star rating", "30% increase in patient engagement"],
    tags: ["React Native", "Firebase", "Node.js", "WebRTC", "HIPAA Compliant"],
    image: "/images/healthcare-app.png",
  },
  {
    id: "ecommerce-platform",
    title: "Multi-Vendor E-commerce Platform",
    category: "E-commerce",
    description: "A scalable multi-vendor marketplace with advanced inventory management, real-time order tracking, and integrated payment solutions.",
    challenge: "The client wanted to launch a marketplace that could handle thousands of vendors and millions of products efficiently.",
    solution: "We architected a microservices-based platform with elastic scaling, intelligent search, and automated vendor management tools.",
    results: ["$2M+ monthly transactions", "500+ vendors onboarded", "Sub-second search response"],
    tags: ["Next.js", "Stripe", "MongoDB", "Elasticsearch", "Kubernetes"],
    image: "/images/ecommerce-platform.png",
  },
  {
    id: "iot-system",
    title: "Industrial IoT Management System",
    category: "Manufacturing",
    description: "An enterprise IoT platform for monitoring and controlling industrial equipment with predictive maintenance capabilities.",
    challenge: "The manufacturing client needed real-time visibility into their equipment status and predictive insights to prevent downtime.",
    solution: "We built a robust IoT platform with custom dashboards, real-time alerting, and machine learning models for predictive maintenance.",
    results: ["35% reduction in downtime", "20% maintenance cost savings", "10,000+ sensors connected"],
    tags: ["Python", "MQTT", "TimescaleDB", "TensorFlow", "AWS IoT"],
    image: "/images/iot-system.png",
  },
  {
    id: "logistics-platform",
    title: "Logistics Optimization Platform",
    category: "Supply Chain",
    description: "An AI-powered logistics platform that optimizes delivery routes, manages fleet operations, and provides real-time tracking.",
    challenge: "The logistics company needed to reduce delivery times and costs while improving customer satisfaction with real-time visibility.",
    solution: "We developed an intelligent platform with route optimization algorithms, real-time tracking, and automated dispatch management.",
    results: ["25% reduction in fuel costs", "40% faster deliveries", "95% customer satisfaction"],
    tags: ["React", "Python", "PostgreSQL", "Google Maps API", "Machine Learning"],
    image: "/images/logistics-platform.png",
  },
  {
    
    id: "education-platform",
    title: "Online Learning Platform",
    category: "Education",
    description: "A comprehensive e-learning platform with interactive courses, live sessions, progress tracking, and certification management.",
    challenge: "The education provider needed a scalable platform to deliver courses to thousands of students globally with engaging experiences.",
    solution: "We created a feature-rich LMS with video streaming, interactive assessments, and gamification elements to boost engagement.",
    results: ["100,000+ students enrolled", "85% course completion rate", "Available in 15 countries"],
    tags: ["Next.js", "Node.js", "PostgreSQL", "AWS", "Video Streaming"],
    image: "/images/education-platform.png",
  },
]

const categories = ["All", "Financial Services", "Healthcare", "E-commerce", "Manufacturing", "Supply Chain", "Education"]

export default function ProjectsPage() {
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
          <div className="space-y-12">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="rounded-2xl border border-border bg-background overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="grid lg:grid-cols-2">
                  <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-8 relative overflow-hidden">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-8xl font-bold text-primary/10">{project.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-8 lg:p-10">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {project.category}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-foreground">{project.title}</h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed">{project.description}</p>
                    
                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Challenge</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{project.challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Solution</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{project.solution}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Results</h3>
                        <ul className="mt-1 flex flex-wrap gap-2">
                          {project.results.map((result) => (
                            <li
                              key={result}
                              className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground"
                            >
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
