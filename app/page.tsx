import { HeroSection } from "@/components/home/hero-section"
import { AboutPreview } from "@/components/home/about-preview"
import { ServicesPreview } from "@/components/home/services-preview"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { FeaturedProjects } from "@/components/home/featured-projects"
import { TeamPreview } from "@/components/home/team-preview"
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"
import { getHomepageSettings } from "@/lib/utils/get-site-settings"
import { getTeamMembers } from "@/lib/supabase/actions"

export default async function HomePage() {
  const homepageSettings = await getHomepageSettings()
  const teamResult = await getTeamMembers()
  const teamMembers = teamResult.success ? teamResult.data || [] : []

  return (
    <div className="flex flex-col">
      <HeroSection settings={homepageSettings} />
      <AboutPreview settings={homepageSettings} />
      <ServicesPreview />
      <WhyChooseUs />
      <FeaturedProjects settings={homepageSettings} />
      <TeamPreview members={teamMembers} />
      <Testimonials />
      <CTASection settings={homepageSettings} />
    </div>
  )
}

