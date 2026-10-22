import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { MobileBackButton } from "@/components/mobile-back-button"
import { getBookConsultContent } from "@/lib/supabase/content-helpers"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getBookConsultContent()
  return {
    title: content.meta_title ?? 'Book a Consultation - Asrivo Tech',
    description: content.meta_description ?? 'Schedule a free consultation with our expert team. Let\'s discuss your project and explore how we can help you achieve your goals.',
  }
}

export default async function BookConsultPage() {
  const content = await getBookConsultContent()

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
              {content.hero_badge}
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

      {/* What to Expect */}
      <section className="py-20 lg:py-28 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              {content.expect_section_title}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {content.expect_section_subtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{content.expect_step_1_title}</h3>
              <p className="text-muted-foreground">
                {content.expect_step_1_desc}
              </p>
            </div>

            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{content.expect_step_2_title}</h3>
              <p className="text-muted-foreground">
                {content.expect_step_2_desc}
              </p>
            </div>

            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{content.expect_step_3_title}</h3>
              <p className="text-muted-foreground">
                {content.expect_step_3_desc}
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
                {content.consult_title}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{content.benefit_1_title}</h4>
                    <p className="text-muted-foreground">
                      {content.benefit_1_desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{content.benefit_2_title}</h4>
                    <p className="text-muted-foreground">
                      {content.benefit_2_desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{content.benefit_3_title}</h4>
                    <p className="text-muted-foreground">
                      {content.benefit_3_desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{content.benefit_4_title}</h4>
                    <p className="text-muted-foreground">
                      {content.benefit_4_desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <Clock className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-2xl font-bold text-foreground">{content.card_title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {content.card_subtitle}
                </p>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/schedule">
                    <Calendar className="mr-2 h-5 w-5" />
                    {content.card_btn_schedule}
                  </Link>
                </Button>

                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/services/inquiry">
                    <Users className="mr-2 h-5 w-5" />
                    {content.card_btn_inquiry}
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
                    <a href="mailto:info@asrivotech.in" className="text-primary hover:underline">
                      info@asrivotech.in
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
              {content.why_section_title}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: content.stat_1_title, description: content.stat_1_desc },
              { title: content.stat_2_title, description: content.stat_2_desc },
              { title: content.stat_3_title, description: content.stat_3_desc },
              { title: content.stat_4_title, description: content.stat_4_desc },
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
              {content.cta_title}
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              {content.cta_subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                asChild
              >
                <Link href="/services/inquiry">
                  {content.cta_btn_primary}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" 
                asChild
              >
                <Link href="/team">{content.cta_btn_secondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
