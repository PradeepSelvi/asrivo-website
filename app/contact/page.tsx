"use client" 

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Linkedin,
  Github,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { loadRecaptchaScript, executeRecaptcha } from "@/lib/utils/captcha"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dynamically import LocationMap with SSR disabled
const LocationMap = dynamic(() => import("@/components/location-map").then(mod => mod.LocationMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-primary/30 mx-auto animate-pulse" />
        <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Address",
    content: "Madurai, Tamil Nadu, India",
    link: "https://maps.google.com/?q=Madurai,Tamil+Nadu,India",
  },
  {
    icon: Phone,
    title: "Phone Number",
    content: "+91 8122575337",
    link: "tel:+918122575337",
  },
  {
    icon: Mail,
    title: "Email Address",
    content: "info@asrivotech.com",
    link: "mailto:info@asrivotech.com",
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: "Monday - Saturday \n9:00 AM - 6:00 PM IST",
  },
]

const social = [
  { name: "LinkedIn", href: "https://linkedin.com/company/asrivotech", icon: Linkedin },
  { name: "GitHub", href: "https://github.com/asrivotech", icon: Github },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messageType, setMessageType] = useState('contact')
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusEmail, setStatusEmail] = useState('')
  const [complaints, setComplaints] = useState<any[]>([])
  const [showStatus, setShowStatus] = useState(false)

  // Load reCAPTCHA script on mount
  useEffect(() => {
    loadRecaptchaScript()
  }, [])

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!statusEmail) {
      alert('Please enter your email address')
      return
    }

    setCheckingStatus(true)
    setShowStatus(false)

    try {
      const response = await fetch(`/api/complaints/status?email=${encodeURIComponent(statusEmail)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch complaints')
      }

      setComplaints(result.data || [])
      setShowStatus(true)
    } catch (error) {
      console.error('Error checking status:', error)
      alert(error instanceof Error ? error.message : 'Failed to check status')
    } finally {
      setCheckingStatus(false)
    }
  }

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData(e.currentTarget);

  const data = {
    name: `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`,
    email: formData.get('email')?.toString(),
    company: formData.get('company')?.toString() || null,
    subject: formData.get('subject')?.toString(),
    message: formData.get('message')?.toString(),
    type: messageType, // Add message type
  };

  try {
    // Execute reCAPTCHA
    const captchaToken = await executeRecaptcha('contact_form')

    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        captchaToken,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error from server:', result);
      throw new Error(result.error || 'Failed to send message');
    }

    console.log('Success:', result);
    setSubmitted(true);

  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Contact Us
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Have a project in mind or want to learn more about our services? 
              We&apos;d love to hear from you. Reach out and let&apos;s start a conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">Send Us a Message</h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-border bg-muted/30 p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">Message Sent!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Thank you for reaching out. We&apos;ll get back to you shortly.
                  </p>
                  <Button className="mt-6" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="yourgmail@gmail.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Your Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messageType">Message Type</Label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="query">Query</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Raise a Complaint Section */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Raise a Complaint</h3>
                </div>
                
                <p className="text-white/90 mb-6 leading-relaxed">
                  Clients, partners, and users can file complaints or concerns and track their status. 
                  No login required - just fill out the form with your details.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm">
                      <strong className="text-white">Clients</strong> → about service delivery or project issues
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm">
                      <strong className="text-white">Partners</strong> → regarding partnership agreements or collaboration
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm">
                      <strong className="text-white">Users</strong> → about website functionality or technical issues
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm">
                      <strong className="text-white">Anyone</strong> → about billing, support, or general concerns
                    </p>
                  </div>
                </div>

                <Button 
                  asChild
                  size="lg"
                  className="w-full bg-white text-blue-900 hover:bg-white/90 font-semibold shadow-lg"
                >
                  <Link href="/complaints/new" className="flex items-center justify-center gap-2">
                    Raise a Complaint
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Check Complaint Status Section */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Check Complaint Status</h3>
                </div>
                
                <p className="text-white/80 mb-6 text-sm">
                  Enter your email to check the status of all your submitted complaints. 
                  Real-time updates from our admin team.
                </p>

                <form onSubmit={handleCheckStatus} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={statusEmail}
                      onChange={(e) => setStatusEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-white/20 text-white hover:bg-white/30 font-semibold backdrop-blur-sm border border-white/30"
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? (
                      "Checking..."
                    ) : (
                      <>
                        Check Status
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Status Results */}
                {showStatus && (
                  <div className="mt-6 space-y-3">
                    {complaints.length === 0 ? (
                      <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center backdrop-blur-sm">
                        <AlertCircle className="w-10 h-10 text-white/60 mx-auto mb-2" />
                        <p className="text-white/80 text-sm">
                          No complaints found for this email address.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-white/90 text-sm font-medium mb-3">
                          Found {complaints.length} complaint{complaints.length > 1 ? 's' : ''}:
                        </p>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                          {complaints.map((complaint) => (
                            <div 
                              key={complaint.id}
                              className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm hover:bg-white/15 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-semibold text-white text-sm line-clamp-1">
                                  {complaint.subject}
                                </h4>
                                <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  complaint.status === 'new' ? 'bg-red-500/30 text-red-200 border border-red-400/30' :
                                  complaint.status === 'in_progress' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/30' :
                                  complaint.status === 'resolved' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
                                  'bg-slate-500/30 text-slate-200 border border-slate-400/30'
                                }`}>
                                  {complaint.status.replace('_', ' ')}
                                </span>
                              </div>
                              
                              <p className="text-white/70 text-xs line-clamp-2 mb-3">
                                {complaint.description}
                              </p>

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4 text-white/60">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                    complaint.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                                    complaint.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                    complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {complaint.priority}
                                  </span>
                                  <span>
                                    {new Date(complaint.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {complaint.category && (
                                  <span className="text-white/50">
                                    {complaint.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
              <p className="mt-2 text-muted-foreground">
                You can also reach us through any of the following channels.
              </p>

              <div className="mt-8 space-y-6">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.link.startsWith("http") ? "_blank" : undefined}
                          rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="mt-1 text-muted-foreground hover:text-primary whitespace-pre-line"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="mt-1 text-muted-foreground whitespace-pre-line">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground">Follow Us</h3>
                <div className="mt-4 flex gap-4">
                  {social.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <span className="sr-only">{item.name}</span>
                      <item.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">Our Location</h3>
                <div className="h-[400px] rounded-xl border border-border bg-muted/30 overflow-hidden">
                  <LocationMap
                    latitude={9.9252}
                    longitude={78.1198}
                    address="Madurai, Tamil Nadu, India"
                    zoom={13}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Ready to Start Your Project?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Schedule a free consultation call with our team to discuss your requirements.
            </p>
            <Button 
              size="lg" 
              className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link href="/schedule">Schedule a Call</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
