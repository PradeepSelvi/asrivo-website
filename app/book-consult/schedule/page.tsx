"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Loader2, CheckCircle2 } from "lucide-react"
import { MobileBackButton } from "@/components/mobile-back-button"

export default function ScheduleConsultationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    availability: "",
    preferredMode: [] as string[],
    message: "",
  })

  const connectionModes = [
    { value: "video", label: "Video Call (Google Meet/Zoom)" },
    { value: "phone", label: "Phone Call" },
    { value: "whatsapp", label: "WhatsApp Call" },
    { value: "in-person", label: "In-Person Meeting" },
  ]

  const handleModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMode: prev.preferredMode.includes(mode)
        ? prev.preferredMode.filter(m => m !== mode)
        : [...prev.preferredMode, mode]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
      setTimeout(() => {
        router.push('/book-consult/success')
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <MobileBackButton />
      
      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl mb-3">
            Schedule Your Consultation
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you within 24 hours to confirm your consultation time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name"
                className="mt-2"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="yourname@gmail.com"
                className="mt-2"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder=""
                className="mt-2"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp" className="text-sm font-semibold">
                WhatsApp Number <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder=""
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                If different from your phone number
              </p>
            </div>

            {/* Availability */}
            <div>
              <Label htmlFor="availability" className="text-sm font-semibold">
                Your Availability <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="availability"
                required
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g., Monday-Friday, 9 AM - 5 PM EST, or specific dates/times"
                rows={3}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Please specify your preferred days and times (include your timezone)
              </p>
            </div>

            {/* Preferred Connection Mode */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Preferred Connection Mode <span className="text-destructive">*</span>
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {connectionModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleModeToggle(mode.value)}
                    className={`relative flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                      formData.preferredMode.includes(mode.value)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        formData.preferredMode.includes(mode.value)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {formData.preferredMode.includes(mode.value) && (
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{mode.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Select all modes you&apos;re comfortable with
              </p>
            </div>

            {/* Additional Message */}
            <div>
              <Label htmlFor="message" className="text-sm font-semibold">
                Additional Information <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us more about your project or any specific topics you'd like to discuss..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || formData.preferredMode.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Consultation
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                We&apos;ll review your request and confirm your consultation within 24 hours
              </p>
            </div>
          </div>
        </form>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:info@asrivotech.com" className="text-primary hover:underline">
              info@asrivotech.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
