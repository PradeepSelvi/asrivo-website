import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  Code,
  DollarSign,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCareersContent } from '@/lib/supabase/content-helpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCareersContent()

  return {
    title: content.meta_title || 'Careers - Asrivo Tech',
    description:
      content.meta_description ||
      content.hero_subtitle ||
      "We're a team of passionate builders crafting digital solutions that make a real difference.",
    keywords: content.meta_keywords,
    openGraph: {
      title: content.meta_title || 'Careers at Asrivo Tech',
      description:
        content.meta_description || 'Build the future with us. See all open positions.',
    },
  }
}

interface JobPosting {
  id: string
  title: string
  slug: string | null
  description: string | null
  requirements: string[] | null
  salary_range: string | null
  location: string | null
  employment_type: string | null
  experience_level: string | null
  active: boolean
  created_at: string
}

const employmentTypeColors: Record<string, string> = {
  'full-time': 'bg-green-500/10 text-green-700 dark:text-green-400',
  'part-time': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  contract: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  freelance: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  internship: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
}

export default async function CareersPage() {
  const supabase = await createClient()
  let content
  try {
    content = await getCareersContent()
  } catch (error) {
    console.error('Error loading careers page content:', error)
    content = await getCareersContent() // Helper returns defaults on error
  }

  // Check if careers page is enabled
  const { data: pageEnabledSetting } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'careers_page_enabled')
    .single()

  const careersPageEnabled = pageEnabledSetting?.setting_value === 'true'

  // Check if job applications are enabled (dedicated form vs contact form)
  const { data: applicationsEnabledSetting } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'job_applications_enabled')
    .single()

  const jobApplicationsEnabled = applicationsEnabledSetting?.setting_value !== 'false'

  // Check if accepting new applications
  const { data: acceptApplicationsSetting } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'accept_applications')
    .single()

  const acceptApplications = acceptApplicationsSetting?.setting_value !== 'false'

  // If careers page is disabled, show message
  if (!careersPageEnabled) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {content.disabled_title || "Careers Page Temporarily Unavailable"}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
            {content.disabled_description || "We're currently updating our careers section. Please check back soon or contact us directly for any inquiries."}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {content.disabled_button || "Contact Us"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    )
  }

  const { data: jobs } = await supabase
    .from('job_postings')
    .select(
      'id, title, slug, description, requirements, salary_range, location, employment_type, experience_level, active, created_at'
    )
    .eq('active', true)
    .order('created_at', { ascending: false })

  const activeJobs: JobPosting[] = jobs ?? []

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#1a56db22,transparent_60%)]" />
          <div className="relative max-w-5xl mx-auto px-4 py-24 lg:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-300 mb-6">
              <Sparkles className="w-4 h-4" />
              {content.careers_badge || "We're Hiring"}
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              {content.hero_title.split(' at')[0]} at{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Asrivo Tech
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {content.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Collaborative culture
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Remote-friendly
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Cutting-edge tech stack
              </div>
            </div>
          </div>
        </section>

        {/* Jobs */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          {activeJobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {content.no_positions_title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                {content.no_positions_description}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {content.positions_title}
                  <span className="ml-2 text-base font-semibold text-blue-600 dark:text-blue-400">
                    ({activeJobs.length})
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {activeJobs.map((job) => {
                  const typeColor =
                    employmentTypeColors[job.employment_type?.toLowerCase() ?? ''] ??
                    'bg-slate-500/10 text-slate-700 dark:text-slate-400'

                  // Use dedicated application form or contact form based on settings
                  const applyUrl = jobApplicationsEnabled
                    ? `/apply?job=${encodeURIComponent(job.title)}&position=${job.id}`
                    : `/contact?subject=${encodeURIComponent(`Job Application: ${job.title}`)}`

                  return (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              {job.title}
                            </h3>
                            {job.employment_type && (
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
                                {job.employment_type}
                              </span>
                            )}
                            {job.experience_level && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {job.experience_level}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.location}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                <DollarSign className="w-3.5 h-3.5" />
                                {job.salary_range}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(job.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          {job.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                              {job.description}
                            </p>
                          )}

                          {job.requirements && job.requirements.length > 0 && (
                            <ul className="space-y-1">
                              {job.requirements.slice(0, 4).map((req, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                                >
                                  <span className="text-blue-500 mt-1.5 shrink-0">•</span>
                                  {req}
                                </li>
                              ))}
                              {job.requirements.length > 4 && (
                                <li className="text-xs text-slate-400">
                                  +{job.requirements.length - 4} more requirements
                                </li>
                              )}
                            </ul>
                          )}
                        </div>

                        <div className="shrink-0">
                          {acceptApplications ? (
                            <Link
                              href={applyUrl}
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
                            >
                              {content.job_button_apply || "Apply Now"}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          ) : (
                            <div className="text-center">
                              <span className="inline-block text-xs font-semibold px-4 py-2 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                {content.job_button_closed || "Applications Closed"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* CTA Footer */}
              <div className="mt-12 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {content.cta_footer_title || "Don't see a perfect fit?"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {content.cta_footer_description || "We're always looking for exceptional talent. Send us your CV and we'll keep you in mind."}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {content.cta_footer_button || "Contact Us"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
  )
}
