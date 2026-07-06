import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TeamCard } from "@/components/team-card"
import { ArrowRight, Linkedin, Github, Mail, MessageCircle } from "lucide-react"
import { getTeamMembers } from "@/lib/supabase/actions"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Our Team - Asrivo Tech",
  description: "Meet the talented professionals behind Asrivo Tech. Our leadership and engineering team is dedicated to delivering exceptional technology solutions.",
}

export default async function TeamPage() {
  const teamResult = await getTeamMembers()
  const teamMembers = teamResult.success ? teamResult.data || [] : []

  // Separate management and engineering team members
  // managementOverrideIds: member IDs that should always appear in Leadership & Management
  // regardless of their position title (e.g. technical leads who are part of leadership)
  const managementOverrideIds = [4] // Hariharan T G

  const managementTeam = teamMembers.filter(member =>
    managementOverrideIds.includes(member.id) ||
    member.position?.toLowerCase().includes('management') || 
    member.position?.toLowerCase().includes('manager') ||
    member.position?.toLowerCase().includes('head') ||
    member.position?.toLowerCase().includes('officer') ||
    member.position?.toLowerCase().includes('ceo') ||
    member.position?.toLowerCase().includes('cto') ||
    member.position?.toLowerCase().includes('coo') ||
    member.position?.toLowerCase().includes('hr') ||
    member.position?.toLowerCase().includes('founder') ||
    member.position?.toLowerCase().includes('director')
  )

  const engineeringTeam = teamMembers.filter(member => 
    !managementTeam.includes(member)
  )
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
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Leadership
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Leadership & Management Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Experienced leaders guiding our vision and strategy for success.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3">
            {managementTeam.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                role={member.position}
                image={member.image_url}
                bio={member.bio}
                linkedin={member.social_links?.linkedin || member.social_links?.Linkedin}
                github={member.social_links?.github}
                email={member.email}
                variant="management"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Team Section - only render if there are engineering members */}
      {engineeringTeam.length > 0 && (
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Engineering
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Core Engineering Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Talented engineers building innovative solutions with cutting-edge technologies.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {engineeringTeam.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                role={member.position}
                image={member.image_url}
                bio={member.bio}
                linkedin={member.social_links?.linkedin || member.social_links?.Linkedin}
                github={member.social_links?.github}
                email={member.email}
                variant="team"
              />
            ))}
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
                      href="https://wa.me/1234567890" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-primary"
                    >
                      81252575337
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

          </div>
        </div>
      </section>
    </div>
  )
}
