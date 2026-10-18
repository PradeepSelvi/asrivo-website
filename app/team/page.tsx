import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Linkedin, Github, Mail, MessageCircle } from "lucide-react"
import { getTeamMembers } from "@/lib/supabase/actions"
import { getTeamContent } from "@/lib/supabase/content-helpers"
import { MobileBackButton } from "@/components/mobile-back-button"
import { TeamCard } from "@/components/team-card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getTeamContent()
  return {
    title: content.meta_title || "Our Team - Asrivo Tech",
    description:
      content.meta_description ||
      content.hero_subtitle ||
      "Meet the talented professionals behind Asrivo Tech.",
    keywords: content.meta_keywords,
  }
}

export default async function TeamPage() {
  const teamResult = await getTeamMembers()
  let content
  try {
    content = await getTeamContent()
  } catch (error) {
    console.error("Error loading team page content:", error)
    content = await getTeamContent()
  }
  const teamMembers = teamResult.success ? teamResult.data || [] : []

  const activeMembers = teamMembers.filter((member) => member.active)
  const managementTeam = activeMembers.filter((member) => member.team_type === "management")
  const developmentTeam = activeMembers.filter((member) => member.team_type !== "management")

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
              {content.team_badge || "Our Team"}
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

      {/* Management Team Section */}
      {managementTeam.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {content.management_badge || "Leadership"}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {content.management_title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {content.management_description}
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {managementTeam.map((member) => (
                <TeamCard
                  key={member.id}
                  name={member.name}
                  role={member.position}
                  bio={member.bio}
                  image={member.image_url}
                  linkedin={member.social_links?.linkedin || member.social_links?.Linkedin}
                  github={member.social_links?.github}
                  email={member.email}
                  variant="management"
                  featured={member.featured}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Development Team Section */}
      {developmentTeam.length > 0 && (
        <section className={`py-20 lg:py-28 ${managementTeam.length > 0 ? "bg-muted/30" : ""}`}>
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {content.development_badge || "Engineers"}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {content.development_title}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {content.development_description}
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {developmentTeam.map((member) => (
                <TeamCard
                  key={member.id}
                  name={member.name}
                  role={member.position}
                  bio={member.bio}
                  image={member.image_url}
                  linkedin={member.social_links?.linkedin || member.social_links?.Linkedin}
                  github={member.social_links?.github}
                  email={member.email}
                  variant="team"
                  featured={member.featured}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {activeMembers.length === 0 && (
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {content.empty_state_title || "Team Coming Soon"}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {content.empty_state_description ||
                  "We're building our team. Check back soon to meet our talented professionals!"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Company Contact Card */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-background p-8 lg:p-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {content.company_contact_title || "Connect With Us"}
                </h2>
                <p className="mt-4 text-muted-foreground">
                  {content.company_contact_description || "Have a project in mind? We'd love to hear from you."}
                </p>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{content.company_contact_email_label || "Email"}</p>
                    <a href={`mailto:${content.company_contact_email || "info@asrivotech.com"}`} className="font-medium text-foreground hover:text-primary">
                      {content.company_contact_email || "info@asrivotech.com"}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Linkedin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{content.company_contact_linkedin_label || "LinkedIn"}</p>
                    <a href={content.company_contact_linkedin || "https://linkedin.com/company/asrivotech"} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary">
                      Asrivo Tech
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Github className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{content.company_contact_github_label || "GitHub"}</p>
                    <a href={content.company_contact_github || "https://github.com/asrivotech"} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary">
                      @asrivotech
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{content.company_contact_whatsapp_label || "WhatsApp"}</p>
                    <a href={content.company_contact_whatsapp || "https://wa.me/919976422558"} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary">
                      +91 99764 22558
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    {content.company_contact_button || "Get in Touch"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              {content.join_cta_title || "Want to Join Our Team?"}
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              {content.join_cta_description ||
                "We're always looking for talented individuals who are passionate about technology and innovation."}
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/careers">
                  {content.join_cta_button || "View Open Positions"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
