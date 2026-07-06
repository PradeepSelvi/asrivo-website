'use client'

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
          <div className="mb-12 animate-fadeIn">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-white/60">Last updated: March 16, 2026</p>
          </div>

          <div className="space-y-12">
            {[
              {
                title: '1. Introduction',
                content: 'Asrivo Tech ("we", "our", or "us") operates the asrivotech.com website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.',
              },
              {
                title: '2. Information Collection and Use',
                content: 'We collect several types of information for various purposes to provide and improve our Service to you.',
                subsections: [
                  {
                    subtitle: 'Types of Data Collected:',
                    items: [
                      'Personal Data: Email address, name, phone number, when you contact us',
                      'Usage Data: Browser type, IP address, pages visited, time and date of visit',
                      'Cookies: Small files stored on your device for functionality and analytics',
                    ],
                  },
                ],
              },
              {
                title: '3. Use of Data',
                content: 'Asrivo Tech uses the collected data for various purposes:',
                subsections: [
                  {
                    items: [
                      'To provide and maintain our Service',
                      'To notify you about changes to our Service',
                      'To allow you to participate in interactive features',
                      'To provide customer support and respond to inquiries',
                      'To gather analysis or valuable information to improve our Service',
                      'To monitor the usage of our Service',
                      'To detect, prevent and address technical issues',
                    ],
                  },
                ],
              },
              {
                title: '4. Security of Data',
                content: 'The security of your data is important to us but remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.',
              },
              {
                title: '5. Changes to This Privacy Policy',
                content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.',
              },
              {
                title: '6. Contact Us',
                content: 'If you have any questions about this Privacy Policy, please contact us at:',
                subsections: [
                  {
                    items: [
                      'Email: privacy@asrivotech.com',
                      'Website: www.asrivotech.com',
                    ],
                  },
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="space-y-4 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                <p className="text-white/70 leading-relaxed">{section.content}</p>
                {section.subsections && (
                  <div className="space-y-4 pl-6 border-l border-white/20">
                    {section.subsections.map((sub, subIdx) => (
                      <div key={subIdx} className="space-y-3">
                        {(sub as any).subtitle && (
                          <h3 className="font-semibold text-white/90">{(sub as any).subtitle}</h3>
                        )}
                        {sub.items && (
                          <ul className="space-y-2">
                            {sub.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-white/70 flex gap-3">
                                <span className="text-primary mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
