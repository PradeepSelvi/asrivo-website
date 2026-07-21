import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { MobileBackButton } from "@/components/mobile-back-button"

export const metadata: Metadata = {
  title: "Book a Consultation - Asrivo Tech",
  description: "Schedule a free consultation with our expert team. Let's discuss your project and explore how we can help you achieve your goals.",
}

export default function BookConsultPage() {
  return (
    <div className="flex flex-col">
      <MobileBackButton />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Let&apos;s Talk
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Book a Consultation
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Schedule a free consultation with our expert team. We&apos;ll discuss your project requirements, 
              technical challenges, and explore how we can help bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 lg:py-28 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              What to Expect
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our consultation process is designed to understand your needs and provide actionable insights.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">1. Discovery Call</h3>
              <p className="text-muted-foreground">
                We&apos;ll start with a friendly conversation to understand your business goals, 
                technical requirements, and project timeline.
              </p>
            </div>

            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">2. Solution Design</h3>
              <p className="text-muted-foreground">
                Our experts will propose tailored solutions, technology stack recommendations, 
                and architecture designs suited to your needs.
              </p>
            </div>

            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">3. Project Roadmap</h3>
              <p className="text-muted-foreground">
                We&apos;ll create a detailed roadmap with milestones, timelines, and cost estimates 
                to bring your project to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Details */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
                Free 30-Minute Consultation
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">No Commitment Required</h4>
                    <p className="text-muted-foreground">
                      Our consultation is completely free with no strings attached. 
                      Get expert advice even if you decide not to work with us.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Expert Guidance</h4>
                    <p className="text-muted-foreground">
                      Meet with our senior engineers and technical leads who have years of 
                      experience building successful products.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Flexible Scheduling</h4>
                    <p className="text-muted-foreground">
                      Choose a time that works best for you. We offer consultations across 
                      different time zones to accommodate your schedule.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Actionable Insights</h4>
                    <p className="text-muted-foreground">
                      Walk away with clear next steps, technology recommendations, 
                      and a better understanding of your project scope.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <Clock className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-2xl font-bold text-foreground">Schedule Your Consultation</h3>
                <p className="mt-2 text-muted-foreground">
                  Choose how you&apos;d like to get in touch with us.
                </p>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/book-consult/schedule">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Consultation Now
                  </Link>
                </Button>

                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/services/inquiry">
                    <Users className="mr-2 h-5 w-5" />
                    Fill Service Inquiry Form
                  </Link>
                </Button>

                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Already submitted?{" "}
                    <Link href="/book-consult/check-status" className="text-primary hover:underline font-medium">
                      Check status
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Prefer email? Reach us at{" "}
                    <a href="mailto:info@asrivotech.com" className="text-primary hover:underline">
                      info@asrivotech.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Work With Asrivo Tech?
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "10+ Projects Built",
                description: "Proven track record of delivering successful digital products across industries.",
              },
              {
                title: "Expert Team",
                description: "Skilled developers, designers, and technical leads with years of experience.",
              },
              {
                title: "Client-Centric",
                description: "We prioritize your vision and work collaboratively to achieve your goals.",
              },
              {
                title: "Modern Stack",
                description: "We use cutting-edge technologies to build fast, secure, and scalable solutions.",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{feature.title.split(' ')[0]}</div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
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
              Ready to Start Your Project?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Let&apos;s turn your ideas into reality. Book your free consultation today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                asChild
              >
                <Link href="/services/inquiry">
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" 
                asChild
              >
                <Link href="/team">View Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
