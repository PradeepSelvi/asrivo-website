'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { savePageContent } from '@/lib/supabase/page-content-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type PageSlug = 'home' | 'about' | 'services' | 'contact' | 'projects' | 'team' | 'careers'

interface ContentEditFormProps {
  slug: PageSlug
  currentContent: Record<string, string>
}

export default function ContentEditForm({ slug, currentContent }: ContentEditFormProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: currentContent,
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const onSubmit = async (data: Record<string, any>) => {
    setMessage(null)

    try {
      const result = await savePageContent(slug, data)

      if (result.success) {
        setMessage({ type: 'success', text: 'Content saved successfully!' })
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save content' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Inline message */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Render page-specific form fields */}
      {slug === 'home' && <HomeFields register={register} />}
      {slug === 'about' && <AboutFields register={register} />}
      {slug === 'services' && <ServicesFields register={register} />}
      {slug === 'contact' && <ContactFields register={register} />}
      {slug === 'projects' && <ProjectsFields register={register} />}
      {slug === 'team' && <TeamFields register={register} />}
      {slug === 'careers' && <CareersFields register={register} />}

      {/* SEO Fields (common to all pages) */}
      <div className="border-t border-border pt-8 space-y-6">
        <h3 className="text-lg font-semibold text-foreground">SEO Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="meta_title">Meta Title</Label>
          <Input
            id="meta_title"
            {...register('meta_title')}
            placeholder="Page title for search engines"
          />
          <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            {...register('meta_description')}
            placeholder="Brief description of the page content"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta_keywords">Meta Keywords</Label>
          <Input
            id="meta_keywords"
            {...register('meta_keywords')}
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-muted-foreground">Comma-separated list of relevant keywords</p>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}

// ============================================
// Page-Specific Field Components
// ============================================
// NOTE: These field components are organized by page type and rendered
// based on the slug prop. When adding new fields to a page:
// 1. Update the interface in lib/supabase/content-helpers.ts
// 2. Update the DEFAULT_*_CONTENT object in content-helpers.ts
// 3. Update the get*Content() function to include the new field
// 4. Add the SQL INSERT in create_page_content_cms.sql migration
// 5. Add the form field in the corresponding *Fields component below
// This separation keeps page-specific form fields co-located for easier maintenance.

function HomeFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Main headline" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Supporting text"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_cta_primary">Primary CTA</Label>
            <Input id="hero_cta_primary" {...register('hero_cta_primary')} placeholder="Get Started" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_cta_secondary">Secondary CTA</Label>
            <Input id="hero_cta_secondary" {...register('hero_cta_secondary')} placeholder="Learn More" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_status_badge">Status Badge</Label>
          <Input id="hero_status_badge" {...register('hero_status_badge')} placeholder="Enterprise Modular Architectures" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_stat_services_label">Stat: Services Label</Label>
            <Input id="hero_stat_services_label" {...register('hero_stat_services_label')} placeholder="Our Core Service" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_services_value">Stat: Services Value</Label>
            <Input id="hero_stat_services_value" {...register('hero_stat_services_value')} placeholder="7" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_reliability_label">Stat: Reliability Label</Label>
            <Input id="hero_stat_reliability_label" {...register('hero_stat_reliability_label')} placeholder="System Reliability" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_expertise_label">Stat: Expertise Label</Label>
            <Input id="hero_stat_expertise_label" {...register('hero_stat_expertise_label')} placeholder="Technology Expertise" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_expertise_value">Stat: Expertise Value</Label>
            <Input id="hero_stat_expertise_value" {...register('hero_stat_expertise_value')} placeholder="7+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_support_label">Stat: Support Label</Label>
            <Input id="hero_stat_support_label" {...register('hero_stat_support_label')} placeholder="Live Support" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_stat_support_value">Stat: Support Value</Label>
            <Input id="hero_stat_support_value" {...register('hero_stat_support_value')} placeholder="25/7" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_scroll_text">Scroll Text</Label>
            <Input id="hero_scroll_text" {...register('hero_scroll_text')} placeholder="Scroll Analytics" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Stats Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stats_projects">Completed Projects</Label>
            <Input id="stats_projects" {...register('stats_projects')} placeholder="2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_clients">Happy Clients</Label>
            <Input id="stats_clients" {...register('stats_clients')} placeholder="2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_team">Team Members</Label>
            <Input id="stats_team" {...register('stats_team')} placeholder="9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_experience">Years of Experience</Label>
            <Input id="stats_experience" {...register('stats_experience')} placeholder="1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_services">Services Count</Label>
            <Input id="stats_services" {...register('stats_services')} placeholder="6+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_reliability">Reliability</Label>
            <Input id="stats_reliability" {...register('stats_reliability')} placeholder="99%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_support">Support Hours</Label>
            <Input id="stats_support" {...register('stats_support')} placeholder="24/7" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">About Preview Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="about_badge">Badge</Label>
          <Input id="about_badge" {...register('about_badge')} placeholder="Elite Engineering" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_title">Title</Label>
          <Input id="about_title" {...register('about_title')} placeholder="Why Choose Us" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_description">Description</Label>
          <Textarea
            id="about_description"
            {...register('about_description')}
            placeholder="Brief description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_stats_services_label">Services Label</Label>
            <Input id="about_stats_services_label" {...register('about_stats_services_label')} placeholder="Core Services" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_services_value">Services Value</Label>
            <Input id="about_stats_services_value" {...register('about_stats_services_value')} placeholder="6+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_services_desc">Services Description</Label>
            <Input id="about_stats_services_desc" {...register('about_stats_services_desc')} placeholder="Comprehensive solutions" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_stats_support_label">Support Label</Label>
            <Input id="about_stats_support_label" {...register('about_stats_support_label')} placeholder="Support Availability" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_support_value">Support Value</Label>
            <Input id="about_stats_support_value" {...register('about_stats_support_value')} placeholder="24/7" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_support_desc">Support Description</Label>
            <Input id="about_stats_support_desc" {...register('about_stats_support_desc')} placeholder="Continuous assistance" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_stats_tech_label">Tech Label</Label>
            <Input id="about_stats_tech_label" {...register('about_stats_tech_label')} placeholder="Technology Stack" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_tech_value">Tech Value</Label>
            <Input id="about_stats_tech_value" {...register('about_stats_tech_value')} placeholder="10+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_tech_desc">Tech Description</Label>
            <Input id="about_stats_tech_desc" {...register('about_stats_tech_desc')} placeholder="Modern tools" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_stats_reliability_label">Reliability Label</Label>
            <Input id="about_stats_reliability_label" {...register('about_stats_reliability_label')} placeholder="System Reliability" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_reliability_value">Reliability Value</Label>
            <Input id="about_stats_reliability_value" {...register('about_stats_reliability_value')} placeholder="99%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_stats_reliability_desc">Reliability Description</Label>
            <Input id="about_stats_reliability_desc" {...register('about_stats_reliability_desc')} placeholder="Stable infrastructure" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_feature_1">Feature 1</Label>
            <Input id="about_feature_1" {...register('about_feature_1')} placeholder="Next-Gen AI Integration" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_feature_2">Feature 2</Label>
            <Input id="about_feature_2" {...register('about_feature_2')} placeholder="Cloud-Native Architecture" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_feature_3">Feature 3</Label>
            <Input id="about_feature_3" {...register('about_feature_3')} placeholder="Zero-Trust Security" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_feature_4">Feature 4</Label>
            <Input id="about_feature_4" {...register('about_feature_4')} placeholder="Reliability Service" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_feature_5">Feature 5</Label>
            <Input id="about_feature_5" {...register('about_feature_5')} placeholder="High-Velocity DevOps" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_feature_6">Feature 6</Label>
            <Input id="about_feature_6" {...register('about_feature_6')} placeholder="Post-Launch Maintenance" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="about_cta_primary">Primary CTA</Label>
            <Input id="about_cta_primary" {...register('about_cta_primary')} placeholder="View Our Work" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about_cta_secondary">Secondary CTA</Label>
            <Input id="about_cta_secondary" {...register('about_cta_secondary')} placeholder="Book a Consultation" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_availability_text">Availability Text</Label>
          <Input id="about_availability_text" {...register('about_availability_text')} placeholder="We are currently accepting new projects..." />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Services Preview Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="services_badge">Badge</Label>
          <Input id="services_badge" {...register('services_badge')} placeholder="Our Services" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="services_title">Title</Label>
          <Input id="services_title" {...register('services_title')} placeholder="Comprehensive Technology Solutions" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="services_subtitle">Subtitle</Label>
          <Textarea
            id="services_subtitle"
            {...register('services_subtitle')}
            placeholder="From concept to deployment..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="services_cta">CTA Button</Label>
          <Input id="services_cta" {...register('services_cta')} placeholder="View All Services" />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Why Choose Us Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="why_choose_badge">Badge</Label>
          <Input id="why_choose_badge" {...register('why_choose_badge')} placeholder="Why Choose Us" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="why_choose_title">Title</Label>
          <Input id="why_choose_title" {...register('why_choose_title')} placeholder="What Sets Us Apart" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="why_choose_subtitle">Subtitle</Label>
          <Textarea
            id="why_choose_subtitle"
            {...register('why_choose_subtitle')}
            placeholder="We combine technical excellence..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_1_title">Reason 1 Title</Label>
            <Input id="why_choose_reason_1_title" {...register('why_choose_reason_1_title')} placeholder="Expert Team" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_1_desc">Reason 1 Description</Label>
            <Textarea id="why_choose_reason_1_desc" {...register('why_choose_reason_1_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_2_title">Reason 2 Title</Label>
            <Input id="why_choose_reason_2_title" {...register('why_choose_reason_2_title')} placeholder="Secure & Scalable" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_2_desc">Reason 2 Description</Label>
            <Textarea id="why_choose_reason_2_desc" {...register('why_choose_reason_2_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_3_title">Reason 3 Title</Label>
            <Input id="why_choose_reason_3_title" {...register('why_choose_reason_3_title')} placeholder="Agile Development" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_3_desc">Reason 3 Description</Label>
            <Textarea id="why_choose_reason_3_desc" {...register('why_choose_reason_3_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_4_title">Reason 4 Title</Label>
            <Input id="why_choose_reason_4_title" {...register('why_choose_reason_4_title')} placeholder="Long-Term Support" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_reason_4_desc">Reason 4 Description</Label>
            <Textarea id="why_choose_reason_4_desc" {...register('why_choose_reason_4_desc')} rows={2} />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Featured Projects Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="featured_projects_badge">Badge</Label>
            <Input id="featured_projects_badge" {...register('featured_projects_badge')} placeholder="Our Work" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured_projects_title">Title</Label>
            <Input id="featured_projects_title" {...register('featured_projects_title')} placeholder="Featured Projects" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_projects_description">Description</Label>
          <Textarea
            id="featured_projects_description"
            {...register('featured_projects_description')}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="featured_projects_cta">CTA Button</Label>
            <Input id="featured_projects_cta" {...register('featured_projects_cta')} placeholder="View All Projects" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured_projects_empty">Empty State Message</Label>
            <Input id="featured_projects_empty" {...register('featured_projects_empty')} placeholder="No projects available yet" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Team Preview Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team_badge">Badge</Label>
            <Input id="team_badge" {...register('team_badge')} placeholder="Our Team" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_title">Title</Label>
            <Input id="team_title" {...register('team_title')} placeholder="Meet the Experts" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_subtitle">Subtitle</Label>
            <Input id="team_subtitle" {...register('team_subtitle')} placeholder="Our talented team..." />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Testimonials Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testimonials_badge">Badge</Label>
            <Input id="testimonials_badge" {...register('testimonials_badge')} placeholder="Testimonials" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testimonials_title">Title</Label>
            <Input id="testimonials_title" {...register('testimonials_title')} placeholder="What Our Clients Say" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testimonials_subtitle">Subtitle</Label>
            <Input id="testimonials_subtitle" {...register('testimonials_subtitle')} placeholder="Hear from satisfied clients" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">CTA Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="cta_title">Title</Label>
          <Input id="cta_title" {...register('cta_title')} placeholder="Ready to start?" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_description">Description</Label>
          <Textarea
            id="cta_description"
            {...register('cta_description')}
            placeholder="Call to action description"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_button">Button Text</Label>
          <Input id="cta_button" {...register('cta_button')} placeholder="Get Started" />
        </div>
      </div>
    </>
  )
}

function AboutFields({ register }: { register: any}) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="About Us" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Brief introduction"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Mission</h3>
        
        <div className="space-y-2">
          <Label htmlFor="mission_title">Mission Title</Label>
          <Input id="mission_title" {...register('mission_title')} placeholder="Our Mission" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mission_description">Mission Description</Label>
          <Textarea
            id="mission_description"
            {...register('mission_description')}
            placeholder="What drives us"
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Vision</h3>
        
        <div className="space-y-2">
          <Label htmlFor="vision_title">Vision Title</Label>
          <Input id="vision_title" {...register('vision_title')} placeholder="Our Vision" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vision_description">Vision Description</Label>
          <Textarea
            id="vision_description"
            {...register('vision_description')}
            placeholder="Where we're heading"
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Values & Stats</h3>
        
        <div className="space-y-2">
          <Label htmlFor="values_title">Values Title</Label>
          <Input id="values_title" {...register('values_title')} placeholder="Our Values" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="founded_year">Founded Year</Label>
            <Input id="founded_year" {...register('founded_year')} placeholder="2024" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_size">Team Size</Label>
            <Input id="team_size" {...register('team_size')} placeholder="10+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projects_completed">Projects Completed</Label>
            <Input id="projects_completed" {...register('projects_completed')} placeholder="50+" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Story Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="story_badge">Story Badge</Label>
          <Input id="story_badge" {...register('story_badge')} placeholder="Who We Are" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="story_title">Story Title</Label>
          <Input id="story_title" {...register('story_title')} placeholder="Technology-Driven Innovation" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="story_description">Story Description</Label>
          <Textarea
            id="story_description"
            {...register('story_description')}
            placeholder="Describe your company's story"
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Journey Timeline</h3>
        
        <div className="space-y-2">
          <Label htmlFor="journey_title">Journey Title</Label>
          <Input id="journey_title" {...register('journey_title')} placeholder="Our Journey" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_1_year">Milestone 1 Year</Label>
            <Input id="journey_milestone_1_year" {...register('journey_milestone_1_year')} placeholder="2024" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_1_title">Milestone 1 Title</Label>
            <Input id="journey_milestone_1_title" {...register('journey_milestone_1_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_1_desc">Milestone 1 Description</Label>
            <Input id="journey_milestone_1_desc" {...register('journey_milestone_1_desc')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_2_year">Milestone 2 Year</Label>
            <Input id="journey_milestone_2_year" {...register('journey_milestone_2_year')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_2_title">Milestone 2 Title</Label>
            <Input id="journey_milestone_2_title" {...register('journey_milestone_2_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_2_desc">Milestone 2 Description</Label>
            <Input id="journey_milestone_2_desc" {...register('journey_milestone_2_desc')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_3_year">Milestone 3 Year</Label>
            <Input id="journey_milestone_3_year" {...register('journey_milestone_3_year')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_3_title">Milestone 3 Title</Label>
            <Input id="journey_milestone_3_title" {...register('journey_milestone_3_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_3_desc">Milestone 3 Description</Label>
            <Input id="journey_milestone_3_desc" {...register('journey_milestone_3_desc')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_4_year">Milestone 4 Year</Label>
            <Input id="journey_milestone_4_year" {...register('journey_milestone_4_year')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_4_title">Milestone 4 Title</Label>
            <Input id="journey_milestone_4_title" {...register('journey_milestone_4_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey_milestone_4_desc">Milestone 4 Description</Label>
            <Input id="journey_milestone_4_desc" {...register('journey_milestone_4_desc')} />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Strategic Foundation</h3>
        
        <div className="space-y-2">
          <Label htmlFor="foundation_title">Foundation Title</Label>
          <Input id="foundation_title" {...register('foundation_title')} placeholder="Strategic Foundation" />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Why Choose Us (About Page)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_badge">Badge</Label>
            <Input id="why_choose_about_badge" {...register('why_choose_about_badge')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_title">Title</Label>
            <Input id="why_choose_about_title" {...register('why_choose_about_title')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_1_title">Reason 1 Title</Label>
            <Input id="why_choose_about_reason_1_title" {...register('why_choose_about_reason_1_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_1_desc">Reason 1 Description</Label>
            <Textarea id="why_choose_about_reason_1_desc" {...register('why_choose_about_reason_1_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_2_title">Reason 2 Title</Label>
            <Input id="why_choose_about_reason_2_title" {...register('why_choose_about_reason_2_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_2_desc">Reason 2 Description</Label>
            <Textarea id="why_choose_about_reason_2_desc" {...register('why_choose_about_reason_2_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_3_title">Reason 3 Title</Label>
            <Input id="why_choose_about_reason_3_title" {...register('why_choose_about_reason_3_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_3_desc">Reason 3 Description</Label>
            <Textarea id="why_choose_about_reason_3_desc" {...register('why_choose_about_reason_3_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_4_title">Reason 4 Title</Label>
            <Input id="why_choose_about_reason_4_title" {...register('why_choose_about_reason_4_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_4_desc">Reason 4 Description</Label>
            <Textarea id="why_choose_about_reason_4_desc" {...register('why_choose_about_reason_4_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_5_title">Reason 5 Title</Label>
            <Input id="why_choose_about_reason_5_title" {...register('why_choose_about_reason_5_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_5_desc">Reason 5 Description</Label>
            <Textarea id="why_choose_about_reason_5_desc" {...register('why_choose_about_reason_5_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_6_title">Reason 6 Title</Label>
            <Input id="why_choose_about_reason_6_title" {...register('why_choose_about_reason_6_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="why_choose_about_reason_6_desc">Reason 6 Description</Label>
            <Textarea id="why_choose_about_reason_6_desc" {...register('why_choose_about_reason_6_desc')} rows={2} />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Leadership Quote</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leadership_quote_badge">Badge</Label>
            <Input id="leadership_quote_badge" {...register('leadership_quote_badge')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadership_quote_text">Quote Text</Label>
            <Textarea id="leadership_quote_text" {...register('leadership_quote_text')} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadership_quote_author_name">Author Name</Label>
            <Input id="leadership_quote_author_name" {...register('leadership_quote_author_name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadership_quote_author_title">Author Title</Label>
            <Input id="leadership_quote_author_title" {...register('leadership_quote_author_title')} />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Company Profile</h3>
        
        <div className="space-y-2">
          <Label htmlFor="profile_title">Profile Title</Label>
          <Input id="profile_title" {...register('profile_title')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile_entity_label">Entity Label</Label>
            <Input id="profile_entity_label" {...register('profile_entity_label')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_entity_value">Entity Value</Label>
            <Input id="profile_entity_value" {...register('profile_entity_value')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_sector_label">Sector Label</Label>
            <Input id="profile_sector_label" {...register('profile_sector_label')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_sector_value">Sector Value</Label>
            <Input id="profile_sector_value" {...register('profile_sector_value')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_compliance_label">Compliance Label</Label>
            <Input id="profile_compliance_label" {...register('profile_compliance_label')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_compliance_value">Compliance Value</Label>
            <Input id="profile_compliance_value" {...register('profile_compliance_value')} />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Partnership Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="partnership_badge">Badge</Label>
            <Input id="partnership_badge" {...register('partnership_badge')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_title">Title</Label>
            <Input id="partnership_title" {...register('partnership_title')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="partnership_description">Description</Label>
          <Textarea id="partnership_description" {...register('partnership_description')} rows={2} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="partnership_service_1_title">Service 1 Title</Label>
            <Input id="partnership_service_1_title" {...register('partnership_service_1_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_1_desc">Service 1 Description</Label>
            <Textarea id="partnership_service_1_desc" {...register('partnership_service_1_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_2_title">Service 2 Title</Label>
            <Input id="partnership_service_2_title" {...register('partnership_service_2_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_2_desc">Service 2 Description</Label>
            <Textarea id="partnership_service_2_desc" {...register('partnership_service_2_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_3_title">Service 3 Title</Label>
            <Input id="partnership_service_3_title" {...register('partnership_service_3_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_3_desc">Service 3 Description</Label>
            <Textarea id="partnership_service_3_desc" {...register('partnership_service_3_desc')} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_4_title">Service 4 Title</Label>
            <Input id="partnership_service_4_title" {...register('partnership_service_4_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_service_4_desc">Service 4 Description</Label>
            <Textarea id="partnership_service_4_desc" {...register('partnership_service_4_desc')} rows={2} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="partnership_footer_text">Footer Text</Label>
            <Input id="partnership_footer_text" {...register('partnership_footer_text')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_cta_status">CTA Status</Label>
            <Input id="partnership_cta_status" {...register('partnership_cta_status')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_cta_start">CTA Button</Label>
            <Input id="partnership_cta_start" {...register('partnership_cta_start')} />
          </div>
        </div>
      </div>
    </>
  )
}

function ServicesFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Our Services" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="What we offer"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">CTA Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="cta_title">CTA Title</Label>
          <Input id="cta_title" {...register('cta_title')} placeholder="Ready to Get Started?" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_description">CTA Description</Label>
          <Textarea
            id="cta_description"
            {...register('cta_description')}
            placeholder="Encouraging message"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta_button">Button Text</Label>
          <Input id="cta_button" {...register('cta_button')} placeholder="Contact Us" />
        </div>
      </div>
    </>
  )
}

function ContactFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Get in Touch" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Contact introduction"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Contact Form Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="form_title">Form Title</Label>
          <Input id="form_title" {...register('form_title')} placeholder="Send Us a Message" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form_description">Form Description</Label>
          <Textarea
            id="form_description"
            {...register('form_description')}
            placeholder="Form instructions"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Contact Information Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="info_title">Info Title</Label>
          <Input id="info_title" {...register('info_title')} placeholder="Contact Information" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="info_description">Info Description</Label>
          <Textarea
            id="info_description"
            {...register('info_description')}
            placeholder="Additional contact details"
            rows={3}
          />
        </div>
      </div>
    </>
  )
}

function ProjectsFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Our Projects" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Portfolio introduction"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Filter Labels</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter_all">All Projects Label</Label>
            <Input id="filter_all" {...register('filter_all')} placeholder="All Projects" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter_featured">Featured Label</Label>
            <Input id="filter_featured" {...register('filter_featured')} placeholder="Featured" />
          </div>
        </div>
      </div>
    </>
  )
}

function TeamFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Meet Our Team" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Team introduction"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Management Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="management_title">Section Title</Label>
          <Input id="management_title" {...register('management_title')} placeholder="Management Team" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="management_description">Section Description</Label>
          <Textarea
            id="management_description"
            {...register('management_description')}
            placeholder="About the management team"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Development Team Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="development_title">Section Title</Label>
          <Input id="development_title" {...register('development_title')} placeholder="Our Developers" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="development_description">Section Description</Label>
          <Textarea
            id="development_description"
            {...register('development_description')}
            placeholder="About the development team"
            rows={3}
          />
        </div>
      </div>
    </>
  )
}

function CareersFields({ register }: { register: any }) {
  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="hero_title">Hero Title</Label>
          <Input id="hero_title" {...register('hero_title')} placeholder="Join Our Team" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero_subtitle"
            {...register('hero_subtitle')}
            placeholder="Career opportunities introduction"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Positions Section</h3>
        
        <div className="space-y-2">
          <Label htmlFor="positions_title">Section Title</Label>
          <Input id="positions_title" {...register('positions_title')} placeholder="Open Positions" />
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">No Positions Message</h3>
        
        <div className="space-y-2">
          <Label htmlFor="no_positions_title">No Positions Title</Label>
          <Input
            id="no_positions_title"
            {...register('no_positions_title')}
            placeholder="No Open Positions Right Now"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="no_positions_description">No Positions Description</Label>
          <Textarea
            id="no_positions_description"
            {...register('no_positions_description')}
            placeholder="Message when no jobs are available"
            rows={3}
          />
        </div>
      </div>
    </>
  )
}
