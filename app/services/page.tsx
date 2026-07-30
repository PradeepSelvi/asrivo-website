import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { InquiryStatusChecker } from "@/components/inquiry-status-checker"
import { MobileBackButton } from "@/components/mobile-back-button"
import { 
  FileCode2, 
  Globe, 
  Smartphone, 
  Cloud, 
  Bot, 
  Users,
  Database,
  Shield,
  Cpu,
  LayoutGrid,
  ArrowRight,
  Search,
  Paintbrush,
  Cog,
  TestTube,
  Rocket,
  HeartHandshake,
  CheckCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Services - Asrivo Tech",
  description: "Explore our comprehensive technology services including software development, web & mobile apps, cloud solutions, AI & automation, and IT consulting.",
}

const services = [
  {
    id: "software",
    icon: FileCode2,
    title: "Custom Software Development",
    image: "/services/software-development.webp",
    description: "We build tailored software solutions that address your unique business challenges. Our team delivers robust, scalable applications designed to streamline operations and drive growth with your specific needs in mind.",
    features: [
      "Enterprise Application development",
      "Modern System architecture design",
      "API development and integration",
      "Database design and optimization",
    ],
  },
  {
    id: "web",
    icon: Globe,
    title: "Web Application Development",
    image: "/services/web-development.webp",
    description: "Modern, responsive web applications that deliver exceptional user experiences across all devices. We use the latest technologies to build fast, secure, and scalable web solutions.",
    features: [
      "Progressive Web Apps (PWA)",
      "Single Page Applications (SPA)",
      "E-commerce platforms",
      "Content Management Systems",
    ],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Application Development",
    image: "/services/mobile-development.webp",
    description: "Native and cross-platform mobile applications for iOS and Android. We create intuitive, high-performance apps that engage users and drive business results.",
    features: [
      "iOS and Android native apps",
      "Cross-platform development (React Native, Flutter)",
      "Mobile UI/UX design",
      "App store optimization",
    ],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & DevOps Solutions",
    image: "/services/cloud-devops.webp",
    description: "Scalable cloud infrastructure and automated deployment pipelines. We help you leverage the full potential of cloud computing for efficiency and cost savings.",
    features: [
      "Cloud migration and strategy",
      "Infrastructure as Code (IaC)",
      "CI/CD pipeline implementation",
      "Kubernetes and container orchestration",
    ],
  },
  {
    id: "ai",
    icon: Bot,
    title: "Web -Hosting",
    image: "/services/web-hosting.webp",
    description: "Intelligent automation solutions powered by machine learning and artificial intelligence. Transform your business processes with smart, data-driven systems.",
    features: [
      "Machine learning model development",
      "Natural language processing",
      "Process automation (RPA)",
      "Predictive analytics",
    ],
  },
  {
    id: "consulting",
    icon: Users,
    title: "Enterprise IT Consulting",
    image: "/services/enterprise-consulting.webp",
    description: "Strategic technology consulting to guide your digital transformation journey. Our experts help you make informed decisions and optimize your IT investments.",
    features: [
      "Digital transformation strategy",
      "Technology roadmap planning",
      "IT architecture assessment",
      "Vendor selection and management",
    ],
  },
  {
    id: "digital-marketing",
    icon: Database,
    title: "Digital Marketing",
    image: "/services/digital-marketing.webp",
    description: "Delivering result-driven digital marketing solutions to enhance brand visibility, generate quality leads, and accelerate business growth.",
    features: [
      "Search Engine Optimization (SEO) & Search Engine Marketing (SEM)",
      "Social Media Marketing & Paid Advertising (Meta, Instagram, LinkedIn, Google Ads)",
      "Branding & Content Marketing",
      "Lead Generation & Performance Marketing",
    ],
  },
  /*
  {
    id: "security",
    icon: Shield,
    title: "Cybersecurity Services",
    description: "Protect your business with our comprehensive cybersecurity solutions. We implement robust security measures to safeguard your digital assets and data.",
    features: [
      "Security audits and assessments",
      "Penetration testing",
      "Security architecture design",
      "Compliance management",
    ],
  },
  */
  {
    id: "product",
    icon: Cpu,
    title: "Product Engineering",
    image: "/services/product-engineering.webp",
    description: "End-to-end product development from concept to launch. We help startups and enterprises build innovative digital products that succeed in the market.",
    features: [
      "Product strategy and roadmapping",
      "MVP development",
      "Product scaling and optimization",
      "Technical due diligence",
    ],
  },
  /*
  {
    id: "ux",
    icon: LayoutGrid,
    title: "UI/UX Design Services",
    description: "Create exceptional user experiences with our design services. We combine aesthetics with usability to build interfaces that users love.",
    features: [
      "User research and testing",
      "Wireframing and prototyping",
      "Visual design and branding",
      "Design system development",
    ],
  },
  */
]

const process = [
  {
    icon: Search,
    title: "Requirement Analysis",
    description: "We begin by understanding your business goals, challenges, and requirements through detailed discovery sessions.",
  },
  {
    icon: Paintbrush,
    title: "Design",
    description: "Our designers create intuitive interfaces and user experiences that align with your brand and user needs.",
  },
  {
    icon: Cog,
    title: "Development",
    description: "Our engineers build your solution using modern technologies and best practices for quality and scalability.",
  },
  {
    icon: TestTube,
    title: "Testing",
    description: "Rigorous testing ensures your product is bug-free, secure, and performs optimally under all conditions.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "We handle the deployment process, ensuring a smooth launch with minimal disruption to your operations.",
  },
  {
    icon: HeartHandshake,
    title: "Support",
    description: "Our relationship doesn't end at launch. We provide ongoing support and maintenance to ensure continued success.",
  },
]

export default function ServicesPage() {
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
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Our Services
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Comprehensive Technology Solutions
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              From concept to deployment and beyond, we offer end-to-end services to transform 
              your ideas into powerful digital solutions that drive business success.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 grid gap-8 lg:grid-cols-2 lg:gap-16 items-center ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8" asChild>
                    <Link href="/services/inquiry">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="relative">
                  {service.image ? (
                    <div className="aspect-video rounded-xl overflow-hidden border border-border relative">
                      <Image
                        src={service.image}
                        alt={`${service.title} Services at AsrivoTech`}
                        fill
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-border">
                      <service.icon className="h-24 w-24 text-primary/20" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Our Process
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How We Work
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our proven methodology ensures successful delivery of each and every project.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-border bg-background p-8 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mt-2">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Check Status Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Track Your Request
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Check Inquiry Status
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Enter your email to track the status of your service inquiry
            </p>
          </div>

          <InquiryStatusChecker />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
              Ready to Start Your Project?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Let&apos;s discuss how we can help you achieve your Product goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                asChild
              >
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" 
                asChild
              >
                <Link href="/projects">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
