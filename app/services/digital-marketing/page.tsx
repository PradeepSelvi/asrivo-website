import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Search, Target, TrendingUp, Users, BarChart3, Megaphone, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Digital Marketing Services - Asrivo Tech',
  description: 'Result-driven digital marketing solutions to enhance brand visibility, generate quality leads, and accelerate business growth through SEO, SEM, social media marketing, and performance marketing.',
}

export default function DigitalMarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/services" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Digital Marketing Services
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Delivering result-driven digital marketing solutions to enhance brand visibility, 
              generate quality leads, and accelerate business growth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/services/inquiry">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Services */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Key Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital marketing solutions tailored to your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* SEO & SEM */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Search Engine Optimization (SEO) & Search Engine Marketing (SEM)
              </h3>
              <p className="text-muted-foreground mb-4">
                Improve search rankings and drive targeted website traffic through comprehensive SEO strategies and paid search campaigns.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">On-page and technical SEO optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Keyword research and content strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Google Ads campaign management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Local SEO and maps optimization</span>
                </li>
              </ul>
            </div>

            {/* Social Media Marketing */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Social Media Marketing & Paid Advertising
              </h3>
              <p className="text-muted-foreground mb-4">
                Manage Meta, Instagram, LinkedIn, and Google Ads campaigns to increase engagement and conversions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Social media strategy and content planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Meta (Facebook) and Instagram Ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">LinkedIn B2B marketing campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Community management and engagement</span>
                </li>
              </ul>
            </div>

            {/* Branding & Content */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Branding & Content Marketing
              </h3>
              <p className="text-muted-foreground mb-4">
                Build a strong brand identity through creative content, graphics, and marketing campaigns.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Brand strategy and positioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Content creation (blogs, videos, infographics)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Graphic design and visual identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Email marketing campaigns</span>
                </li>
              </ul>
            </div>

            {/* Lead Generation */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Lead Generation & Performance Marketing
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate qualified leads and maximize return on investment (ROI) through data-driven marketing strategies.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Conversion rate optimization (CRO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Landing page design and A/B testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Marketing analytics and reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">ROI tracking and optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Digital Marketing Services?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with experts who deliver measurable results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Data-Driven Strategies</h3>
              <p className="text-muted-foreground text-sm">
                Every campaign is backed by analytics and insights to ensure maximum ROI and continuous improvement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Measurable Results</h3>
              <p className="text-muted-foreground text-sm">
                Transparent reporting with clear metrics showing traffic, leads, conversions, and revenue growth.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Expert Team</h3>
              <p className="text-muted-foreground text-sm">
                Experienced marketers with expertise in SEO, SEM, social media, and performance marketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Let's create a customized digital marketing strategy that delivers results for your business.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/services/inquiry">
                <Sparkles className="w-5 h-5 mr-2" />
                Request a Consultation
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
