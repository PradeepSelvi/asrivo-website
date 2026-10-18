/**
 * Services configuration — Asrivo Tech
 * Single source of truth for all 9 services offered.
 * Confirmed by owner October 2026.
 */

export interface Service {
  id: string
  title: string
  slug: string
  description: string
  icon: string
  image: string
  features: string[]
  timeline: string
  price: string
  category: 'core' | 'extended'
  showOnHome: boolean
  hasDedicatedPage: boolean
}

export const SERVICES: Service[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    slug: 'web-development',
    description: 'Custom websites and web applications built with modern technologies — from landing pages to full-stack enterprise platforms.',
    icon: 'Code',
    image: '/services/web-development.webp',
    features: [
      'Custom web application development',
      'E-commerce platforms',
      'Progressive Web Apps (PWA)',
      'API development & integration',
    ],
    timeline: '4–9 weeks',
    price: 'As per consultation',
    category: 'core',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'mobile-development',
    title: 'Mobile App Development',
    slug: 'mobile-development',
    description: 'Native and cross-platform mobile applications for iOS and Android, built for performance and great user experience.',
    icon: 'Smartphone',
    image: '/services/mobile-development.webp',
    features: [
      'iOS & Android app development',
      'Cross-platform development (React Native, Flutter)',
      'Mobile UI/UX design',
      'App maintenance & updates',
    ],
    timeline: '5–12 weeks',
    price: 'As per consultation',
    category: 'core',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'custom-software',
    title: 'Custom Software Development',
    slug: 'custom-software',
    description: 'Tailor-made software solutions designed to solve your specific business challenges and automate your workflows.',
    icon: 'Layers',
    image: '/services/custom-software.webp',
    features: [
      'Business process automation',
      'Enterprise software development',
      'Legacy system modernization',
      'Third-party integrations',
    ],
    timeline: '5–12 weeks',
    price: 'As per consultation',
    category: 'core',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    description: 'User-centered design for exceptional digital experiences — from wireframes to production-ready design systems.',
    icon: 'Palette',
    image: '/services/ui-ux-design.webp',
    features: [
      'User research & testing',
      'Wireframing & prototyping',
      'Visual design & branding',
      'Design systems',
    ],
    timeline: '3–5 weeks',
    price: 'As per consultation',
    category: 'core',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'cloud-design-consultation',
    title: 'Cloud Design & Consultation',
    slug: 'cloud-design-consultation',
    description: 'Expert guidance on cloud architecture, migration strategies, and infrastructure design to help your business scale efficiently.',
    icon: 'Cloud',
    image: '/services/cloud-solutions.webp',
    features: [
      'Cloud architecture design',
      'AWS, Azure, GCP advisory',
      'Cloud migration planning',
      'Cost optimisation & security',
    ],
    timeline: 'As agreed',
    price: 'As per consultation',
    category: 'core',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'data-mining',
    title: 'Data Mining',
    slug: 'data-mining',
    description: 'Transform raw data into actionable insights. We help you collect, process, and analyse large datasets to drive smarter decisions.',
    icon: 'Database',
    image: '/services/data-mining.webp',
    features: [
      'Data collection & processing',
      'Pattern recognition & analytics',
      'Business intelligence dashboards',
      'Predictive modelling',
    ],
    timeline: 'As agreed',
    price: 'As per consultation',
    category: 'extended',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'software-automation',
    title: 'Software & Industry Automation',
    slug: 'software-automation',
    description: 'Automate repetitive processes and industrial workflows using intelligent software solutions to improve efficiency and reduce costs.',
    icon: 'Cpu',
    image: '/services/ai-automation.webp',
    features: [
      'Robotic Process Automation (RPA)',
      'Industrial process automation',
      'Workflow optimisation',
      'Integration with existing systems',
    ],
    timeline: 'As agreed',
    price: 'As per consultation',
    category: 'extended',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'industrial-consultation',
    title: 'Industrial Consultation',
    slug: 'industrial-consultation',
    description: 'Strategic consulting for industrial businesses looking to modernise operations, adopt new technologies, or improve productivity.',
    icon: 'Factory',
    image: '/services/consulting.webp',
    features: [
      'Technology strategy & roadmap',
      'Digital transformation advisory',
      'Process improvement consulting',
      'Technical audits & assessments',
    ],
    timeline: 'As agreed',
    price: 'As per consultation',
    category: 'extended',
    showOnHome: true,
    hasDedicatedPage: false,
  },
  {
    id: 'industrial-handling',
    title: 'Industrial Handling & Support Services',
    slug: 'industrial-handling',
    description: 'End-to-end operational and technical support services for industrial clients, including system maintenance and on-site assistance.',
    icon: 'Wrench',
    image: '/services/product-engineering.webp',
    features: [
      'On-site technical support',
      'System maintenance & monitoring',
      'Operational assistance',
      'After-sales support',
    ],
    timeline: 'As agreed',
    price: 'As per consultation',
    category: 'extended',
    showOnHome: false,
    hasDedicatedPage: false,
  },
]

// Helper functions
export const getCoreServices = () => SERVICES.filter((s) => s.category === 'core')

export const getHomeServices = () => SERVICES.filter((s) => s.showOnHome)

export const getAllServices = () => SERVICES

export const getServiceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug)

export const getServiceLink = (service: Service) => {
  if (service.hasDedicatedPage) {
    return `/services/${service.slug}`
  }
  return `/services#${service.id}`
}
