import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InquiryStatusChecker } from "@/components/inquiry-status-checker"
import { MobileBackButton } from "@/components/mobile-back-button"
import { ServicesDisplay } from "@/components/services/services-content"
import { getServicesContent } from "@/lib/supabase/content-helpers"
import { 
  ArrowRight,
  Search,
  Paintbrush,
  Cog,
  TestTube,
  Rocket,
  HeartHandshake,
} from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getServicesContent()
  
  return {
    title: content.meta_title || "Services - Asrivo Tech",
    description: content.meta_description || content.hero_subtitle || "Explore our comprehensive technology services including software development, web & mobile apps, cloud solutions, AI & automation, and IT consulting.",
    keywords: content.meta_keywords,
  }
}

const process = [
  {
    icon: Search,
    title: "Requirement Analysis",
    description: "We begin by understanding your business goals, challenges, and requirements through detailed discovery sessions.",
  },
  {
    icon: Paintbrush,
    title: "Design",
    description: "Our designers create intuitive interfaces and user experiences that align with your brand and user needs.",
  },
  {
    icon: Cog,
    title: "Development",
    description: "Our engineers build your solution using modern technologies and best practices for quality and scalability.",
  },
  {
    icon: TestTube,
    title: "Testing",
    description: "Rigorous testing ensures your product is bug-free, secure, and performs optimally under all conditions.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "We handle the deployment process, ensuring a smooth launch with minimal disruption to your operations.",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description: "Our relationship doesn't end at launch. We provide ongoing support and maintenance to ensure continued success.",
  },
]

export default async function ServicesPage() {
  let content
  try {
    content = await getServicesContent()
  } catch (error) {
    console.error('Error loading services page content:', error)
    content = await getServicesContent() // Helper returns defaults on error
  }

  return (
    <div className="flex flex-col">
      <MobileBackButton />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {content.services_page_badge}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              {content.hero_title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {content.hero_subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid - Now using CMS content */}
      <ServicesDisplay content={content} />

      {/* Process Section */}
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {content.process_badge}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {content.process_title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {content.process_subtitle}
            </p>
          </div>

          {(() => {
            const steps = [
              {
                icon: Search,
                title: content.process_step_1_title || "Requirement Analysis",
                description: content.process_step_1_desc || "We begin by understanding your business goals, challenges, and requirements through detailed discovery sessions.",
              },
              {
                icon: Paintbrush,
                title: content.process_step_2_title || "Design",
                description: content.process_step_2_desc || "Our designers create intuitive interfaces and user experiences that align with your brand and user needs.",
              },
              {
                icon: Cog,
                title: content.process_step_3_title || "Development",
                description: content.process_step_3_desc || "Our engineers build your solution using modern technologies and best practices for quality and scalability.",
              },
              {
                icon: TestTube,
                title: content.process_step_4_title || "Testing",
                description: content.process_step_4_desc || "Rigorous testing ensures your product is bug-free, secure, and performs optimally under all conditions.",
              },
              {
                icon: Rocket,
                title: content.process_step_5_title || "Deployment",
                description: content.process_step_5_desc || "We handle the deployment process, ensuring a smooth launch with minimal disruption to your operations.",
              },
              {
                icon: HeartHandshake,
                title: content.process_step_6_title || "Support",
                description: content.process_step_6_desc || "Our relationship doesn't end at launch. We provide ongoing support and maintenance to ensure continued success.",
              },
            ]
            return (
              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="relative rounded-xl border border-border bg-background p-8 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-2">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Check Status Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Track Your Request
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {content.status_title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {content.status_description}
            </p>
          </div>

          <InquiryStatusChecker />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              {content.cta_title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
              {content.cta_description}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                asChild
              >
                <Link href="/contact">
                  {content.cta_button}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" 
                asChild
              >
                <Link href="/projects">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
