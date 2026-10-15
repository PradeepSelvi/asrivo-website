import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TeamCard } from "@/components/team-card"
import { ArrowRight, Linkedin, Github, Mail, MessageCircle } from "lucide-react"
import { getTeamMembers } from "@/lib/supabase/actions"
import { MobileBackButton } from "@/components/mobile-back-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Our Team - Asrivo Tech",
  description: "Meet the talented professionals behind Asrivo Tech. Our leadership and engineering team is dedicated to delivering exceptional technology solutions.",
}

export default async function TeamPage() {
  const teamResult = await getTeamMembers()
  const teamMembers = teamResult.success ? teamResult.data || [] : []

  // Filter active members only
  const activeMembers = teamMembers.filter(member => member.active)

  // Separate management and engineering/development team members
  const managementKeywords = [
    'management', 'manager', 'head', 'officer', 'ceo', 'cto', 'coo', 
    'cfo', 'hr', 'founder', 'director', 'president', 'vp', 'chief',
    'legal', 'marketing', 'operations', 'project manager'
  ]

  const managementTeam = activeMembers.filter(member =>
    managementKeywords.some(keyword => 
      member.position?.toLowerCase().includes(keyword)
    )
  )

  const developmentTeam = activeMembers.filter(member =>
    !managementTeam.includes(member)
  )

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
              Our Team
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Meet the Experts Behind Asrivo Tech
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Our talented team of professionals combines deep technical expertise with a passion
              for innovation to deliver exceptional solutions for our clients.
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
                Leadership
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Management Team
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Experienced leaders guiding our vision and strategy for success.
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
        <section className={`py-20 lg:py-28 ${managementTeam.length > 0 ? 'bg-muted/30' : ''}`}>
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Development
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Our Technical Team
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Meet the skilled developers building the next generation of digital solutions.
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
                Team Coming Soon
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We're building our team. Check back soon to meet our talented professionals!
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
                  Get in Touch with Asrivo Tech
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Have a project in mind? We&apos;d love to hear from you.
                </p>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href="mailto:info@asrivotech.com" className="font-medium text-foreground hover:text-primary">
                      info@asrivotech.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Linkedin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                    <a
                      href="https://linkedin.com/company/asrivotech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary"
                    >
                      Asrivo Tech
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Github className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GitHub</p>
                    <a
                      href="https://github.com/asrivotech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary"
                    >
                      @asrivotech
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <a
                      href="https://wa.me/918125257537"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary"
                    >
                      +91 81252 57537
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    Contact Us
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
              Want to Join Our Team?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              We&apos;re always looking for talented individuals who are passionate about technology
              and innovation. Check out our open positions.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/careers">
                  View Open Positions
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
