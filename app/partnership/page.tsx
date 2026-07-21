"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Handshake,
  Building2,
  Mail,
  Phone,
  Globe,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Upload,
  File,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function PartnershipPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState({
    agreement: false,
    noc: false,
    proposal: false,
  })
  const [uploadedFiles, setUploadedFiles] = useState<{
    agreement: { url: string; name: string } | null
    noc: { url: string; name: string } | null
    proposal: { url: string; name: string } | null
  }>({
    agreement: null,
    noc: null,
    proposal: null,
  })
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleFileUpload = async (
    file: File,
    documentType: 'agreement' | 'noc' | 'proposal'
  ) => {
    // Clear any previous errors
    setErrorMessage(null)

    // Validate file type - ONLY PDF allowed
    if (file.type !== 'application/pdf') {
      setErrorMessage('Your uploaded document must be PDF/application format. Please change the format and submit again.')
      return
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB. Please compress your PDF and try again.')
      return
    }

    setUploadingFiles((prev) => ({ ...prev, [documentType]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      formData.append('partnershipId', '')

      const response = await fetch('/api/partnerships/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadedFiles((prev) => ({
          ...prev,
          [documentType]: { url: result.fileUrl, name: file.name },
        }))
      } else {
        setErrorMessage(result.error || 'Failed to upload file. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrorMessage('Network error occurred while uploading. Please check your connection and try again.')
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [documentType]: false }))
    }
  }

  const removeFile = (documentType: 'agreement' | 'noc' | 'proposal') => {
    setUploadedFiles((prev) => ({
      ...prev,
      [documentType]: null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear any previous errors
    setErrorMessage(null)
    
    if (!termsAccepted) {
      setErrorMessage('Please accept the terms and conditions to continue.')
      return
    }

    if (!uploadedFiles.agreement || !uploadedFiles.noc || !uploadedFiles.proposal) {
      setErrorMessage('Please upload all required documents (Partnership Agreement, NOC, and Proposal) in PDF format.')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      companyName: formData.get('companyName'),
      contactPerson: formData.get('contactPerson'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      website: formData.get('website'),
      partnershipType: formData.get('partnershipType'),
      companySize: formData.get('companySize'),
      industry: formData.get('industry'),
      servicesOffered: formData.get('servicesOffered'),
      message: formData.get('message'),
      agreementDocumentUrl: uploadedFiles.agreement.url,
      nocDocumentUrl: uploadedFiles.noc.url,
      proposalDocumentUrl: uploadedFiles.proposal.url,
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit partnership request')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit partnership request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Handshake className="w-4 h-4" />
              Partnership Opportunities
            </div>
            
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl text-balance">
              Collaborate & Grow Together
            </h1>
            
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Join forces with Asrivo Tech to deliver comprehensive digital solutions. 
              Whether you're a marketing agency, technology provider, or business consultant, 
              let's create value together.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-foreground">Partnership Request Submitted!</h3>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Thank you for your interest in partnering with Asrivo Tech. 
                Our business development team will review your submission and contact you within 2-3 business days.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Request
                </Button>
                <Button asChild>
                  <a href="/partnership/status">Check Status</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Info Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Why Partner With Us?</h2>
                  <p className="text-muted-foreground">
                    Expand your service offerings and provide end-to-end digital solutions to your clients.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: Target,
                      title: "Mutual Growth",
                      desc: "Win-win business model with shared success metrics"
                    },
                    {
                      icon: Users,
                      title: "Expert Team",
                      desc: "Access to 50+ specialized technology professionals"
                    },
                    {
                      icon: Sparkles,
                      title: "Quality Delivery",
                      desc: "Production-grade solutions with proven track record"
                    }
                  ].map((benefit) => (
                    <div key={benefit.title} className="flex gap-4 p-4 rounded-xl bg-background border border-border">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{benefit.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Partnership Application</h2>
                  <p className="text-muted-foreground mb-8">
                    Fill out the form below and let's explore collaboration opportunities.
                  </p>

                  {/* Error Message Display */}
                  {errorMessage && (
                    <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-600 mb-1">Upload Error</h4>
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                        Company Information
                      </h3>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="companyName"
                              name="companyName"
                              placeholder="Your Company Ltd."
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Company Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              name="website"
                              type="url"
                              placeholder="https://yourcompany.com"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry *</Label>
                          <Input
                            id="industry"
                            name="industry"
                            placeholder="e.g., Digital Marketing, IT Services"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companySize">Company Size *</Label>
                          <Select name="companySize" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="500+">500+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                        Contact Person
                      </h3>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Full Name *</Label>
                          <Input
                            id="contactPerson"
                            name="contactPerson"
                            placeholder="Your Name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="yourname@company.com"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (234) 567-890"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Partnership Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                        Partnership Details
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="partnershipType">Partnership Type *</Label>
                        <Select name="partnershipType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select partnership type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="referral">Referral Partner</SelectItem>
                            <SelectItem value="reseller">Reseller Partner</SelectItem>
                            <SelectItem value="technology">Technology Partner</SelectItem>
                            <SelectItem value="marketing">Marketing Agency Partner</SelectItem>
                            <SelectItem value="strategic">Strategic Alliance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servicesOffered">Your Services/Offerings *</Label>
                        <Textarea
                          id="servicesOffered"
                          name="servicesOffered"
                          placeholder="Describe the services your company provides..."
                          rows={3}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Partnership Proposal *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your partnership vision, target markets, and how we can collaborate..."
                          rows={5}
                          required
                        />
                      </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
                        Required Documents *
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload the following documents (<strong>PDF format only</strong>, max 10MB each)
                      </p>

                      {/* Partnership Agreement Document */}
                      <div className="space-y-2">
                        <Label htmlFor="agreement">Partnership Agreement Document *</Label>
                        {uploadedFiles.agreement ? (
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{uploadedFiles.agreement.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('agreement')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input
                              id="agreement"
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, 'agreement')
                              }}
                              className="cursor-pointer"
                              disabled={uploadingFiles.agreement}
                            />
                            {uploadingFiles.agreement && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* NOC Document */}
                      <div className="space-y-2">
                        <Label htmlFor="noc">No Objection Certificate (NOC) *</Label>
                        {uploadedFiles.noc ? (
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{uploadedFiles.noc.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('noc')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input
                              id="noc"
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, 'noc')
                              }}
                              className="cursor-pointer"
                              disabled={uploadingFiles.noc}
                            />
                            {uploadingFiles.noc && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Proposal Document */}
                      <div className="space-y-2">
                        <Label htmlFor="proposal">Detailed Proposal Document *</Label>
                        {uploadedFiles.proposal ? (
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{uploadedFiles.proposal.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('proposal')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Input
                              id="proposal"
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, 'proposal')
                              }}
                              className="cursor-pointer"
                              disabled={uploadingFiles.proposal}
                            />
                            {uploadingFiles.proposal && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg bg-muted/20">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        required
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          I accept all terms and conditions *
                        </label>
                        <p className="text-xs text-muted-foreground">
                          By checking this box, you agree to our partnership terms, privacy policy, 
                          and confirm that all provided information and documents are accurate and authentic.
                        </p>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={loading || !termsAccepted}>
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Partnership Request
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      All submitted documents are securely stored and only accessible to authorized administrators.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Partnership Benefits</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              When you partner with Asrivo Tech, you gain access to resources and expertise 
              that help you deliver exceptional value to your clients.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🤝",
                title: "Dedicated Support",
                desc: "Partnership manager assigned to your account"
              },
              {
                icon: "💰",
                title: "Revenue Sharing",
                desc: "Competitive commission structure and incentives"
              },
              {
                icon: "🎓",
                title: "Training & Resources",
                desc: "Access to technical documentation and training"
              },
              {
                icon: "🚀",
                title: "Co-Marketing",
                desc: "Joint marketing initiatives and lead generation"
              }
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
