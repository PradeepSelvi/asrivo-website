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
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">Stats Section</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stats_services">Services Count</Label>
            <Input id="stats_services" {...register('stats_services')} placeholder="8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_projects">Projects Count</Label>
            <Input id="stats_projects" {...register('stats_projects')} placeholder="50+" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_reliability">Reliability</Label>
            <Input id="stats_reliability" {...register('stats_reliability')} placeholder="99.9%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats_support">Support Hours</Label>
            <Input id="stats_support" {...register('stats_support')} placeholder="Mon-Sat" />
          </div>
        </div>
      </div>

      <div className="space-y-6 border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground">About Section</h3>
        
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

function AboutFields({ register }: { register: any }) {
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
