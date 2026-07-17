import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Asrivo Tech',
  description: 'Terms of Service for Asrivo Tech website and services',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the Asrivo Tech website and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Services</h2>
            <p className="text-muted-foreground mb-4">
              Asrivo Tech provides:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Software development services</li>
              <li>Web and mobile application development</li>
              <li>Technical consulting</li>
              <li>IT solutions and services</li>
              <li>Information about our company, team, and projects</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              When using our Services, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Use the Services lawfully and ethically</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not transmit malicious code or viruses</li>
              <li>Not spam, harass, or abuse other users or our team</li>
              <li>Respect intellectual property rights</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Intellectual Property Rights</h2>
            <p className="text-muted-foreground mb-4">
              All content on this website, including but not limited to text, graphics, logos, images, software, and code, is the property of Asrivo Tech or its licensors and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground">
              You may not copy, reproduce, distribute, modify, or create derivative works of any content without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Service Agreements</h2>
            <p className="text-muted-foreground mb-4">
              <strong>For Client Projects:</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              Specific terms for software development projects, consulting services, and other professional services will be outlined in separate service agreements or statements of work. These Terms serve as a general framework, but project-specific agreements will take precedence for contracted services.
            </p>
            <p className="text-muted-foreground">
              All service agreements must be signed by authorized representatives of both parties before work commences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Terms</h2>
            <p className="text-muted-foreground mb-4">
              For contracted services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Payment terms will be specified in the service agreement</li>
              <li>Invoices are typically due within 30 days of issuance</li>
              <li>Late payments may incur interest charges</li>
              <li>We reserve the right to suspend services for non-payment</li>
              <li>All fees are non-refundable unless otherwise stated</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Confidentiality</h2>
            <p className="text-muted-foreground mb-4">
              We respect the confidentiality of information shared with us. For client projects, confidentiality terms will be outlined in:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Non-Disclosure Agreements (NDAs)</li>
              <li>Service agreements</li>
              <li>Master service agreements</li>
            </ul>
            <p className="text-muted-foreground">
              We commit to protecting client confidential information and not disclosing it to third parties except as required by law or with client permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Warranties and Disclaimers</h2>
            <p className="text-muted-foreground mb-4">
              <strong>8.1 Website Disclaimer:</strong>
            </p>
            <p className="text-muted-foreground mb-4">
              This website and its content are provided "AS IS" without warranties of any kind, either express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>The website will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The website is free of viruses or harmful components</li>
              <li>Information provided is accurate or complete</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>8.2 Service Warranties:</strong>
            </p>
            <p className="text-muted-foreground">
              Warranties for contracted services will be specified in the applicable service agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the maximum extent permitted by law, Asrivo Tech shall not be liable for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from website use or inability to use</li>
              <li>Third-party actions or content</li>
            </ul>
            <p className="text-muted-foreground">
              Our total liability for any claims arising from these Terms or use of our Services shall not exceed the amount paid by you to us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Asrivo Tech, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Your use of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your violation of applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Terminate or suspend access to our Services at any time</li>
              <li>Refuse service to anyone for any reason</li>
              <li>Modify or discontinue Services without notice</li>
            </ul>
            <p className="text-muted-foreground">
              Upon termination, your right to use our Services ceases immediately. Provisions that should survive termination (including intellectual property rights, disclaimers, and limitations of liability) will remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>12.1 Dispute Resolution:</strong>
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>First, attempt to resolve disputes through good-faith negotiations</li>
              <li>If unresolved, disputes may be subject to mediation</li>
              <li>As a last resort, disputes will be resolved through arbitration or courts of [Your Jurisdiction]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Modifications to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting the updated Terms on this page with a new "Last updated" date. Your continued use of our Services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These Terms, together with our Privacy Policy and any service agreements, constitute the entire agreement between you and Asrivo Tech regarding use of our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">16. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-foreground"><strong>Asrivo Tech</strong></p>
              <p className="text-muted-foreground">Email: legal@asrivotech.com</p>
              <p className="text-muted-foreground">Email (General): contact@asrivotech.com</p>
              <p className="text-muted-foreground mt-2">
                We will respond to your inquiry within 7 business days.
              </p>
            </div>
          </section>

          <section className="mb-8 bg-muted p-6 rounded-lg">
            <p className="text-muted-foreground">
              <strong>Acknowledgment:</strong> By using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
