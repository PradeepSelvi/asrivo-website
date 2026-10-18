import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { AboutPreview } from "@/components/home/about-preview"
import { ServicesPreview } from "@/components/home/services-preview"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { FeaturedProjects } from "@/components/home/featured-projects"
import { TeamPreview } from "@/components/home/team-preview"
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"
import { getHomeContent } from "@/lib/supabase/content-helpers"
import { getTeamMembers } from "@/lib/supabase/actions"
import { getApprovedTestimonials } from "@/lib/supabase/content-actions"

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomeContent()
  
  return {
    title: content.meta_title || 'Asrivo Tech - Building Tomorrow\'s Digital Solutions',
    description: content.meta_description || content.hero_subtitle || 'We transform ideas into powerful digital experiences through innovative software solutions.',
    keywords: content.meta_keywords,
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  try {
    const [homeContent, teamResult, testimonialsResult] = await Promise.all([
      getHomeContent(),
      getTeamMembers(),
      getApprovedTestimonials(),
    ])

    const teamMembers = teamResult.success ? teamResult.data || [] : []
    const testimonials = testimonialsResult.success ? testimonialsResult.data || [] : []

    return (
      <div className="flex flex-col">
        <HeroSection content={homeContent} />
        <AboutPreview content={homeContent} />
        <ServicesPreview content={homeContent} />
        <WhyChooseUs content={homeContent} />
        <FeaturedProjects content={homeContent} />
        <TeamPreview members={teamMembers} content={homeContent} />
        <Testimonials content={homeContent} testimonials={testimonials} />
        <CTASection content={homeContent} />
      </div>
    )
  } catch (error) {
    console.error('Error loading home page content:', error)
    // Render with defaults if content fetch fails - getHomeContent returns defaults on error
    const homeContent = await getHomeContent()

    return (
      <div className="flex flex-col">
        <HeroSection content={homeContent} />
        <AboutPreview content={homeContent} />
        <ServicesPreview content={homeContent} />
        <WhyChooseUs content={homeContent} />
        <FeaturedProjects content={homeContent} />
        <TeamPreview members={[]} content={homeContent} />
        <Testimonials content={homeContent} testimonials={[]} />
        <CTASection content={homeContent} />
      </div>
    )
  }
}

