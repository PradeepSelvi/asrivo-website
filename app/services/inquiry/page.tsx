'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Send, AlertCircle, Upload, File, X } from 'lucide-react'
import Link from 'next/link'

const FORM_STORAGE_KEY = 'inquiry_form_data'
const STEP_STORAGE_KEY = 'inquiry_form_step'

export default function ServiceInquiryPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [prdFile, setPrdFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [wasRestored, setWasRestored] = useState(false)
  const [prdInputMethod, setPrdInputMethod] = useState<'upload' | 'write'>('upload')
  const [canSubmit, setCanSubmit] = useState(false) // Flag to control actual submission
  const totalSteps = 4

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Contact Info
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    countryCode: '+91',
    whatsappCountryCode: '+91',
    preferredContact: 'email',

    // Step 2: Project Type & Requirements
    projectTypes: [] as string[],
    otherProjectType: '', // Manual entry when "Other" is selected
    projectDescription: '',
    hasExisting: 'no',
    existingLink: '',
    targetPlatform: [] as string[],
    keyFeatures: [] as string[],
    otherKeyFeature: '', // Manual entry when "Other" is selected for features

    // Step 3: Business Metrics
    budgetRange: '',
    timeline: '',
    targetAudience: '',
    painPoints: '',

    // Step 4: Optional Info
    referenceLinks: '',
    hearAboutUs: '',
    prdFileUrl: '', // URL of uploaded PRD file
    prdText: '', // Manually written PRD
  })

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY)
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
        setWasRestored(true)
      } catch (e) {
        console.error('Failed to parse saved form data:', e)
      }
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10))
    }
    
    setIsLoaded(true)
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  // Save current step to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString())
    }
  }, [currentStep, isLoaded])

  // Clear saved data after successful submission
  const clearSavedData = () => {
    localStorage.removeItem(FORM_STORAGE_KEY)
    localStorage.removeItem(STEP_STORAGE_KEY)
  }

  const handleCheckboxChange = (field: 'projectTypes' | 'targetPlatform' | 'keyFeatures', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setPrdFile(file)
    setError('')
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setPrdFile(file)
    setError('')
  }

  const removeFile = () => {
    setPrdFile(null)
    setFormData({ ...formData, prdFileUrl: '' })
  }

  const validateStep = (step: number): boolean => {
    setError('')
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Name is required')
          return false
        }
        if (!formData.company.trim()) {
          setError('Company/Business name is required')
          return false
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Valid email is required')
          return false
        }
        if (!formData.phone.trim()) {
          setError('Phone number is required')
          return false
        }
        break
      case 2:
        if (formData.projectTypes.length === 0) {
          setError('Please select at least one project type')
          return false
        }
        if (formData.projectTypes.includes('Other') && !formData.otherProjectType.trim()) {
          setError('Please specify the project type when selecting "Other"')
          return false
        }
        if (formData.keyFeatures.includes('Other') && !formData.otherKeyFeature.trim()) {
          setError('Please specify the key feature when selecting "Other"')
          return false
        }
        if (!formData.projectDescription.trim() || formData.projectDescription.length < 20) {
          setError('Please provide a detailed project description (minimum 20 characters)')
          return false
        }
        break
      case 3:
        if (!formData.budgetRange) {
          setError('Please select a budget range')
          return false
        }
        if (!formData.timeline) {
          setError('Please select a timeline')
          return false
        }
        break
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, totalSteps)
      console.log('Moving from step', currentStep, 'to step', nextStep)
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('handleSubmit called on step:', currentStep, 'canSubmit:', canSubmit)
    
    // Only allow submission if explicitly enabled (from Submit button click)
    if (!canSubmit) {
      console.log('Submission blocked - canSubmit flag is false')
      return
    }
    
    if (!validateStep(currentStep)) {
      setCanSubmit(false) // Reset flag
      return
    }

    if (currentStep < totalSteps) {
      console.log('Not on final step, should not submit')
      setCanSubmit(false) // Reset flag
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let prdFileUrl = ''

      // Upload PRD file if provided
      if (prdFile) {
        setUploadingFile(true)
        const fileFormData = new FormData()
        fileFormData.append('file', prdFile)
        fileFormData.append('bucket', 'inquiry-documents')
        fileFormData.append('folder', 'prds')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: fileFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          prdFileUrl = uploadData.url
        } else {
          console.error('File upload failed, continuing without file')
        }
        setUploadingFile(false)
      }

      console.log('Submitting inquiry data:', formData)
      
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prdFileUrl,
          prdFileName: prdFile?.name || null,
        }),
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.')
      }

      // Clear saved form data after successful submission
      clearSavedData()
      
      router.push('/services/inquiry/success')
    } catch (err) {
      console.error('Submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit inquiry. Please try again later.')
      setIsSubmitting(false)
    }
  }

  // Prevent Enter key from submitting form except on last step
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      // Always prevent default Enter behavior
      e.preventDefault()
      
      // If not on last step, trigger Next
      if (currentStep < totalSteps) {
        handleNext()
      }
      // If on last step, do nothing (user must click Submit button)
    }
  }

  // Show loading state while form data is being restored
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/services" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Get Started with Your Project</h1>
          <p className="text-muted-foreground">
            Tell us about your requirements and we'll get back to you within 24 hours
          </p>
          
          {/* Show notification if form was restored */}
          {(wasRestored && currentStep > 1) && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                ✓ Your progress has been saved. Continue where you left off!
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-primary text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Contact Info</span>
            <span>Project Details</span>
            <span>Business Metrics</span>
            <span>Additional Info</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-card border border-border rounded-2xl p-8">
          {/* Step 1: Basic Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Company/Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Your Company Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="yourname@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-32 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.whatsappCountryCode}
                    onChange={(e) => setFormData({ ...formData, whatsappCountryCode: e.target.value })}
                    className="w-32 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="9876543210 (optional)"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">If different from phone number</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['email', 'call', 'whatsapp'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredContact: method })}
                      className={`px-4 py-2.5 rounded-lg font-semibold text-sm capitalize transition-all ${
                        formData.preferredContact === method
                          ? 'bg-primary text-white'
                          : 'bg-background border border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Type & Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Project Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Project Type(s) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Web Development',
                    'Mobile App Development',
                    'E-commerce',
                    'CMS',
                    'UI/UX Design',
                    'Other'
                  ].map((type) => (
                    <label key={type} className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg cursor-pointer hover:border-primary transition-all">
                      <input
                        type="checkbox"
                        checked={formData.projectTypes.includes(type)}
                        onChange={() => handleCheckboxChange('projectTypes', type)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{type}</span>
                    </label>
                  ))}
                </div>
                
                {/* Show text input when "Other" is selected */}
                {formData.projectTypes.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.otherProjectType}
                      onChange={(e) => setFormData({ ...formData, otherProjectType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Please specify the project type..."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Tell us about your project, its goals, and what you're trying to achieve..."
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.projectDescription.length} characters (minimum 20)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Do you have an existing website/app?
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="no"
                      checked={formData.hasExisting === 'no'}
                      onChange={(e) => setFormData({ ...formData, hasExisting: e.target.value, existingLink: '' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="yes"
                      checked={formData.hasExisting === 'yes'}
                      onChange={(e) => setFormData({ ...formData, hasExisting: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Yes</span>
                  </label>
                </div>
                {formData.hasExisting === 'yes' && (
                  <input
                    type="url"
                    value={formData.existingLink}
                    onChange={(e) => setFormData({ ...formData, existingLink: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://example.com"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Target Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Web', 'iOS', 'Android', 'Both Mobile'].map((platform) => (
                    <label key={platform} className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg cursor-pointer hover:border-primary transition-all">
                      <input
                        type="checkbox"
                        checked={formData.targetPlatform.includes(platform)}
                        onChange={() => handleCheckboxChange('targetPlatform', platform)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Key Features Needed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Authentication',
                    'Payment Gateway',
                    'Admin Panel',
                    'Push Notifications',
                    'Third-party Integrations',
                    'Analytics',
                    'Chat/Messaging',
                    'File Upload',
                    'Other'
                  ].map((feature) => (
                    <label key={feature} className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg cursor-pointer hover:border-primary transition-all">
                      <input
                        type="checkbox"
                        checked={formData.keyFeatures.includes(feature)}
                        onChange={() => handleCheckboxChange('keyFeatures', feature)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{feature}</span>
                    </label>
                  ))}
                </div>
                
                {/* Show text input when "Other" is selected */}
                {formData.keyFeatures.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.otherKeyFeature}
                      onChange={(e) => setFormData({ ...formData, otherKeyFeature: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Please specify the key feature..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Business Metrics */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Business Metrics</h2>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Budget Range <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select budget range</option>
                  <option value="<₹20k">Less than ₹20,000</option>
                  <option value="₹20k-2L">₹20,000 - ₹2,00,000</option>
                  <option value="₹2L-5L">₹2,00,000 - ₹5,00,000</option>
                  <option value="₹5L+">₹5,00,000+</option>
                  <option value="not-sure">Not sure yet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Timeline/Deadline <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP (within 2 weeks)</option>
                  <option value="1-month">1 month</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Target Audience/Users
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., B2B SaaS companies, Expected 10,000 users"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Current Pain Points / Goals
                </label>
                <textarea
                  value={formData.painPoints}
                  onChange={(e) => setFormData({ ...formData, painPoints: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="What problem are you trying to solve? What are your business goals?"
                />
              </div>
            </div>
          )}

          {/* Step 4: Optional Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Additional Information (Optional)</h2>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reference Websites/Apps
                </label>
                <textarea
                  value={formData.referenceLinks}
                  onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="Share links to websites or apps you like (one per line)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Product Requirements Document (PRD)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Share your requirements by uploading a document or writing them below
                </p>

                {/* Toggle between upload and write */}
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPrdInputMethod('upload')
                      setFormData({ ...formData, prdText: '' })
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      prdInputMethod === 'upload'
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-foreground hover:border-primary'
                    }`}
                  >
                    📤 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrdInputMethod('write')
                      setPrdFile(null)
                      setFormData({ ...formData, prdFileUrl: '' })
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                      prdInputMethod === 'write'
                        ? 'bg-primary text-white'
                        : 'bg-background border border-border text-foreground hover:border-primary'
                    }`}
                  >
                    ✍️ Write Here
                  </button>
                </div>

                {/* Upload Option */}
                {prdInputMethod === 'upload' && (
                  <>
                    {!prdFile ? (
                      <label 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, DOCX, or TXT (max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-lg">
                        <File className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{prdFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(prdFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-2 hover:bg-muted rounded-lg transition-all"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Write Option */}
                {prdInputMethod === 'write' && (
                  <div>
                    <textarea
                      value={formData.prdText}
                      onChange={(e) => setFormData({ ...formData, prdText: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Write your product requirements here...&#10;&#10;Example:&#10;- User authentication with email and password&#10;- Dashboard with analytics&#10;- Mobile responsive design&#10;- Payment integration (Stripe)&#10;- Real-time notifications"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(formData.prdText || '').length} characters
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  How did you hear about us?
                </label>
                <select
                  value={formData.hearAboutUs}
                  onChange={(e) => setFormData({ ...formData, hearAboutUs: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select an option</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google Search</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-background border border-border rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Review Your Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {formData.name}</p>
                  <p><span className="font-semibold">Email:</span> {formData.email}</p>
                  <p><span className="font-semibold">Phone:</span> {formData.countryCode} {formData.phone}</p>
                  <p><span className="font-semibold">Project Types:</span> {formData.projectTypes.join(', ')}</p>
                  <p><span className="font-semibold">Budget:</span> {formData.budgetRange}</p>
                  <p><span className="font-semibold">Timeline:</span> {formData.timeline}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all cursor-pointer"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || uploadingFile}
                onClick={() => setCanSubmit(true)} // Enable submission only when Submit button is clicked
                className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingFile ? (
                  <>Uploading file...</>
                ) : isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    Submit Inquiry
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
