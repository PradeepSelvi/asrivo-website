import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Handshake, CheckCircle2, FileCheck, Users, Shield } from "lucide-react"
import { MobileBackButton } from "@/components/mobile-back-button"

export const metadata: Metadata = {
  title: "Partnership Policy - Asrivo Tech",
  description: "Learn about our partnership opportunities, policies, and collaboration frameworks at Asrivo Tech.",
}

export default function PartnershipPolicyPage() {
  return (
    <div className="flex flex-col">
      <MobileBackButton />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Handshake className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Partnership Policy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Building successful partnerships through transparency, mutual growth, and shared values.
            </p>
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              <strong>Effective Date:</strong> January 1, 2026<br />
              <strong>Last Updated:</strong> July 21, 2026
            </p>

            {/* Introduction */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground m-0">1. Partnership Overview</h2>
              </div>
              <p className="text-muted-foreground">
                Asrivo Tech ("we," "our," or "the Company") welcomes partnerships with organizations, businesses, 
                educational institutions, and technology providers that align with our mission to deliver innovative 
                technology solutions. This Partnership Policy outlines the terms, expectations, and frameworks governing 
                all partnership relationships.
              </p>
            </div>

            {/* Types of Partnerships */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <Handshake className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground m-0">2. Types of Partnerships</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mt-8">2.1 Technology Partners</h3>
              <p className="text-muted-foreground">
                Collaboration with technology vendors, cloud service providers, and software companies to integrate, 
                resell, or co-develop technology solutions.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Cloud infrastructure providers (AWS, Azure, GCP)</li>
                <li>Software platform vendors</li>
                <li>API and integration service providers</li>
                <li>Development tool and framework partners</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">2.2 Strategic Business Partners</h3>
              <p className="text-muted-foreground">
                Partnerships with organizations for joint ventures, co-marketing initiatives, and business development opportunities.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Referral and reseller partnerships</li>
                <li>Co-marketing and joint promotional campaigns</li>
                <li>Solution integration partnerships</li>
                <li>Industry-specific strategic alliances</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">2.3 Academic & Research Partners</h3>
              <p className="text-muted-foreground">
                Collaborations with educational institutions for research, talent development, and knowledge exchange.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>University research collaborations</li>
                <li>Internship and training programs</li>
                <li>Joint research and development initiatives</li>
                <li>Academic sponsorships and grants</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">2.4 Community & Non-Profit Partners</h3>
              <p className="text-muted-foreground">
                Partnerships focused on social impact, community development, and pro-bono technology services.
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Non-profit technology support</li>
                <li>Community development initiatives</li>
                <li>Open-source project collaborations</li>
                <li>Social impact programs</li>
              </ul>
            </div>

            {/* Partnership Requirements */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground m-0">3. Partnership Requirements</h2>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-8">3.1 Eligibility Criteria</h3>
              <p className="text-muted-foreground">To qualify for partnership with Asrivo Tech, organizations must:</p>
              <ul className="text-muted-foreground space-y-2">
                <li>Demonstrate alignment with our values and business ethics</li>
                <li>Maintain a reputable business standing and positive market reputation</li>
                <li>Possess relevant expertise, resources, or capabilities that complement our offerings</li>
                <li>Commit to confidentiality and data protection standards</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">3.2 Application Process</h3>
              <ol className="text-muted-foreground space-y-2">
                <li><strong>Inquiry Submission:</strong> Submit a partnership inquiry through our website or contact form</li>
                <li><strong>Initial Review:</strong> Our partnership team reviews the proposal within 7-10 business days</li>
                <li><strong>Evaluation:</strong> Qualified partnerships undergo detailed evaluation and due diligence</li>
                <li><strong>Agreement:</strong> Successful applicants receive a partnership agreement outlining terms and conditions</li>
                <li><strong>Onboarding:</strong> Partners complete onboarding process including documentation and training</li>
              </ol>
            </div>

            {/* Partner Obligations */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground m-0">4. Partner Obligations</h2>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-8">4.1 Confidentiality</h3>
              <p className="text-muted-foreground">
                Partners must maintain strict confidentiality regarding proprietary information, trade secrets, client data, 
                and business strategies shared during the partnership. Non-disclosure agreements (NDAs) are mandatory for all partnerships.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-8">4.2 Brand Usage</h3>
              <p className="text-muted-foreground">
                Partners may use Asrivo Tech branding and marketing materials only with prior written approval. 
                All usage must comply with our brand guidelines and may not:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Misrepresent the nature or scope of the partnership</li>
                <li>Imply endorsement beyond the agreed partnership scope</li>
                <li>Modify or distort our logo, brand colors, or messaging</li>
                <li>Use our brand in a manner that could damage our reputation</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">4.3 Quality Standards</h3>
              <p className="text-muted-foreground">
                Partners are expected to maintain high standards of quality, professionalism, and ethical conduct in all 
                activities related to the partnership. This includes:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Delivering services consistent with industry best practices</li>
                <li>Maintaining appropriate certifications and qualifications</li>
                <li>Providing accurate and truthful information</li>
                <li>Responding promptly to partnership-related communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">4.4 Compliance</h3>
              <p className="text-muted-foreground">Partners must comply with:</p>
              <ul className="text-muted-foreground space-y-2">
                <li>All applicable local, national, and international laws</li>
                <li>Industry-specific regulations and standards</li>
                <li>Data protection and privacy laws (GDPR, CCPA, etc.)</li>
                <li>Anti-corruption and anti-bribery regulations</li>
                <li>Intellectual property rights and licensing requirements</li>
              </ul>
            </div>

            {/* Benefits and Support */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground m-0">5. Partnership Benefits</h2>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-8">5.1 What Partners Receive</h3>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Technical Support:</strong> Access to technical documentation, APIs, and development resources</li>
                <li><strong>Marketing Support:</strong> Co-marketing opportunities and promotional materials</li>
                <li><strong>Training:</strong> Partner training programs and certification opportunities</li>
                <li><strong>Lead Sharing:</strong> Qualified referrals and business opportunities (where applicable)</li>
                <li><strong>Partner Portal:</strong> Access to dedicated partner resources and collaboration tools</li>
                <li><strong>Recognition:</strong> Visibility on our website and partner directory</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">5.2 Revenue Sharing (Where Applicable)</h3>
              <p className="text-muted-foreground">
                For applicable partnership types, revenue sharing arrangements will be detailed in individual partnership 
                agreements based on:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Partnership tier and level of engagement</li>
                <li>Volume of business generated</li>
                <li>Value added to the partnership</li>
                <li>Market conditions and competitive landscape</li>
              </ul>
            </div>

            {/* Terms and Termination */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">6. Partnership Terms and Termination</h2>

              <h3 className="text-xl font-semibold text-foreground mt-8">6.1 Duration</h3>
              <p className="text-muted-foreground">
                Partnership agreements are typically established for an initial term of one (1) year, with automatic 
                renewal unless either party provides written notice of non-renewal at least 60 days before expiration.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-8">6.2 Termination</h3>
              <p className="text-muted-foreground">Either party may terminate the partnership:</p>
              <ul className="text-muted-foreground space-y-2">
                <li>For convenience with 90 days written notice</li>
                <li>Immediately for cause (breach of agreement, legal violations, reputation damage)</li>
                <li>Upon mutual written agreement</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-8">6.3 Post-Termination</h3>
              <p className="text-muted-foreground">Upon termination, partners must:</p>
              <ul className="text-muted-foreground space-y-2">
                <li>Cease use of all Asrivo Tech branding and materials</li>
                <li>Return or destroy all confidential information</li>
                <li>Complete any outstanding obligations or projects</li>
                <li>Remove references to the partnership from marketing materials</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All intellectual property rights remain with their respective owners. Partners may not claim ownership 
                of Asrivo Tech's intellectual property, and Asrivo Tech does not claim ownership of partners' intellectual property.
              </p>
              <p className="text-muted-foreground">
                For joint development projects, intellectual property ownership will be defined in separate agreements 
                prior to project commencement.
              </p>
            </div>

            {/* Dispute Resolution */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">8. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                In the event of disputes arising from partnership activities, parties agree to:
              </p>
              <ol className="text-muted-foreground space-y-2">
                <li>First attempt resolution through good faith negotiation</li>
                <li>If unresolved, pursue mediation with a mutually agreed mediator</li>
                <li>If mediation fails, disputes will be resolved through binding arbitration</li>
              </ol>
            </div>

            {/* Liability and Indemnification */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">9. Liability and Indemnification</h2>
              <p className="text-muted-foreground">
                Partners agree to indemnify and hold Asrivo Tech harmless from any claims, damages, or liabilities 
                arising from:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>Partner's breach of this policy or partnership agreement</li>
                <li>Partner's violation of applicable laws or regulations</li>
                <li>Partner's negligence or willful misconduct</li>
                <li>Third-party claims related to partner's actions or omissions</li>
              </ul>
            </div>

            {/* Policy Updates */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">10. Policy Updates</h2>
              <p className="text-muted-foreground">
                Asrivo Tech reserves the right to update this Partnership Policy at any time. Partners will be notified 
                of significant changes via email and will have 30 days to review and accept the updated terms. 
                Continued participation in the partnership program constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
              <p className="text-muted-foreground mt-4">
                For partnership inquiries, questions about this policy, or to discuss partnership opportunities:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> <a href="mailto:partnerships@asrivotech.com" className="text-primary hover:underline">partnerships@asrivotech.com</a></p>
                <p><strong>Business Email:</strong> <a href="mailto:info@asrivotech.com" className="text-primary hover:underline">info@asrivotech.com</a></p>
                <p><strong>Phone:</strong> +91 81252 75337</p>
                <p><strong>Address:</strong> Asrivo Tech, Tamil Nadu, India</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground italic">
                By entering into a partnership with Asrivo Tech, you acknowledge that you have read, understood, 
                and agree to be bound by this Partnership Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Partner with Us?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Let's explore how we can work together to create innovative solutions and drive mutual growth.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  Get in Touch
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/services/inquiry">
                  Submit Partnership Inquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
