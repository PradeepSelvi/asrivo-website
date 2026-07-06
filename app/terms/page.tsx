'use client'

import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-white/60">Last updated: March 16, 2026</p>
          </div>

          <div className="space-y-12">
            {[
              {
                title: '1. Agreement to Terms',
                content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
              },
              {
                title: '2. License to Use Website',
                content: 'Asrivo Tech grants you a limited, non-exclusive, revocable license to make personal use of this website. You may not systematically retrieve data or information from this website to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from Asrivo Tech.',
              },
              {
                title: '3. Disclaimer of Warranties',
                content: 'This website and the materials contained herein are provided on an "as is" basis. Asrivo Tech makes no warranties, expressed or implied, including but not limited to, warranties of merchantability and fitness for a particular purpose. Asrivo Tech does not warrant that the functions contained in the materials will be uninterrupted or error-free, that defects will be corrected, or that this website or the server that makes it available are free of viruses or other harmful components.',
              },
              {
                title: '4. Limitation of Liability',
                content: 'In no event shall Asrivo Tech, its suppliers, or any contributors be liable for any damages (including, without limitation, lost profits, lost data, or business interruption) arising out of the use or inability to use the materials on Asrivo Tech\'s website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.',
              },
              {
                title: '5. Accuracy of Materials',
                content: 'The materials appearing on Asrivo Tech\'s website could include technical, typographical, or photographic errors. Asrivo Tech does not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice.',
              },
              {
                title: '6. Links',
                content: 'Asrivo Tech has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Asrivo Tech of the site. We recommend that you make your own independent investigation before using any third-party services.',
              },
              {
                title: '7. Modifications',
                content: 'Asrivo Tech may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.',
              },
              {
                title: '8. Governing Law',
                content: 'These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Asrivo Tech operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
              },
              {
                title: '9. Prohibited Activities',
                content: 'You agree not to:',
                subsections: [
                  {
                    items: [
                      'Violate any applicable laws or regulations',
                      'Infringe on the intellectual property rights of others',
                      'Harass, abuse, or threaten others',
                      'Submit false, misleading, or inaccurate information',
                      'Attempt to gain unauthorized access to our systems',
                      'Transmit viruses, malware, or harmful code',
                      'Interfere with the operation of our website',
                    ],
                  },
                ],
              },
              {
                title: '10. Contact Information',
                content: 'If you have any questions about these Terms of Service, please contact us at:',
                subsections: [
                  {
                    items: [
                      'Email: legal@asrivotech.com',
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
