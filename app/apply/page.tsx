'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MobileBackButton } from '@/components/mobile-back-button'
import {
  Briefcase,
  Send,
  CheckCircle,
  FileText,
  Linkedin,
  Globe,
  Upload,
} from 'lucide-react'
import { loadRecaptchaScript, executeRecaptcha } from '@/lib/utils/captcha'

function ApplyContent() {
  const searchParams = useSearchParams()
  const jobTitle = searchParams.get('job') || ''
  const positionId = searchParams.get('position') || ''

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    experience_years: '',
    resume_url: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: '',
  })

  // Load reCAPTCHA script on mount
  useEffect(() => {
    loadRecaptchaScript()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Execute reCAPTCHA
      const captchaToken = await executeRecaptcha('job_application')

      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          job_title: jobTitle || null,
          position_id: positionId ? parseInt(positionId) : null,
          captchaToken: captchaToken || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error from server:', result)
        const errorMsg =
          typeof result?.error === 'object' && result?.error !== null
            ? result.error.message || JSON.stringify(result.error)
            : result?.error || result?.message || 'Failed to submit application'
        throw new Error(errorMsg)
      }

      console.log('Success:', result)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MobileBackButton />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Briefcase className="w-4 h-4" />
              Job Application
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              {jobTitle || 'Apply for a Position'}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We're excited to learn more about you. Fill out the application form below
              and we'll get back to you within 2-3 business days.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          {submitted ? (
            <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-foreground">
                Application Submitted!
              </h3>
              <p className="mt-3 text-muted-foreground">
                Thank you for applying{jobTitle ? ` for ${jobTitle}` : ''}. We've
                received your application and will review it shortly. You'll hear from us
                within 2-3 business days.
              </p>
              <Button className="mt-8" onClick={() => (window.location.href = '/careers')}>
                View Other Positions
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Personal Information
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_years">
                      Years of Experience <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      placeholder="3"
                      value={formData.experience_years}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Professional Links & Documents
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resume_url" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Resume URL
                    </Label>
                    <Input
                      id="resume_url"
                      name="resume_url"
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.resume_url}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your resume to Google Drive, Dropbox, or similar and paste the
                      shareable link here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Portfolio / Website
                    </Label>
                    <Input
                      id="portfolio_url"
                      name="portfolio_url"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolio_url}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Cover Letter</h2>

                <div className="space-y-2">
                  <Label htmlFor="cover_letter">
                    Tell us why you're a great fit for this role
                  </Label>
                  <Textarea
                    id="cover_letter"
                    name="cover_letter"
                    placeholder="I'm excited about this opportunity because..."
                    rows={8}
                    value={formData.cover_letter}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center gap-4">
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      Submit Application
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This site is protected by reCAPTCHA and the Google Privacy Policy and Terms
                  of Service apply.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ApplyContent />
    </React.Suspense>
  )
}
