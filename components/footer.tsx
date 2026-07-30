'use client'

import Link from "next/link"
import { Linkedin, Github, Mail, MapPin, Phone, Instagram, Twitter } from "lucide-react"
import { useEffect, useState } from "react"

const navigation = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
  ],
  services: [
    { name: "Software Development", href: "/services#software" },
    { name: "Web Applications", href: "/services#web" },
    { name: "Mobile Applications", href: "/services#mobile" },
    { name: "Cloud & DevOps", href: "/services#cloud" },
    { name: "AI & Automation", href: "/services#ai" },
    { name: "Digital Marketing", href: "/services/digital-marketing" },
    { name: "IT Consulting", href: "/services#consulting" },
  ],
  resources: [
    { name: "Projects", href: "/projects" },
    { name: "Case Studies", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
}

// Default settings
const defaultSettings = {
  site_name: 'Asrivo Tech',
  site_tagline: "TURNING IDEAS INTO INTELLIGENT SOLUTIONS",
  contact_email: 'info@asrivotech.com',
  contact_phone: '+91 8122575337',
  contact_address: 'Madurai, Tamil Nadu, India',
  social_linkedin: 'https://linkedin.com/company/asrivotech',
  social_github: 'https://github.com/asrivotech',
  social_instagram: 'https://instagram.com/asrivotech',
  social_twitter: 'https://twitter.com/asrivotech',
}

export function Footer() {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    // Fetch settings from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }))
        }
      })
      .catch(err => console.error('Error loading settings:', err))
  }, [])
  
  const social = [
    { name: "LinkedIn", href: settings.social_linkedin, icon: Linkedin },
    { name: "GitHub", href: settings.social_github, icon: Github },
    { name: "Instagram", href: settings.social_instagram, icon: Instagram },
    { name: "Twitter", href: settings.social_twitter, icon: Twitter },
    { name: "Email", href: `mailto:${settings.contact_email}`, icon: Mail },
  ].filter(item => item.href) // Only show links that are configured
  return (
    <>
      <footer className="border-t border-white/10 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 group">
                <img 
                  src="/asrivo.png" 
                  alt="Asrivo Tech Logo" 
                  className="shrink-0 h-16 w-16 transition-transform group-hover:scale-110"
                />
                
                <span className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Asrivo<span className="font-light">Tech</span>
                </span>
              </Link>
              
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                {settings.site_tagline || 'TURNING IDEAS INTO INTELLIGENT SOLUTIONS'}
              </p>

              <div className="mt-6 flex gap-4">
                {social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 transition-all hover:bg-[#00AEEF] hover:text-white hover:border-[#00AEEF]"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Navigation Columns */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Company</h3>
              <ul className="mt-4 space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-[#00AEEF]">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Services</h3>
              <ul className="mt-4 space-y-3">
                {navigation.services.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-[#00AEEF]">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#00AEEF] mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-400">
                    {settings.contact_address}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#00AEEF] shrink-0" />
                  <a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`} className="text-sm text-zinc-400 hover:text-[#00AEEF]">
                    {settings.contact_phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#00AEEF] shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="text-sm text-zinc-400 hover:text-[#00AEEF]">
                    {settings.contact_email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-zinc-500" suppressHydrationWarning>
                &copy; {new Date().getFullYear()} {settings.site_name}. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-[#00AEEF]">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-[#00AEEF]">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}