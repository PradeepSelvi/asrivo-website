import { Metadata } from 'next'
import { MobileBackButton } from '@/components/mobile-back-button'

export const metadata: Metadata = {
  title: 'Privacy Policy | Asrivo Tech',
  description: 'Privacy Policy for Asrivo Tech website and services',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <MobileBackButton />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Asrivo Tech ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Fill out contact forms</li>
              <li>Subscribe to our newsletter</li>
              <li>Submit job applications</li>
              <li>Request services or information</li>
              <li>Interact with our website</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Personal information may include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company name</li>
              <li>Job title</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground mb-4">
              When you visit our website, we automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referral URLs</li>
              <li>Pages visited and time spent</li>
              <li>Device information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Process job applications</li>
              <li>Improve our website and services</li>
              <li>Analyze usage patterns and trends</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Remember your preferences</li>
              <li>Analyze website traffic and usage</li>
              <li>Improve user experience</li>
              <li>Provide secure authentication (for admin users)</li>
            </ul>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our website and provide services (e.g., hosting, analytics, email services)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-muted-foreground">
              Our service providers are contractually obligated to protect your information and use it only for specified purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Encrypted database storage</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Withdraw Consent:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise these rights, please contact us at privacy@asrivotech.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. Contact form submissions and inquiries are typically retained for 2 years.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Third-Party Links</h2>
            <p className="text-muted-foreground">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-foreground"><strong>Asrivo Tech</strong></p>
              <p className="text-muted-foreground">Email: privacy@asrivotech.com</p>
              <p className="text-muted-foreground">Email (General): contact@asrivotech.com</p>
              <p className="text-muted-foreground mt-2">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

          <section className="mb-8 bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-foreground mb-4">GDPR Compliance (EU Residents)</h2>
            <p className="text-muted-foreground mb-4">
              If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to be informed about data collection and use</li>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Rights related to automated decision-making</li>
            </ul>
          </section>

          <section className="mb-8 bg-muted p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-foreground mb-4">CCPA Compliance (California Residents)</h2>
            <p className="text-muted-foreground mb-4">
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of the sale of personal information</li>
              <li>Right to deletion of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong>Note:</strong> We do not sell personal information.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
