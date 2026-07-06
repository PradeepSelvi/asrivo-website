"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Video,
  Phone,
  Mail,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM"
]

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNextStep = () => {
    if (step === 1 && date && selectedTime) {
      setStep(2)
    }
  }

  const handleBackStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    const data = {
      name: formData.get('fullName'),
      email: formData.get('email'),
      company: formData.get('company'),
      brief: formData.get('brief'),
      date: date?.toISOString(),
      time: selectedTime,
    }

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule call')
      }
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error scheduling call:', error)
      alert('Failed to schedule call. Please try again or contact us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md w-full bg-background rounded-3xl border border-border p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Call Scheduled!</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for booking a call. We've sent a confirmation email to your inbox with the meeting details.
          </p>
          <div className="mt-8 p-4 rounded-2xl bg-muted/50 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-foreground font-medium">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {date ? format(date, "PPPP") : ""}
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground font-medium">
              <Clock className="h-4 w-4 text-primary" />
              {selectedTime} (IST)
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground font-medium">
              <Video className="h-4 w-4 text-primary" />
              Google Meet / Zoom
            </div>
          </div>
          <Button className="mt-10 w-full h-12 rounded-xl" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Consultation
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Schedule a Discovery Call
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Book a free 30-minute consultation with our experts to discuss your project requirements and how we can help.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar / Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Discovery Call</h3>
                  <p className="text-sm text-muted-foreground">30 min • Video Call</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <p>Project requirements analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <p>Technical feasibility discussion</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <p>Timeline and budget estimation</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Globe className="h-4 w-4 text-primary" />
                  India Standard Time (GMT+5:30)
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-primary/5 p-6 border-primary/20">
              <h4 className="font-bold text-primary mb-2">Need a faster response?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Call us directly or send an email for urgent inquiries.
              </p>
              <div className="space-y-3">
                <a href="tel:+918122575337" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  +91 8122575337
                </a>
                <a href="mailto:info@asrivotech.com" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  info@asrivotech.com
                </a>
              </div>
            </div>
          </div>

          {/* Main Content / Scheduler */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-border bg-background shadow-xl overflow-hidden min-h-[600px] flex flex-col">
              {/* Progress Bar */}
              <div className="h-1 bg-muted w-full">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out" 
                  style={{ width: `${step === 1 ? '50%' : '100%'}` }}
                />
              </div>

              <div className="p-8 flex-grow">
                {step === 1 ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-foreground">Select Date & Time</h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                      <div>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-xl border border-border shadow-sm p-4"
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Available Time Slots</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={cn(
                                "h-12 rounded-xl border text-sm font-medium transition-all",
                                selectedTime === slot
                                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        {selectedTime && (
                          <div className="pt-4 animate-in fade-in zoom-in duration-300">
                            <Button 
                              className="w-full h-14 rounded-2xl text-lg font-bold group"
                              onClick={handleNextStep}
                            >
                              Next Step
                              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <button 
                      onClick={handleBackStep}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Date Selection
                    </button>

                    <h2 className="text-2xl font-bold text-foreground mb-8">Enter Your Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" name="fullName" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input id="company" name="company" placeholder="Asrivo Tech" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brief">Brief Project Description</Label>
                        <Textarea 
                          id="brief" 
                          name="brief"
                          placeholder="Tell us a bit about what you're looking to build..." 
                          rows={4} 
                          required 
                        />
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 mb-8">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <CalendarIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {date ? format(date, "PPPP") : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              at {selectedTime} (India Standard Time)
                            </p>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full h-14 rounded-2xl text-lg font-bold" 
                          disabled={loading}
                        >
                          {loading ? "Confirming..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
