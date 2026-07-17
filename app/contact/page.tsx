"use client" 

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  CheckCircle
} from "lucide-react"
import { loadRecaptchaScript, executeRecaptcha } from "@/lib/utils/captcha"

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Address",
    content: "123 Tech Park, Silicon Valley\nSan Francisco, CA 94102, USA",
    link: "https://maps.google.com",
  },
  {
    icon: Phone,
    title: "Phone Number",
    content: "+1 (234) 567-890",
    link: "tel:+1234567890",
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

  // Load reCAPTCHA script on mount
  useEffect(() => {
    loadRecaptchaScript()
  }, [])

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

              {/* Map Placeholder */}
              <div className="mt-8">
                <h3 className="font-semibold text-foreground mb-4">Our Location</h3>
                <div className="aspect-video rounded-xl border border-border bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary/30 mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      123 Tech Park, Silicon Valley<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
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
