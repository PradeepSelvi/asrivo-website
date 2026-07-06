import { HeroSection } from "@/components/home/hero-section"
import { AboutPreview } from "@/components/home/about-preview"
import { ServicesPreview } from "@/components/home/services-preview"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { FeaturedProjects } from "@/components/home/featured-projects"
import { TeamPreview } from "@/components/home/team-preview"
import { Testimonials } from "@/components/home/testimonials"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <AboutPreview />
      <ServicesPreview />
      <WhyChooseUs />
      <FeaturedProjects />
      <TeamPreview />
      <Testimonials />
      <CTASection />
    </div>
  )
}
