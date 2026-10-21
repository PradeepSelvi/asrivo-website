import { createClient } from './server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client specifically for public CMS content reads.
 *
 * Uses the plain supabase-js client (not the SSR cookie client) so we can
 * attach Next.js fetch cache options.
 *
 * cache: 'no-store' ensures that on every request the latest Supabase data
 * is returned. This pairs with `force-dynamic` on the public pages so that
 * admin CMS edits are visible immediately on the next page visit.
 */
function createContentClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options = {}) =>
          fetch(url, {
            ...options,
            cache: 'no-store',
          }),
      },
    }
  )
}

// ============================================
// TypeScript Interfaces for Page Content
// ============================================

export interface HomeContent {
  // Hero Section
  hero_title: string
  hero_subtitle: string
  hero_cta_primary: string
  hero_cta_secondary: string
  hero_status_badge: string
  hero_stat_services_label: string
  hero_stat_services_value: string
  hero_stat_reliability_label: string
  hero_stat_expertise_label: string
  hero_stat_expertise_value: string
  hero_stat_support_label: string
  hero_stat_support_value: string
  hero_scroll_text: string
  
  // Stats Section (used by Hero and AboutPreview)
  stats_projects: string
  stats_clients: string
  stats_team: string
  stats_experience: string
  stats_services: string
  stats_reliability: string
  stats_support: string
  
  // About Preview Section
  about_badge: string
  about_title: string
  about_description: string
  about_stats_services_label: string
  about_stats_services_value: string
  about_stats_services_desc: string
  about_stats_support_label: string
  about_stats_support_value: string
  about_stats_support_desc: string
  about_stats_tech_label: string
  about_stats_tech_value: string
  about_stats_tech_desc: string
  about_stats_reliability_label: string
  about_stats_reliability_value: string
  about_stats_reliability_desc: string
  about_feature_1: string
  about_feature_2: string
  about_feature_3: string
  about_feature_4: string
  about_feature_5: string
  about_feature_6: string
  about_cta_primary: string
  about_cta_secondary: string
  about_availability_text: string
  
  // Services Preview Section
  services_badge: string
  services_title: string
  services_subtitle: string
  services_cta: string
  
  // Why Choose Us Section
  why_choose_badge: string
  why_choose_title: string
  why_choose_subtitle: string
  why_choose_reason_1_title: string
  why_choose_reason_1_desc: string
  why_choose_reason_2_title: string
  why_choose_reason_2_desc: string
  why_choose_reason_3_title: string
  why_choose_reason_3_desc: string
  why_choose_reason_4_title: string
  why_choose_reason_4_desc: string
  
  // Featured Projects Section
  featured_projects_badge: string
  featured_projects_title: string
  featured_projects_description: string
  featured_projects_cta: string
  featured_projects_empty: string
  
  // Team Preview Section
  team_badge: string
  team_title: string
  team_subtitle: string
  
  // Testimonials Section
  testimonials_badge: string
  testimonials_title: string
  testimonials_subtitle: string
  
  // CTA Section
  cta_title: string
  cta_description: string
  cta_button: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface AboutContent {
  hero_title: string
  hero_subtitle: string
  mission_title: string
  mission_description: string
  vision_title: string
  vision_description: string
  values_title: string
  values_description: string
  founded_year: string
  team_size: string
  projects_completed: string
  
  // Story Section
  story_badge: string
  story_title: string
  story_description: string
  
  // Journey Timeline Section
  journey_title: string
  journey_milestone_1_year: string
  journey_milestone_1_title: string
  journey_milestone_1_desc: string
  journey_milestone_2_year: string
  journey_milestone_2_title: string
  journey_milestone_2_desc: string
  journey_milestone_3_year: string
  journey_milestone_3_title: string
  journey_milestone_3_desc: string
  journey_milestone_4_year: string
  journey_milestone_4_title: string
  journey_milestone_4_desc: string
  
  // Strategic Pillars
  foundation_title: string
  
  // Why Choose Us Section (About Page Version)
  why_choose_about_badge: string
  why_choose_about_title: string
  why_choose_about_reason_1_title: string
  why_choose_about_reason_1_desc: string
  why_choose_about_reason_2_title: string
  why_choose_about_reason_2_desc: string
  why_choose_about_reason_3_title: string
  why_choose_about_reason_3_desc: string
  why_choose_about_reason_4_title: string
  why_choose_about_reason_4_desc: string
  why_choose_about_reason_5_title: string
  why_choose_about_reason_5_desc: string
  why_choose_about_reason_6_title: string
  why_choose_about_reason_6_desc: string
  
  // Leadership Quote Section
  leadership_quote_badge: string
  leadership_quote_text: string
  leadership_quote_author_name: string
  leadership_quote_author_title: string
  
  // Company Profile Section
  profile_title: string
  profile_entity_label: string
  profile_entity_value: string
  profile_sector_label: string
  profile_sector_value: string
  profile_compliance_label: string
  profile_compliance_value: string
  
  // Partnership Section
  partnership_badge: string
  partnership_title: string
  partnership_description: string
  partnership_service_1_title: string
  partnership_service_1_desc: string
  partnership_service_2_title: string
  partnership_service_2_desc: string
  partnership_service_3_title: string
  partnership_service_3_desc: string
  partnership_service_4_title: string
  partnership_service_4_desc: string
  partnership_footer_text: string
  partnership_cta_status: string
  partnership_cta_start: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface ServicesContent {
  hero_title: string
  hero_subtitle: string
  services_page_badge: string
  cta_title: string
  cta_description: string
  cta_button: string
  
  // Service 1: Custom Software Development
  service_1_title: string
  service_1_description: string
  service_1_feature_1: string
  service_1_feature_2: string
  service_1_feature_3: string
  service_1_feature_4: string
  
  // Service 2: Web Application Development
  service_2_title: string
  service_2_description: string
  service_2_feature_1: string
  service_2_feature_2: string
  service_2_feature_3: string
  service_2_feature_4: string
  
  // Service 3: Mobile Application Development
  service_3_title: string
  service_3_description: string
  service_3_feature_1: string
  service_3_feature_2: string
  service_3_feature_3: string
  service_3_feature_4: string
  
  // Service 4: Cloud & DevOps Solutions
  service_4_title: string
  service_4_description: string
  service_4_feature_1: string
  service_4_feature_2: string
  service_4_feature_3: string
  service_4_feature_4: string
  
  // Service 5: Web Hosting
  service_5_title: string
  service_5_description: string
  service_5_feature_1: string
  service_5_feature_2: string
  service_5_feature_3: string
  service_5_feature_4: string
  
  // Service 6: Enterprise IT Consulting
  service_6_title: string
  service_6_description: string
  service_6_feature_1: string
  service_6_feature_2: string
  service_6_feature_3: string
  service_6_feature_4: string
  
  // Service 7: Digital Marketing
  service_7_title: string
  service_7_description: string
  service_7_feature_1: string
  service_7_feature_2: string
  service_7_feature_3: string
  service_7_feature_4: string
  
  // Service 8: Product Engineering
  service_8_title: string
  service_8_description: string
  service_8_feature_1: string
  service_8_feature_2: string
  service_8_feature_3: string
  service_8_feature_4: string
  
  // Process Section
  process_badge: string
  process_title: string
  process_subtitle: string
  process_step_1_title: string
  process_step_1_desc: string
  process_step_2_title: string
  process_step_2_desc: string
  process_step_3_title: string
  process_step_3_desc: string
  process_step_4_title: string
  process_step_4_desc: string
  process_step_5_title: string
  process_step_5_desc: string
  process_step_6_title: string
  process_step_6_desc: string
  
  // Status Section
  status_title: string
  status_description: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface ContactContent {
  hero_title: string
  hero_subtitle: string
  contact_badge: string
  form_title: string
  form_description: string
  info_title: string
  info_description: string
  
  // Form Labels
  form_label_name: string
  form_label_email: string
  form_label_phone: string
  form_label_company: string
  form_label_subject: string
  form_label_message: string
  form_placeholder_name: string
  form_placeholder_email: string
  form_placeholder_phone: string
  form_placeholder_company: string
  form_placeholder_subject: string
  form_placeholder_message: string
  
  // Contact Info
  contact_email: string
  contact_phone: string
  contact_address: string
  contact_hours: string
  contact_linkedin: string
  contact_github: string
  contact_twitter: string
  contact_instagram: string
  
  // Additional Company Email Addresses
  media_email: string
  cto_email: string
  hr_team_email: string
  noreplay_email: string
  
  // Complaint Section
  complaint_title: string
  complaint_description: string
  complaint_email: string
  complaint_phone: string
  complaint_form_title: string
  complaint_form_description: string
  complaint_submit_button: string
  
  // Status Check Section
  status_check_title: string
  status_check_description: string
  status_check_button: string
  status_check_placeholder: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface ProjectsContent {
  hero_title: string
  hero_subtitle: string
  projects_badge: string
  filter_all: string
  filter_featured: string
  
  // Stats Section
  stats_title: string
  stats_total_label: string
  stats_total_value: string
  stats_active_label: string
  stats_active_value: string
  stats_community_label: string
  stats_community_value: string
  stats_quality_label: string
  stats_quality_value: string
  
  // Buttons and Labels
  button_view_all: string
  button_load_more: string
  empty_state_message: string
  
  // CTA Section
  cta_title: string
  cta_description: string
  cta_button: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface TeamContent {
  hero_title: string
  hero_subtitle: string
  team_badge: string
  management_title: string
  management_description: string
  management_badge: string
  development_title: string
  development_description: string
  development_badge: string
  
  // Empty State
  empty_state_title: string
  empty_state_description: string
  
  // Company Contact Section
  company_contact_title: string
  company_contact_description: string
  company_contact_email: string
  company_contact_email_label: string
  company_contact_linkedin: string
  company_contact_linkedin_label: string
  company_contact_github: string
  company_contact_github_label: string
  company_contact_whatsapp: string
  company_contact_whatsapp_label: string
  company_contact_button: string
  
  // Join CTA Section
  join_cta_title: string
  join_cta_description: string
  join_cta_button: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface CareersContent {
  hero_title: string
  hero_subtitle: string
  careers_badge: string
  positions_title: string
  no_positions_title: string
  no_positions_description: string
  
  // Features
  feature_1: string
  feature_2: string
  feature_3: string
  
  // Job Labels
  job_label_location: string
  job_label_salary: string
  job_label_posted: string
  job_button_apply: string
  job_button_closed: string
  
  // CTA Footer
  cta_footer_title: string
  cta_footer_description: string
  cta_footer_button: string
  
  // Disabled State
  disabled_title: string
  disabled_description: string
  disabled_button: string
  
  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
}

export interface PageMetadata {
  slug: string
  lastUpdated: string
  contentFields: number
}

// ============================================
// Default Content Values
// ============================================

const DEFAULT_HOME_CONTENT: HomeContent = {
  // Hero Section
  hero_title: "Building Tomorrow's Digital Solutions",
  hero_subtitle: 'We transform ideas into powerful digital experiences through innovative software solutions.',
  hero_cta_primary: 'Start Your Project',
  hero_cta_secondary: 'View Our Work',
  hero_status_badge: 'Enterprise Modular Architectures',
  hero_stat_services_label: 'Our Core Service',
  hero_stat_services_value: '7',
  hero_stat_reliability_label: 'System Reliability',
  hero_stat_expertise_label: 'Technology Expertise',
  hero_stat_expertise_value: '7+',
  hero_stat_support_label: 'Live Support',
  hero_stat_support_value: '25/7',
  hero_scroll_text: 'Explore More',
  
  // Stats Section (used by Hero and AboutPreview)
  stats_projects: '2',
  stats_clients: '2',
  stats_team: '9',
  stats_experience: '1',
  stats_services: '6+',
  stats_reliability: '99%',
  stats_support: '24/7',
  
  // About Preview Section
  about_badge: 'Elite Engineering',
  about_title: 'Why Choose Asrivo Tech',
  about_description: 'We are a team of passionate developers and designers committed to delivering exceptional digital solutions that drive business growth.',
  about_stats_services_label: 'Core Services',
  about_stats_services_value: '6+',
  about_stats_services_desc: 'Comprehensive technology solutions for modern businesses.',
  about_stats_support_label: 'Support Availability',
  about_stats_support_value: '24/7',
  about_stats_support_desc: 'Continuous assistance for seamless operations.',
  about_stats_tech_label: 'Technology Stack',
  about_stats_tech_value: '10+',
  about_stats_tech_desc: 'Modern tools and frameworks powering solutions.',
  about_stats_reliability_label: 'System Reliability',
  about_stats_reliability_value: '99%',
  about_stats_reliability_desc: 'Stable infrastructure powering every service.',
  about_feature_1: 'Next-Gen AI Integration',
  about_feature_2: 'Cloud-Native Architecture',
  about_feature_3: 'Zero-Trust Security',
  about_feature_4: 'Reliability Service',
  about_feature_5: 'High-Velocity DevOps',
  about_feature_6: 'Post-Launch Maintenance',
  about_cta_primary: 'View Our Work',
  about_cta_secondary: 'Book a Consultation',
  about_availability_text: 'We are currently accepting new projects.',
  
  // Services Preview Section
  services_badge: 'Our Services',
  services_title: 'Comprehensive Technology Solutions',
  services_subtitle: 'From concept to deployment, we offer end-to-end services to bring your digital vision to life.',
  services_cta: 'View All Services',
  
  // Why Choose Us Section
  why_choose_badge: 'Why Choose Us',
  why_choose_title: 'What Sets Us Apart',
  why_choose_subtitle: 'We combine technical excellence with a client-first approach to deliver exceptional results.',
  why_choose_reason_1_title: 'Expert Team',
  why_choose_reason_1_desc: 'Our team consists of highly skilled developers, designers, and strategists with proven track records in delivering complex projects.',
  why_choose_reason_2_title: 'Secure & Scalable',
  why_choose_reason_2_desc: 'We build solutions with enterprise-grade security and architecture that scales with your business growth.',
  why_choose_reason_3_title: 'Agile Development',
  why_choose_reason_3_desc: 'Our agile methodology ensures faster delivery, continuous feedback, and flexibility to adapt to changing requirements.',
  why_choose_reason_4_title: 'Long-Term Support',
  why_choose_reason_4_desc: 'We provide ongoing maintenance and support to ensure your solutions continue to perform optimally.',
  
  // Featured Projects Section
  featured_projects_badge: 'Our Work',
  featured_projects_title: 'Featured Projects',
  featured_projects_description: 'Explore some of our recent projects that showcase our expertise and innovation.',
  featured_projects_cta: 'View All Projects',
  featured_projects_empty: 'No projects available yet. Check back soon!',
  
  // Team Preview Section
  team_badge: 'Our Team',
  team_title: 'Meet the Experts',
  team_subtitle: 'Our talented team of professionals is dedicated to delivering exceptional results.',
  
  // Testimonials Section
  testimonials_badge: 'Testimonials',
  testimonials_title: 'What Our Clients Say',
  testimonials_subtitle: "Don't just take our word for it - hear from our satisfied clients.",
  
  // CTA Section
  cta_title: 'Ready to Build Something Amazing?',
  cta_description: "Let's discuss your project and turn your vision into reality.",
  cta_button: 'Get Started Today'
}

const DEFAULT_ABOUT_CONTENT: AboutContent = {
  hero_title: 'About Asrivo Tech',
  hero_subtitle: 'Innovation Meets Excellence',
  mission_title: 'Our Mission',
  mission_description: 'To empower businesses through cutting-edge technology solutions that drive innovation and growth.',
  vision_title: 'Our Vision',
  vision_description: 'To be the most trusted technology partner for businesses worldwide, known for exceptional quality and innovation.',
  values_title: 'Our Values',
  values_description: 'Innovation • Integrity • Quality • Customer Success • Collaboration • Continuous Learning',
  founded_year: '2024',
  team_size: '10+',
  projects_completed: '50+',
  
  // Story Section
  story_badge: 'Who We Are',
  story_title: 'Technology-Driven Innovation',
  story_description: 'We are a technology-driven company building innovative digital products while delivering reliable IT and Digital Marketing solutions. Our goal is to help businesses grow with smart technology, creativity, and quality services.',
  
  // Journey Timeline
  journey_title: 'Our Journey',
  journey_milestone_1_year: '2024',
  journey_milestone_1_title: 'Company Founded',
  journey_milestone_1_desc: 'Started with a vision to transform businesses through technology.',
  journey_milestone_2_year: '2024',
  journey_milestone_2_title: 'First Major Project',
  journey_milestone_2_desc: 'Delivered our first enterprise-level solution.',
  journey_milestone_3_year: '2025',
  journey_milestone_3_title: 'Team Expansion',
  journey_milestone_3_desc: 'Grew our team to 10+ talented professionals.',
  journey_milestone_4_year: '2026',
  journey_milestone_4_title: 'Global Reach',
  journey_milestone_4_desc: 'Expanded services to international clients.',
  
  // Strategic Pillars
  foundation_title: 'Strategic Foundation',
  
  // Why Choose Us
  why_choose_about_badge: 'Why Choose Us',
  why_choose_about_title: 'What Makes Us Different',
  why_choose_about_reason_1_title: 'Innovation First',
  why_choose_about_reason_1_desc: 'We stay ahead of technology trends to deliver cutting-edge solutions.',
  why_choose_about_reason_2_title: 'Client Partnership',
  why_choose_about_reason_2_desc: 'We work closely with clients to understand and exceed their expectations.',
  why_choose_about_reason_3_title: 'Quality Assurance',
  why_choose_about_reason_3_desc: 'Rigorous testing ensures every solution meets the highest standards.',
  why_choose_about_reason_4_title: 'Transparent Communication',
  why_choose_about_reason_4_desc: 'Clear and honest communication throughout every project phase.',
  why_choose_about_reason_5_title: 'Proven Expertise',
  why_choose_about_reason_5_desc: 'Years of experience delivering successful projects across industries.',
  why_choose_about_reason_6_title: 'Ongoing Support',
  why_choose_about_reason_6_desc: 'Comprehensive post-launch support and maintenance services.',
  
  // Leadership Quote
  leadership_quote_badge: 'Leadership',
  leadership_quote_text: 'Our mission is to empower businesses through technology and innovation, building solutions that make a real difference.',
  leadership_quote_author_name: 'John Doe',
  leadership_quote_author_title: 'CEO & Founder',
  
  // Company Profile
  profile_title: 'Company Profile',
  profile_entity_label: 'Legal Entity',
  profile_entity_value: 'Asrivo Tech Private Limited',
  profile_sector_label: 'Industry Sector',
  profile_sector_value: 'Information Technology & Services',
  profile_compliance_label: 'Compliance',
  profile_compliance_value: 'ISO 27001, GDPR Compliant',
  
  // Partnership
  partnership_badge: 'Partnerships',
  partnership_title: 'Strategic Partnerships',
  partnership_description: 'We collaborate with leading technology partners to deliver best-in-class solutions.',
  partnership_service_1_title: 'Cloud Infrastructure',
  partnership_service_1_desc: 'AWS, Azure, Google Cloud partnerships for scalable infrastructure.',
  partnership_service_2_title: 'Development Tools',
  partnership_service_2_desc: 'Microsoft, JetBrains, and GitHub partnerships for development excellence.',
  partnership_service_3_title: 'Security Solutions',
  partnership_service_3_desc: 'Certified partnerships with leading cybersecurity providers.',
  partnership_service_4_title: 'Analytics & AI',
  partnership_service_4_desc: 'Partnerships with leading AI and analytics platforms.',
  partnership_footer_text: 'Interested in partnering with us?',
  partnership_cta_status: 'Accepting Inquiries',
  partnership_cta_start: 'Get in Touch'
}

const DEFAULT_SERVICES_CONTENT: ServicesContent = {
  hero_title: 'Our Services',
  hero_subtitle: 'Comprehensive technology solutions tailored to your business needs',
  services_page_badge: 'Services',
  cta_title: 'Ready to Get Started?',
  cta_description: "Let's discuss how we can help you achieve your product goals.",
  cta_button: 'Contact Us Today',
  
  // Service 1: Custom Software Development
  service_1_title: 'Custom Software Development',
  service_1_description: 'We build tailored software solutions that address your unique business challenges. Our team delivers robust, scalable applications designed to streamline operations and drive growth with your specific needs in mind.',
  service_1_feature_1: 'Enterprise Application development',
  service_1_feature_2: 'Modern System architecture design',
  service_1_feature_3: 'API development and integration',
  service_1_feature_4: 'Database design and optimization',
  
  // Service 2: Web Application Development
  service_2_title: 'Web Application Development',
  service_2_description: 'Modern, responsive web applications that deliver exceptional user experiences across all devices. We use the latest technologies to build fast, secure, and scalable web solutions.',
  service_2_feature_1: 'Progressive Web Apps (PWA)',
  service_2_feature_2: 'Single Page Applications (SPA)',
  service_2_feature_3: 'E-commerce platforms',
  service_2_feature_4: 'Content Management Systems',
  
  // Service 3: Mobile Application Development
  service_3_title: 'Mobile Application Development',
  service_3_description: 'Native and cross-platform mobile applications for iOS and Android. We create intuitive, high-performance apps that engage users and drive business results.',
  service_3_feature_1: 'iOS and Android native apps',
  service_3_feature_2: 'Cross-platform development (React Native, Flutter)',
  service_3_feature_3: 'Mobile UI/UX design',
  service_3_feature_4: 'App store optimization',
  
  // Service 4: Cloud & DevOps Solutions
  service_4_title: 'Cloud & DevOps Solutions',
  service_4_description: 'Scalable cloud infrastructure and automated deployment pipelines. We help you leverage the full potential of cloud computing for efficiency and cost savings.',
  service_4_feature_1: 'Cloud migration and strategy',
  service_4_feature_2: 'Infrastructure as Code (IaC)',
  service_4_feature_3: 'CI/CD pipeline implementation',
  service_4_feature_4: 'Kubernetes and container orchestration',
  
  // Service 5: Web Hosting
  service_5_title: 'Web Hosting',
  service_5_description: 'Intelligent automation solutions powered by machine learning and artificial intelligence. Transform your business processes with smart, data-driven systems.',
  service_5_feature_1: 'Machine learning model development',
  service_5_feature_2: 'Natural language processing',
  service_5_feature_3: 'Process automation (RPA)',
  service_5_feature_4: 'Predictive analytics',
  
  // Service 6: Enterprise IT Consulting
  service_6_title: 'Enterprise IT Consulting',
  service_6_description: 'Strategic technology consulting to guide your digital transformation journey. Our experts help you make informed decisions and optimize your IT investments.',
  service_6_feature_1: 'Digital transformation strategy',
  service_6_feature_2: 'Technology roadmap planning',
  service_6_feature_3: 'IT architecture assessment',
  service_6_feature_4: 'Vendor selection and management',
  
  // Service 7: Digital Marketing
  service_7_title: 'Digital Marketing',
  service_7_description: 'Delivering result-driven digital marketing solutions to enhance brand visibility, generate quality leads, and accelerate business growth.',
  service_7_feature_1: 'Search Engine Optimization (SEO) & Search Engine Marketing (SEM)',
  service_7_feature_2: 'Social Media Marketing & Paid Advertising (Meta, Instagram, LinkedIn, Google Ads)',
  service_7_feature_3: 'Branding & Content Marketing',
  service_7_feature_4: 'Lead Generation & Performance Marketing',
  
  // Service 8: Product Engineering
  service_8_title: 'Product Engineering',
  service_8_description: 'End-to-end product development from concept to launch. We help startups and enterprises build innovative digital products that succeed in the market.',
  service_8_feature_1: 'Product strategy and roadmapping',
  service_8_feature_2: 'MVP development',
  service_8_feature_3: 'Product scaling and optimization',
  service_8_feature_4: 'Technical due diligence',
  
  // Process Section
  process_badge: 'Our Process',
  process_title: 'How We Work',
  process_subtitle: 'Our proven methodology ensures successful project delivery from concept to launch.',
  process_step_1_title: 'Discovery & Planning',
  process_step_1_desc: 'We analyze your requirements and create a detailed project roadmap.',
  process_step_2_title: 'Design & Prototyping',
  process_step_2_desc: 'Creating user-centric designs and interactive prototypes.',
  process_step_3_title: 'Development',
  process_step_3_desc: 'Building robust solutions using modern technologies and best practices.',
  process_step_4_title: 'Testing & QA',
  process_step_4_desc: 'Comprehensive testing to ensure quality and reliability.',
  process_step_5_title: 'Deployment',
  process_step_5_desc: 'Smooth deployment and launch of your solution.',
  process_step_6_title: 'Support & Maintenance',
  process_step_6_desc: 'Ongoing support and continuous improvement.',
  
  // Status Section
  status_title: 'Currently Accepting Projects',
  status_description: 'We have availability for new projects starting Q2 2025.'
}

const DEFAULT_CONTACT_CONTENT: ContactContent = {
  hero_title: 'Get in Touch',
  hero_subtitle: "Have a project in mind or want to learn more about our services? We'd love to hear from you.",
  contact_badge: 'Contact Us',
  form_title: 'Send Us a Message',
  form_description: "Fill out the form below and we'll get back to you within 24 hours.",
  info_title: 'Contact Information',
  info_description: 'You can also reach us through any of the following channels.',
  
  // Form Labels
  form_label_name: 'Full Name',
  form_label_email: 'Email Address',
  form_label_phone: 'Phone Number',
  form_label_company: 'Company Name',
  form_label_subject: 'Subject',
  form_label_message: 'Your Message',
  form_placeholder_name: 'John Doe',
  form_placeholder_email: 'john@example.com',
  form_placeholder_phone: '+1 (555) 000-0000',
  form_placeholder_company: 'Your Company',
  form_placeholder_subject: 'Project Inquiry',
  form_placeholder_message: 'Tell us about your project...',
  
  // Contact Info
  contact_email: 'hello@asrivotech.in',
  contact_phone: '+91 99764 22558',
  contact_address: 'Bangalore, Karnataka, India',
  contact_hours: 'Mon-Fri: 9AM-6PM IST',
  contact_linkedin: 'https://linkedin.com/company/asrivotech',
  contact_github: 'https://github.com/asrivotech',
  contact_twitter: 'https://x.com/asrivotech',
  contact_instagram: 'https://instagram.com/asrivotech',
  
  // Additional Company Email Addresses
  media_email: 'media@asrivotech.in',
  cto_email: 'cto@asrivotech.in',
  hr_team_email: 'hr_team@asrivotech.in',
  noreplay_email: 'noreplay@asrivotech.in',
  
  // Complaint Section
  complaint_title: 'File a Complaint',
  complaint_description: 'If you have concerns about our services, please let us know.',
  complaint_email: 'complaints@asrivotech.in',
  complaint_phone: '+91 (555) 123-4568',
  complaint_form_title: 'Submit a Complaint',
  complaint_form_description: 'We take all complaints seriously and will respond within 48 hours.',
  complaint_submit_button: 'Submit Complaint',
  
  // Status Check
  status_check_title: 'Check Inquiry Status',
  status_check_description: 'Enter your inquiry ID to check the status of your submission.',
  status_check_button: 'Check Status',
  status_check_placeholder: 'Enter Inquiry ID'
}

const DEFAULT_PROJECTS_CONTENT: ProjectsContent = {
  hero_title: 'Our Projects',
  hero_subtitle: "Explore our portfolio of successful projects and see how we've helped businesses transform digitally.",
  projects_badge: 'Portfolio',
  filter_all: 'All Projects',
  filter_featured: 'Featured',
  
  // Stats Section
  stats_title: 'Project Statistics',
  stats_total_label: 'Total Projects',
  stats_total_value: '50+',
  stats_active_label: 'Active Projects',
  stats_active_value: '12',
  stats_community_label: 'Developer Community',
  stats_community_value: '10+',
  stats_quality_label: 'Commitment to Quality',
  stats_quality_value: '100%',
  
  // Buttons and Labels
  button_view_all: 'View All Projects',
  button_load_more: 'Load More',
  empty_state_message: 'No projects found matching your criteria.',
  
  // CTA Section
  cta_title: 'Have a Project in Mind?',
  cta_description: "Let's discuss how we can bring your vision to life.",
  cta_button: 'Start Your Project'
}

const DEFAULT_TEAM_CONTENT: TeamContent = {
  hero_title: 'Meet the Experts Behind Asrivo Tech',
  hero_subtitle: 'Our talented team of professionals combines deep technical expertise with a passion for innovation.',
  team_badge: 'Our Team',
  management_title: 'Management Team',
  management_description: 'Experienced leaders guiding our vision and strategy for success.',
  management_badge: 'Leadership',
  development_title: 'Our Technical Team',
  development_description: 'Meet the skilled developers building the next generation of digital solutions.',
  development_badge: 'Engineers',
  
  // Empty State
  empty_state_title: 'No Team Members Yet',
  empty_state_description: "We're building our team. Check back soon!",
  
  // Company Contact
  company_contact_title: 'Connect With Us',
  company_contact_description: 'Reach out to our team through any of these channels.',
  company_contact_email: 'hello@asrivotech.in',
  company_contact_email_label: 'Email Us',
  company_contact_linkedin: 'https://linkedin.com/company/asrivotech',
  company_contact_linkedin_label: 'LinkedIn',
  company_contact_github: 'https://github.com/asrivotech',
  company_contact_github_label: 'GitHub',
  company_contact_whatsapp: 'https://wa.me/919976422558',
  company_contact_whatsapp_label: 'WhatsApp',
  company_contact_button: 'Get in Touch',
  
  // Join CTA
  join_cta_title: 'Want to Join Our Team?',
  join_cta_description: "We're always looking for talented people to join our growing team.",
  join_cta_button: 'View Open Positions'
}

const DEFAULT_CAREERS_CONTENT: CareersContent = {
  hero_title: 'Join Our Team at Asrivo Tech',
  hero_subtitle: "We're a team of passionate builders crafting digital solutions that make a real difference.",
  careers_badge: 'Careers',
  positions_title: 'Open Positions',
  no_positions_title: 'No Open Positions Right Now',
  no_positions_description: "We don't have any active openings at the moment, but we're always interested in talented people.",
  
  // Features
  feature_1: 'Competitive Salary & Benefits',
  feature_2: 'Remote & Flexible Work',
  feature_3: 'Growth & Learning Opportunities',
  
  // Job Labels
  job_label_location: 'Location',
  job_label_salary: 'Salary',
  job_label_posted: 'Posted',
  job_button_apply: 'Apply Now',
  job_button_closed: 'Position Closed',
  
  // CTA Footer
  cta_footer_title: "Don't See a Perfect Fit?",
  cta_footer_description: "We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.",
  cta_footer_button: 'Send Resume',
  
  // Disabled State
  disabled_title: 'Applications Paused',
  disabled_description: 'We are not currently accepting new applications. Please check back later.',
  disabled_button: 'Notify Me'
}

// ============================================
// Core Helper Functions
// ============================================

/**
 * Fetches all content for a specific page and converts from row format to key-value object
 * @param pageSlug - The page identifier (e.g., 'home', 'about', 'services')
 * @returns Object with section_key as keys and content_value as values
 */
export async function getPageContent(pageSlug: string): Promise<Record<string, string>> {
  try {
    // Use the no-store client so Next.js never serves a cached Supabase response.
    // This pairs with `force-dynamic` on every public page to ensure CMS edits
    // are visible immediately on the next page visit.
    const supabase = createContentClient()
    
    const { data, error } = await supabase
      .from('page_content')
      .select('section_key, content_value')
      .eq('page_slug', pageSlug)
      .eq('is_active', true)
    
    if (error) {
      console.error(`Error fetching content for page "${pageSlug}":`, error)
      return {}
    }
    
    if (!data || data.length === 0) {
      console.warn(`No content found for page "${pageSlug}"`)
      return {}
    }
    
    // Convert array of rows to key-value object
    const contentObject: Record<string, string> = {}
    data.forEach(row => {
      contentObject[row.section_key] = row.content_value
    })
    
    return contentObject
  } catch (error) {
    console.error(`Exception fetching content for page "${pageSlug}":`, error)
    return {}
  }
}

/**
 * Fetches home page content with proper typing and fallback to defaults
 */
export async function getHomeContent(): Promise<HomeContent> {
  const content = await getPageContent('home')
  
  return {
    // Hero Section
    hero_title: content.hero_title || DEFAULT_HOME_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_HOME_CONTENT.hero_subtitle,
    hero_cta_primary: content.hero_cta_primary || DEFAULT_HOME_CONTENT.hero_cta_primary,
    hero_cta_secondary: content.hero_cta_secondary || DEFAULT_HOME_CONTENT.hero_cta_secondary,
    hero_status_badge: content.hero_status_badge || DEFAULT_HOME_CONTENT.hero_status_badge,
    hero_stat_services_label: content.hero_stat_services_label || DEFAULT_HOME_CONTENT.hero_stat_services_label,
    hero_stat_services_value: content.hero_stat_services_value || DEFAULT_HOME_CONTENT.hero_stat_services_value,
    hero_stat_reliability_label: content.hero_stat_reliability_label || DEFAULT_HOME_CONTENT.hero_stat_reliability_label,
    hero_stat_expertise_label: content.hero_stat_expertise_label || DEFAULT_HOME_CONTENT.hero_stat_expertise_label,
    hero_stat_expertise_value: content.hero_stat_expertise_value || DEFAULT_HOME_CONTENT.hero_stat_expertise_value,
    hero_stat_support_label: content.hero_stat_support_label || DEFAULT_HOME_CONTENT.hero_stat_support_label,
    hero_stat_support_value: content.hero_stat_support_value || DEFAULT_HOME_CONTENT.hero_stat_support_value,
    hero_scroll_text: content.hero_scroll_text || DEFAULT_HOME_CONTENT.hero_scroll_text,
    
    // Stats Section
    stats_projects: content.stats_projects || DEFAULT_HOME_CONTENT.stats_projects,
    stats_clients: content.stats_clients || DEFAULT_HOME_CONTENT.stats_clients,
    stats_team: content.stats_team || DEFAULT_HOME_CONTENT.stats_team,
    stats_experience: content.stats_experience || DEFAULT_HOME_CONTENT.stats_experience,
    stats_services: content.stats_services || DEFAULT_HOME_CONTENT.stats_services,
    stats_reliability: content.stats_reliability || DEFAULT_HOME_CONTENT.stats_reliability,
    stats_support: content.stats_support || DEFAULT_HOME_CONTENT.stats_support,
    
    // About Preview Section
    about_badge: content.about_badge || DEFAULT_HOME_CONTENT.about_badge,
    about_title: content.about_title || DEFAULT_HOME_CONTENT.about_title,
    about_description: content.about_description || DEFAULT_HOME_CONTENT.about_description,
    about_stats_services_label: content.about_stats_services_label || DEFAULT_HOME_CONTENT.about_stats_services_label,
    about_stats_services_value: content.about_stats_services_value || DEFAULT_HOME_CONTENT.about_stats_services_value,
    about_stats_services_desc: content.about_stats_services_desc || DEFAULT_HOME_CONTENT.about_stats_services_desc,
    about_stats_support_label: content.about_stats_support_label || DEFAULT_HOME_CONTENT.about_stats_support_label,
    about_stats_support_value: content.about_stats_support_value || DEFAULT_HOME_CONTENT.about_stats_support_value,
    about_stats_support_desc: content.about_stats_support_desc || DEFAULT_HOME_CONTENT.about_stats_support_desc,
    about_stats_tech_label: content.about_stats_tech_label || DEFAULT_HOME_CONTENT.about_stats_tech_label,
    about_stats_tech_value: content.about_stats_tech_value || DEFAULT_HOME_CONTENT.about_stats_tech_value,
    about_stats_tech_desc: content.about_stats_tech_desc || DEFAULT_HOME_CONTENT.about_stats_tech_desc,
    about_stats_reliability_label: content.about_stats_reliability_label || DEFAULT_HOME_CONTENT.about_stats_reliability_label,
    about_stats_reliability_value: content.about_stats_reliability_value || DEFAULT_HOME_CONTENT.about_stats_reliability_value,
    about_stats_reliability_desc: content.about_stats_reliability_desc || DEFAULT_HOME_CONTENT.about_stats_reliability_desc,
    about_feature_1: content.about_feature_1 || DEFAULT_HOME_CONTENT.about_feature_1,
    about_feature_2: content.about_feature_2 || DEFAULT_HOME_CONTENT.about_feature_2,
    about_feature_3: content.about_feature_3 || DEFAULT_HOME_CONTENT.about_feature_3,
    about_feature_4: content.about_feature_4 || DEFAULT_HOME_CONTENT.about_feature_4,
    about_feature_5: content.about_feature_5 || DEFAULT_HOME_CONTENT.about_feature_5,
    about_feature_6: content.about_feature_6 || DEFAULT_HOME_CONTENT.about_feature_6,
    about_cta_primary: content.about_cta_primary || DEFAULT_HOME_CONTENT.about_cta_primary,
    about_cta_secondary: content.about_cta_secondary || DEFAULT_HOME_CONTENT.about_cta_secondary,
    about_availability_text: content.about_availability_text || DEFAULT_HOME_CONTENT.about_availability_text,
    
    // Services Preview Section
    services_badge: content.services_badge || DEFAULT_HOME_CONTENT.services_badge,
    services_title: content.services_title || DEFAULT_HOME_CONTENT.services_title,
    services_subtitle: content.services_subtitle || DEFAULT_HOME_CONTENT.services_subtitle,
    services_cta: content.services_cta || DEFAULT_HOME_CONTENT.services_cta,
    
    // Why Choose Us Section
    why_choose_badge: content.why_choose_badge || DEFAULT_HOME_CONTENT.why_choose_badge,
    why_choose_title: content.why_choose_title || DEFAULT_HOME_CONTENT.why_choose_title,
    why_choose_subtitle: content.why_choose_subtitle || DEFAULT_HOME_CONTENT.why_choose_subtitle,
    why_choose_reason_1_title: content.why_choose_reason_1_title || DEFAULT_HOME_CONTENT.why_choose_reason_1_title,
    why_choose_reason_1_desc: content.why_choose_reason_1_desc || DEFAULT_HOME_CONTENT.why_choose_reason_1_desc,
    why_choose_reason_2_title: content.why_choose_reason_2_title || DEFAULT_HOME_CONTENT.why_choose_reason_2_title,
    why_choose_reason_2_desc: content.why_choose_reason_2_desc || DEFAULT_HOME_CONTENT.why_choose_reason_2_desc,
    why_choose_reason_3_title: content.why_choose_reason_3_title || DEFAULT_HOME_CONTENT.why_choose_reason_3_title,
    why_choose_reason_3_desc: content.why_choose_reason_3_desc || DEFAULT_HOME_CONTENT.why_choose_reason_3_desc,
    why_choose_reason_4_title: content.why_choose_reason_4_title || DEFAULT_HOME_CONTENT.why_choose_reason_4_title,
    why_choose_reason_4_desc: content.why_choose_reason_4_desc || DEFAULT_HOME_CONTENT.why_choose_reason_4_desc,
    
    // Featured Projects Section
    featured_projects_badge: content.featured_projects_badge || DEFAULT_HOME_CONTENT.featured_projects_badge,
    featured_projects_title: content.featured_projects_title || DEFAULT_HOME_CONTENT.featured_projects_title,
    featured_projects_description: content.featured_projects_description || DEFAULT_HOME_CONTENT.featured_projects_description,
    featured_projects_cta: content.featured_projects_cta || DEFAULT_HOME_CONTENT.featured_projects_cta,
    featured_projects_empty: content.featured_projects_empty || DEFAULT_HOME_CONTENT.featured_projects_empty,
    
    // Team Preview Section
    team_badge: content.team_badge || DEFAULT_HOME_CONTENT.team_badge,
    team_title: content.team_title || DEFAULT_HOME_CONTENT.team_title,
    team_subtitle: content.team_subtitle || DEFAULT_HOME_CONTENT.team_subtitle,
    
    // Testimonials Section
    testimonials_badge: content.testimonials_badge || DEFAULT_HOME_CONTENT.testimonials_badge,
    testimonials_title: content.testimonials_title || DEFAULT_HOME_CONTENT.testimonials_title,
    testimonials_subtitle: content.testimonials_subtitle || DEFAULT_HOME_CONTENT.testimonials_subtitle,
    
    // CTA Section
    cta_title: content.cta_title || DEFAULT_HOME_CONTENT.cta_title,
    cta_description: content.cta_description || DEFAULT_HOME_CONTENT.cta_description,
    cta_button: content.cta_button || DEFAULT_HOME_CONTENT.cta_button,
    
    // SEO
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches about page content with proper typing and fallback to defaults
 */
export async function getAboutContent(): Promise<AboutContent> {
  const content = await getPageContent('about')
  
  return {
    hero_title: content.hero_title || DEFAULT_ABOUT_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_ABOUT_CONTENT.hero_subtitle,
    mission_title: content.mission_title || DEFAULT_ABOUT_CONTENT.mission_title,
    mission_description: content.mission_description || DEFAULT_ABOUT_CONTENT.mission_description,
    vision_title: content.vision_title || DEFAULT_ABOUT_CONTENT.vision_title,
    vision_description: content.vision_description || DEFAULT_ABOUT_CONTENT.vision_description,
    values_title: content.values_title || DEFAULT_ABOUT_CONTENT.values_title,
    values_description: content.values_description || DEFAULT_ABOUT_CONTENT.values_description,
    founded_year: content.founded_year || DEFAULT_ABOUT_CONTENT.founded_year,
    team_size: content.team_size || DEFAULT_ABOUT_CONTENT.team_size,
    projects_completed: content.projects_completed || DEFAULT_ABOUT_CONTENT.projects_completed,
    story_badge: content.story_badge || DEFAULT_ABOUT_CONTENT.story_badge,
    story_title: content.story_title || DEFAULT_ABOUT_CONTENT.story_title,
    story_description: content.story_description || DEFAULT_ABOUT_CONTENT.story_description,
    journey_title: content.journey_title || DEFAULT_ABOUT_CONTENT.journey_title,
    journey_milestone_1_year: content.journey_milestone_1_year || DEFAULT_ABOUT_CONTENT.journey_milestone_1_year,
    journey_milestone_1_title: content.journey_milestone_1_title || DEFAULT_ABOUT_CONTENT.journey_milestone_1_title,
    journey_milestone_1_desc: content.journey_milestone_1_desc || DEFAULT_ABOUT_CONTENT.journey_milestone_1_desc,
    journey_milestone_2_year: content.journey_milestone_2_year || DEFAULT_ABOUT_CONTENT.journey_milestone_2_year,
    journey_milestone_2_title: content.journey_milestone_2_title || DEFAULT_ABOUT_CONTENT.journey_milestone_2_title,
    journey_milestone_2_desc: content.journey_milestone_2_desc || DEFAULT_ABOUT_CONTENT.journey_milestone_2_desc,
    journey_milestone_3_year: content.journey_milestone_3_year || DEFAULT_ABOUT_CONTENT.journey_milestone_3_year,
    journey_milestone_3_title: content.journey_milestone_3_title || DEFAULT_ABOUT_CONTENT.journey_milestone_3_title,
    journey_milestone_3_desc: content.journey_milestone_3_desc || DEFAULT_ABOUT_CONTENT.journey_milestone_3_desc,
    journey_milestone_4_year: content.journey_milestone_4_year || DEFAULT_ABOUT_CONTENT.journey_milestone_4_year,
    journey_milestone_4_title: content.journey_milestone_4_title || DEFAULT_ABOUT_CONTENT.journey_milestone_4_title,
    journey_milestone_4_desc: content.journey_milestone_4_desc || DEFAULT_ABOUT_CONTENT.journey_milestone_4_desc,
    foundation_title: content.foundation_title || DEFAULT_ABOUT_CONTENT.foundation_title,
    why_choose_about_badge: content.why_choose_about_badge || DEFAULT_ABOUT_CONTENT.why_choose_about_badge,
    why_choose_about_title: content.why_choose_about_title || DEFAULT_ABOUT_CONTENT.why_choose_about_title,
    why_choose_about_reason_1_title: content.why_choose_about_reason_1_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_1_title,
    why_choose_about_reason_1_desc: content.why_choose_about_reason_1_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_1_desc,
    why_choose_about_reason_2_title: content.why_choose_about_reason_2_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_2_title,
    why_choose_about_reason_2_desc: content.why_choose_about_reason_2_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_2_desc,
    why_choose_about_reason_3_title: content.why_choose_about_reason_3_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_3_title,
    why_choose_about_reason_3_desc: content.why_choose_about_reason_3_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_3_desc,
    why_choose_about_reason_4_title: content.why_choose_about_reason_4_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_4_title,
    why_choose_about_reason_4_desc: content.why_choose_about_reason_4_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_4_desc,
    why_choose_about_reason_5_title: content.why_choose_about_reason_5_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_5_title,
    why_choose_about_reason_5_desc: content.why_choose_about_reason_5_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_5_desc,
    why_choose_about_reason_6_title: content.why_choose_about_reason_6_title || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_6_title,
    why_choose_about_reason_6_desc: content.why_choose_about_reason_6_desc || DEFAULT_ABOUT_CONTENT.why_choose_about_reason_6_desc,
    leadership_quote_badge: content.leadership_quote_badge || DEFAULT_ABOUT_CONTENT.leadership_quote_badge,
    leadership_quote_text: content.leadership_quote_text || DEFAULT_ABOUT_CONTENT.leadership_quote_text,
    leadership_quote_author_name: content.leadership_quote_author_name || DEFAULT_ABOUT_CONTENT.leadership_quote_author_name,
    leadership_quote_author_title: content.leadership_quote_author_title || DEFAULT_ABOUT_CONTENT.leadership_quote_author_title,
    profile_title: content.profile_title || DEFAULT_ABOUT_CONTENT.profile_title,
    profile_entity_label: content.profile_entity_label || DEFAULT_ABOUT_CONTENT.profile_entity_label,
    profile_entity_value: content.profile_entity_value || DEFAULT_ABOUT_CONTENT.profile_entity_value,
    profile_sector_label: content.profile_sector_label || DEFAULT_ABOUT_CONTENT.profile_sector_label,
    profile_sector_value: content.profile_sector_value || DEFAULT_ABOUT_CONTENT.profile_sector_value,
    profile_compliance_label: content.profile_compliance_label || DEFAULT_ABOUT_CONTENT.profile_compliance_label,
    profile_compliance_value: content.profile_compliance_value || DEFAULT_ABOUT_CONTENT.profile_compliance_value,
    partnership_badge: content.partnership_badge || DEFAULT_ABOUT_CONTENT.partnership_badge,
    partnership_title: content.partnership_title || DEFAULT_ABOUT_CONTENT.partnership_title,
    partnership_description: content.partnership_description || DEFAULT_ABOUT_CONTENT.partnership_description,
    partnership_service_1_title: content.partnership_service_1_title || DEFAULT_ABOUT_CONTENT.partnership_service_1_title,
    partnership_service_1_desc: content.partnership_service_1_desc || DEFAULT_ABOUT_CONTENT.partnership_service_1_desc,
    partnership_service_2_title: content.partnership_service_2_title || DEFAULT_ABOUT_CONTENT.partnership_service_2_title,
    partnership_service_2_desc: content.partnership_service_2_desc || DEFAULT_ABOUT_CONTENT.partnership_service_2_desc,
    partnership_service_3_title: content.partnership_service_3_title || DEFAULT_ABOUT_CONTENT.partnership_service_3_title,
    partnership_service_3_desc: content.partnership_service_3_desc || DEFAULT_ABOUT_CONTENT.partnership_service_3_desc,
    partnership_service_4_title: content.partnership_service_4_title || DEFAULT_ABOUT_CONTENT.partnership_service_4_title,
    partnership_service_4_desc: content.partnership_service_4_desc || DEFAULT_ABOUT_CONTENT.partnership_service_4_desc,
    partnership_footer_text: content.partnership_footer_text || DEFAULT_ABOUT_CONTENT.partnership_footer_text,
    partnership_cta_status: content.partnership_cta_status || DEFAULT_ABOUT_CONTENT.partnership_cta_status,
    partnership_cta_start: content.partnership_cta_start || DEFAULT_ABOUT_CONTENT.partnership_cta_start,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches services page content with proper typing and fallback to defaults
 */
export async function getServicesContent(): Promise<ServicesContent> {
  const content = await getPageContent('services')
  
  return {
    hero_title: content.hero_title || DEFAULT_SERVICES_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_SERVICES_CONTENT.hero_subtitle,
    services_page_badge: content.services_page_badge || DEFAULT_SERVICES_CONTENT.services_page_badge,
    cta_title: content.cta_title || DEFAULT_SERVICES_CONTENT.cta_title,
    cta_description: content.cta_description || DEFAULT_SERVICES_CONTENT.cta_description,
    cta_button: content.cta_button || DEFAULT_SERVICES_CONTENT.cta_button,
    
    // Service 1
    service_1_title: content.service_1_title || DEFAULT_SERVICES_CONTENT.service_1_title,
    service_1_description: content.service_1_description || DEFAULT_SERVICES_CONTENT.service_1_description,
    service_1_feature_1: content.service_1_feature_1 || DEFAULT_SERVICES_CONTENT.service_1_feature_1,
    service_1_feature_2: content.service_1_feature_2 || DEFAULT_SERVICES_CONTENT.service_1_feature_2,
    service_1_feature_3: content.service_1_feature_3 || DEFAULT_SERVICES_CONTENT.service_1_feature_3,
    service_1_feature_4: content.service_1_feature_4 || DEFAULT_SERVICES_CONTENT.service_1_feature_4,
    
    // Service 2
    service_2_title: content.service_2_title || DEFAULT_SERVICES_CONTENT.service_2_title,
    service_2_description: content.service_2_description || DEFAULT_SERVICES_CONTENT.service_2_description,
    service_2_feature_1: content.service_2_feature_1 || DEFAULT_SERVICES_CONTENT.service_2_feature_1,
    service_2_feature_2: content.service_2_feature_2 || DEFAULT_SERVICES_CONTENT.service_2_feature_2,
    service_2_feature_3: content.service_2_feature_3 || DEFAULT_SERVICES_CONTENT.service_2_feature_3,
    service_2_feature_4: content.service_2_feature_4 || DEFAULT_SERVICES_CONTENT.service_2_feature_4,
    
    // Service 3
    service_3_title: content.service_3_title || DEFAULT_SERVICES_CONTENT.service_3_title,
    service_3_description: content.service_3_description || DEFAULT_SERVICES_CONTENT.service_3_description,
    service_3_feature_1: content.service_3_feature_1 || DEFAULT_SERVICES_CONTENT.service_3_feature_1,
    service_3_feature_2: content.service_3_feature_2 || DEFAULT_SERVICES_CONTENT.service_3_feature_2,
    service_3_feature_3: content.service_3_feature_3 || DEFAULT_SERVICES_CONTENT.service_3_feature_3,
    service_3_feature_4: content.service_3_feature_4 || DEFAULT_SERVICES_CONTENT.service_3_feature_4,
    
    // Service 4
    service_4_title: content.service_4_title || DEFAULT_SERVICES_CONTENT.service_4_title,
    service_4_description: content.service_4_description || DEFAULT_SERVICES_CONTENT.service_4_description,
    service_4_feature_1: content.service_4_feature_1 || DEFAULT_SERVICES_CONTENT.service_4_feature_1,
    service_4_feature_2: content.service_4_feature_2 || DEFAULT_SERVICES_CONTENT.service_4_feature_2,
    service_4_feature_3: content.service_4_feature_3 || DEFAULT_SERVICES_CONTENT.service_4_feature_3,
    service_4_feature_4: content.service_4_feature_4 || DEFAULT_SERVICES_CONTENT.service_4_feature_4,
    
    // Service 5
    service_5_title: content.service_5_title || DEFAULT_SERVICES_CONTENT.service_5_title,
    service_5_description: content.service_5_description || DEFAULT_SERVICES_CONTENT.service_5_description,
    service_5_feature_1: content.service_5_feature_1 || DEFAULT_SERVICES_CONTENT.service_5_feature_1,
    service_5_feature_2: content.service_5_feature_2 || DEFAULT_SERVICES_CONTENT.service_5_feature_2,
    service_5_feature_3: content.service_5_feature_3 || DEFAULT_SERVICES_CONTENT.service_5_feature_3,
    service_5_feature_4: content.service_5_feature_4 || DEFAULT_SERVICES_CONTENT.service_5_feature_4,
    
    // Service 6
    service_6_title: content.service_6_title || DEFAULT_SERVICES_CONTENT.service_6_title,
    service_6_description: content.service_6_description || DEFAULT_SERVICES_CONTENT.service_6_description,
    service_6_feature_1: content.service_6_feature_1 || DEFAULT_SERVICES_CONTENT.service_6_feature_1,
    service_6_feature_2: content.service_6_feature_2 || DEFAULT_SERVICES_CONTENT.service_6_feature_2,
    service_6_feature_3: content.service_6_feature_3 || DEFAULT_SERVICES_CONTENT.service_6_feature_3,
    service_6_feature_4: content.service_6_feature_4 || DEFAULT_SERVICES_CONTENT.service_6_feature_4,
    
    // Service 7
    service_7_title: content.service_7_title || DEFAULT_SERVICES_CONTENT.service_7_title,
    service_7_description: content.service_7_description || DEFAULT_SERVICES_CONTENT.service_7_description,
    service_7_feature_1: content.service_7_feature_1 || DEFAULT_SERVICES_CONTENT.service_7_feature_1,
    service_7_feature_2: content.service_7_feature_2 || DEFAULT_SERVICES_CONTENT.service_7_feature_2,
    service_7_feature_3: content.service_7_feature_3 || DEFAULT_SERVICES_CONTENT.service_7_feature_3,
    service_7_feature_4: content.service_7_feature_4 || DEFAULT_SERVICES_CONTENT.service_7_feature_4,
    
    // Service 8
    service_8_title: content.service_8_title || DEFAULT_SERVICES_CONTENT.service_8_title,
    service_8_description: content.service_8_description || DEFAULT_SERVICES_CONTENT.service_8_description,
    service_8_feature_1: content.service_8_feature_1 || DEFAULT_SERVICES_CONTENT.service_8_feature_1,
    service_8_feature_2: content.service_8_feature_2 || DEFAULT_SERVICES_CONTENT.service_8_feature_2,
    service_8_feature_3: content.service_8_feature_3 || DEFAULT_SERVICES_CONTENT.service_8_feature_3,
    service_8_feature_4: content.service_8_feature_4 || DEFAULT_SERVICES_CONTENT.service_8_feature_4,
    
    process_badge: content.process_badge || DEFAULT_SERVICES_CONTENT.process_badge,
    process_title: content.process_title || DEFAULT_SERVICES_CONTENT.process_title,
    process_subtitle: content.process_subtitle || DEFAULT_SERVICES_CONTENT.process_subtitle,
    process_step_1_title: content.process_step_1_title || DEFAULT_SERVICES_CONTENT.process_step_1_title,
    process_step_1_desc: content.process_step_1_desc || DEFAULT_SERVICES_CONTENT.process_step_1_desc,
    process_step_2_title: content.process_step_2_title || DEFAULT_SERVICES_CONTENT.process_step_2_title,
    process_step_2_desc: content.process_step_2_desc || DEFAULT_SERVICES_CONTENT.process_step_2_desc,
    process_step_3_title: content.process_step_3_title || DEFAULT_SERVICES_CONTENT.process_step_3_title,
    process_step_3_desc: content.process_step_3_desc || DEFAULT_SERVICES_CONTENT.process_step_3_desc,
    process_step_4_title: content.process_step_4_title || DEFAULT_SERVICES_CONTENT.process_step_4_title,
    process_step_4_desc: content.process_step_4_desc || DEFAULT_SERVICES_CONTENT.process_step_4_desc,
    process_step_5_title: content.process_step_5_title || DEFAULT_SERVICES_CONTENT.process_step_5_title,
    process_step_5_desc: content.process_step_5_desc || DEFAULT_SERVICES_CONTENT.process_step_5_desc,
    process_step_6_title: content.process_step_6_title || DEFAULT_SERVICES_CONTENT.process_step_6_title,
    process_step_6_desc: content.process_step_6_desc || DEFAULT_SERVICES_CONTENT.process_step_6_desc,
    status_title: content.status_title || DEFAULT_SERVICES_CONTENT.status_title,
    status_description: content.status_description || DEFAULT_SERVICES_CONTENT.status_description,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches contact page content with proper typing and fallback to defaults
 */
export async function getContactContent(): Promise<ContactContent> {
  const content = await getPageContent('contact')
  
  return {
    hero_title: content.hero_title || DEFAULT_CONTACT_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_CONTACT_CONTENT.hero_subtitle,
    contact_badge: content.contact_badge || DEFAULT_CONTACT_CONTENT.contact_badge,
    form_title: content.form_title || DEFAULT_CONTACT_CONTENT.form_title,
    form_description: content.form_description || DEFAULT_CONTACT_CONTENT.form_description,
    info_title: content.info_title || DEFAULT_CONTACT_CONTENT.info_title,
    info_description: content.info_description || DEFAULT_CONTACT_CONTENT.info_description,
    form_label_name: content.form_label_name || DEFAULT_CONTACT_CONTENT.form_label_name,
    form_label_email: content.form_label_email || DEFAULT_CONTACT_CONTENT.form_label_email,
    form_label_phone: content.form_label_phone || DEFAULT_CONTACT_CONTENT.form_label_phone,
    form_label_company: content.form_label_company || DEFAULT_CONTACT_CONTENT.form_label_company,
    form_label_subject: content.form_label_subject || DEFAULT_CONTACT_CONTENT.form_label_subject,
    form_label_message: content.form_label_message || DEFAULT_CONTACT_CONTENT.form_label_message,
    form_placeholder_name: content.form_placeholder_name || DEFAULT_CONTACT_CONTENT.form_placeholder_name,
    form_placeholder_email: content.form_placeholder_email || DEFAULT_CONTACT_CONTENT.form_placeholder_email,
    form_placeholder_phone: content.form_placeholder_phone || DEFAULT_CONTACT_CONTENT.form_placeholder_phone,
    form_placeholder_company: content.form_placeholder_company || DEFAULT_CONTACT_CONTENT.form_placeholder_company,
    form_placeholder_subject: content.form_placeholder_subject || DEFAULT_CONTACT_CONTENT.form_placeholder_subject,
    form_placeholder_message: content.form_placeholder_message || DEFAULT_CONTACT_CONTENT.form_placeholder_message,
    contact_email: content.contact_email || DEFAULT_CONTACT_CONTENT.contact_email,
    contact_phone: content.contact_phone || DEFAULT_CONTACT_CONTENT.contact_phone,
    contact_address: content.contact_address || DEFAULT_CONTACT_CONTENT.contact_address,
    contact_hours: content.contact_hours || DEFAULT_CONTACT_CONTENT.contact_hours,
    contact_linkedin: content.contact_linkedin || DEFAULT_CONTACT_CONTENT.contact_linkedin,
    contact_github: content.contact_github || DEFAULT_CONTACT_CONTENT.contact_github,
    contact_twitter: content.contact_twitter || DEFAULT_CONTACT_CONTENT.contact_twitter,
    contact_instagram: content.contact_instagram || DEFAULT_CONTACT_CONTENT.contact_instagram,
    media_email: content.media_email || DEFAULT_CONTACT_CONTENT.media_email,
    cto_email: content.cto_email || DEFAULT_CONTACT_CONTENT.cto_email,
    hr_team_email: content.hr_team_email || DEFAULT_CONTACT_CONTENT.hr_team_email,
    noreplay_email: content.noreplay_email || DEFAULT_CONTACT_CONTENT.noreplay_email,
    complaint_title: content.complaint_title || DEFAULT_CONTACT_CONTENT.complaint_title,
    complaint_description: content.complaint_description || DEFAULT_CONTACT_CONTENT.complaint_description,
    complaint_email: content.complaint_email || DEFAULT_CONTACT_CONTENT.complaint_email,
    complaint_phone: content.complaint_phone || DEFAULT_CONTACT_CONTENT.complaint_phone,
    complaint_form_title: content.complaint_form_title || DEFAULT_CONTACT_CONTENT.complaint_form_title,
    complaint_form_description: content.complaint_form_description || DEFAULT_CONTACT_CONTENT.complaint_form_description,
    complaint_submit_button: content.complaint_submit_button || DEFAULT_CONTACT_CONTENT.complaint_submit_button,
    status_check_title: content.status_check_title || DEFAULT_CONTACT_CONTENT.status_check_title,
    status_check_description: content.status_check_description || DEFAULT_CONTACT_CONTENT.status_check_description,
    status_check_button: content.status_check_button || DEFAULT_CONTACT_CONTENT.status_check_button,
    status_check_placeholder: content.status_check_placeholder || DEFAULT_CONTACT_CONTENT.status_check_placeholder,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches projects page content with proper typing and fallback to defaults
 */
export async function getProjectsContent(): Promise<ProjectsContent> {
  const content = await getPageContent('projects')
  
  return {
    hero_title: content.hero_title || DEFAULT_PROJECTS_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_PROJECTS_CONTENT.hero_subtitle,
    projects_badge: content.projects_badge || DEFAULT_PROJECTS_CONTENT.projects_badge,
    filter_all: content.filter_all || DEFAULT_PROJECTS_CONTENT.filter_all,
    filter_featured: content.filter_featured || DEFAULT_PROJECTS_CONTENT.filter_featured,
    stats_title: content.stats_title || DEFAULT_PROJECTS_CONTENT.stats_title,
    stats_total_label: content.stats_total_label || DEFAULT_PROJECTS_CONTENT.stats_total_label,
    stats_total_value: content.stats_total_value || DEFAULT_PROJECTS_CONTENT.stats_total_value,
    stats_active_label: content.stats_active_label || DEFAULT_PROJECTS_CONTENT.stats_active_label,
    stats_active_value: content.stats_active_value || DEFAULT_PROJECTS_CONTENT.stats_active_value,
    stats_community_label: content.stats_community_label || DEFAULT_PROJECTS_CONTENT.stats_community_label,
    stats_community_value: content.stats_community_value || DEFAULT_PROJECTS_CONTENT.stats_community_value,
    stats_quality_label: content.stats_quality_label || DEFAULT_PROJECTS_CONTENT.stats_quality_label,
    stats_quality_value: content.stats_quality_value || DEFAULT_PROJECTS_CONTENT.stats_quality_value,
    button_view_all: content.button_view_all || DEFAULT_PROJECTS_CONTENT.button_view_all,
    button_load_more: content.button_load_more || DEFAULT_PROJECTS_CONTENT.button_load_more,
    empty_state_message: content.empty_state_message || DEFAULT_PROJECTS_CONTENT.empty_state_message,
    cta_title: content.cta_title || DEFAULT_PROJECTS_CONTENT.cta_title,
    cta_description: content.cta_description || DEFAULT_PROJECTS_CONTENT.cta_description,
    cta_button: content.cta_button || DEFAULT_PROJECTS_CONTENT.cta_button,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches team page content with proper typing and fallback to defaults
 */
export async function getTeamContent(): Promise<TeamContent> {
  const content = await getPageContent('team')
  
  return {
    hero_title: content.hero_title || DEFAULT_TEAM_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_TEAM_CONTENT.hero_subtitle,
    team_badge: content.team_badge || DEFAULT_TEAM_CONTENT.team_badge,
    management_title: content.management_title || DEFAULT_TEAM_CONTENT.management_title,
    management_description: content.management_description || DEFAULT_TEAM_CONTENT.management_description,
    management_badge: content.management_badge || DEFAULT_TEAM_CONTENT.management_badge,
    development_title: content.development_title || DEFAULT_TEAM_CONTENT.development_title,
    development_description: content.development_description || DEFAULT_TEAM_CONTENT.development_description,
    development_badge: content.development_badge || DEFAULT_TEAM_CONTENT.development_badge,
    empty_state_title: content.empty_state_title || DEFAULT_TEAM_CONTENT.empty_state_title,
    empty_state_description: content.empty_state_description || DEFAULT_TEAM_CONTENT.empty_state_description,
    company_contact_title: content.company_contact_title || DEFAULT_TEAM_CONTENT.company_contact_title,
    company_contact_description: content.company_contact_description || DEFAULT_TEAM_CONTENT.company_contact_description,
    company_contact_email: content.company_contact_email || DEFAULT_TEAM_CONTENT.company_contact_email,
    company_contact_email_label: content.company_contact_email_label || DEFAULT_TEAM_CONTENT.company_contact_email_label,
    company_contact_linkedin: content.company_contact_linkedin || DEFAULT_TEAM_CONTENT.company_contact_linkedin,
    company_contact_linkedin_label: content.company_contact_linkedin_label || DEFAULT_TEAM_CONTENT.company_contact_linkedin_label,
    company_contact_github: content.company_contact_github || DEFAULT_TEAM_CONTENT.company_contact_github,
    company_contact_github_label: content.company_contact_github_label || DEFAULT_TEAM_CONTENT.company_contact_github_label,
    company_contact_whatsapp: content.company_contact_whatsapp || DEFAULT_TEAM_CONTENT.company_contact_whatsapp,
    company_contact_whatsapp_label: content.company_contact_whatsapp_label || DEFAULT_TEAM_CONTENT.company_contact_whatsapp_label,
    company_contact_button: content.company_contact_button || DEFAULT_TEAM_CONTENT.company_contact_button,
    join_cta_title: content.join_cta_title || DEFAULT_TEAM_CONTENT.join_cta_title,
    join_cta_description: content.join_cta_description || DEFAULT_TEAM_CONTENT.join_cta_description,
    join_cta_button: content.join_cta_button || DEFAULT_TEAM_CONTENT.join_cta_button,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Fetches careers page content with proper typing and fallback to defaults
 */
export async function getCareersContent(): Promise<CareersContent> {
  const content = await getPageContent('careers')
  
  return {
    hero_title: content.hero_title || DEFAULT_CAREERS_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_CAREERS_CONTENT.hero_subtitle,
    careers_badge: content.careers_badge || DEFAULT_CAREERS_CONTENT.careers_badge,
    positions_title: content.positions_title || DEFAULT_CAREERS_CONTENT.positions_title,
    no_positions_title: content.no_positions_title || DEFAULT_CAREERS_CONTENT.no_positions_title,
    no_positions_description: content.no_positions_description || DEFAULT_CAREERS_CONTENT.no_positions_description,
    feature_1: content.feature_1 || DEFAULT_CAREERS_CONTENT.feature_1,
    feature_2: content.feature_2 || DEFAULT_CAREERS_CONTENT.feature_2,
    feature_3: content.feature_3 || DEFAULT_CAREERS_CONTENT.feature_3,
    job_label_location: content.job_label_location || DEFAULT_CAREERS_CONTENT.job_label_location,
    job_label_salary: content.job_label_salary || DEFAULT_CAREERS_CONTENT.job_label_salary,
    job_label_posted: content.job_label_posted || DEFAULT_CAREERS_CONTENT.job_label_posted,
    job_button_apply: content.job_button_apply || DEFAULT_CAREERS_CONTENT.job_button_apply,
    job_button_closed: content.job_button_closed || DEFAULT_CAREERS_CONTENT.job_button_closed,
    cta_footer_title: content.cta_footer_title || DEFAULT_CAREERS_CONTENT.cta_footer_title,
    cta_footer_description: content.cta_footer_description || DEFAULT_CAREERS_CONTENT.cta_footer_description,
    cta_footer_button: content.cta_footer_button || DEFAULT_CAREERS_CONTENT.cta_footer_button,
    disabled_title: content.disabled_title || DEFAULT_CAREERS_CONTENT.disabled_title,
    disabled_description: content.disabled_description || DEFAULT_CAREERS_CONTENT.disabled_description,
    disabled_button: content.disabled_button || DEFAULT_CAREERS_CONTENT.disabled_button,
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    meta_keywords: content.meta_keywords
  }
}

/**
 * Returns metadata for all pages including last updated time and field count
 */
export async function getAllPagesMetadata(): Promise<PageMetadata[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('page_content')
      .select('page_slug, updated_at')
      .eq('is_active', true)
    
    if (error) {
      console.error('Error fetching pages metadata:', error)
      return []
    }
    
    if (!data || data.length === 0) {
      console.warn('No page content found in database')
      return []
    }
    
    // Group by page_slug and aggregate
    const pageMap = new Map<string, { lastUpdated: Date; count: number }>()
    
    data.forEach(row => {
      const existing = pageMap.get(row.page_slug)
      const rowDate = new Date(row.updated_at)
      
      if (!existing) {
        pageMap.set(row.page_slug, {
          lastUpdated: rowDate,
          count: 1
        })
      } else {
        existing.count += 1
        if (rowDate > existing.lastUpdated) {
          existing.lastUpdated = rowDate
        }
      }
    })
    
    // Convert to array of PageMetadata
    const metadata: PageMetadata[] = []
    pageMap.forEach((value, slug) => {
      metadata.push({
        slug,
        lastUpdated: value.lastUpdated.toISOString(),
        contentFields: value.count
      })
    })
    
    // Sort by slug for consistent ordering
    metadata.sort((a, b) => a.slug.localeCompare(b.slug))
    
    return metadata
  } catch (error) {
    console.error('Exception fetching pages metadata:', error)
    return []
  }
}

// ============================================
// Schedule Page Content
// ============================================

export interface ScheduleContent {
  // Page heading section
  hero_badge: string
  hero_title: string
  hero_subtitle: string

  // Sidebar info card
  call_type_title: string
  call_type_duration: string
  call_feature_1: string
  call_feature_2: string
  call_feature_3: string

  // Urgent contact box
  urgent_title: string
  urgent_description: string

  // SEO
  meta_title?: string
  meta_description?: string
}

const DEFAULT_SCHEDULE_CONTENT: ScheduleContent = {
  hero_badge: 'Consultation',
  hero_title: 'Schedule a Consultation Call',
  hero_subtitle:
    'Book a free 30-minute consultation with our experts to discuss your project requirements and how we can help.',

  call_type_title: 'Consultation Call',
  call_type_duration: '30 min • Video Call',
  call_feature_1: 'Project requirements analysis',
  call_feature_2: 'Technical feasibility discussion',
  call_feature_3: 'Timeline and budget estimation',

  urgent_title: 'Need a faster response?',
  urgent_description: 'Call us directly or send an email for urgent inquiries.',
}

/**
 * Fetches schedule page content with proper typing and fallback to defaults.
 */
export async function getScheduleContent(): Promise<ScheduleContent> {
  const content = await getPageContent('schedule')

  return {
    hero_badge: content.hero_badge || DEFAULT_SCHEDULE_CONTENT.hero_badge,
    hero_title: content.hero_title || DEFAULT_SCHEDULE_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_SCHEDULE_CONTENT.hero_subtitle,

    call_type_title: content.call_type_title || DEFAULT_SCHEDULE_CONTENT.call_type_title,
    call_type_duration: content.call_type_duration || DEFAULT_SCHEDULE_CONTENT.call_type_duration,
    call_feature_1: content.call_feature_1 || DEFAULT_SCHEDULE_CONTENT.call_feature_1,
    call_feature_2: content.call_feature_2 || DEFAULT_SCHEDULE_CONTENT.call_feature_2,
    call_feature_3: content.call_feature_3 || DEFAULT_SCHEDULE_CONTENT.call_feature_3,

    urgent_title: content.urgent_title || DEFAULT_SCHEDULE_CONTENT.urgent_title,
    urgent_description: content.urgent_description || DEFAULT_SCHEDULE_CONTENT.urgent_description,

    meta_title: content.meta_title,
    meta_description: content.meta_description,
  }
}

// ============================================
// Book-Consult Page Content
// ============================================

export interface BookConsultContent {
  // Hero
  hero_badge: string
  hero_title: string
  hero_subtitle: string

  // "What to Expect" section
  expect_section_title: string
  expect_section_subtitle: string
  expect_step_1_title: string
  expect_step_1_desc: string
  expect_step_2_title: string
  expect_step_2_desc: string
  expect_step_3_title: string
  expect_step_3_desc: string

  // "Free Consultation" detail section
  consult_title: string
  benefit_1_title: string
  benefit_1_desc: string
  benefit_2_title: string
  benefit_2_desc: string
  benefit_3_title: string
  benefit_3_desc: string
  benefit_4_title: string
  benefit_4_desc: string

  // Schedule card
  card_title: string
  card_subtitle: string
  card_btn_schedule: string
  card_btn_inquiry: string

  // "Why Choose Us" section
  why_section_title: string
  stat_1_title: string
  stat_1_desc: string
  stat_2_title: string
  stat_2_desc: string
  stat_3_title: string
  stat_3_desc: string
  stat_4_title: string
  stat_4_desc: string

  // CTA section
  cta_title: string
  cta_subtitle: string
  cta_btn_primary: string
  cta_btn_secondary: string

  // SEO
  meta_title?: string
  meta_description?: string
}

const DEFAULT_BOOK_CONSULT_CONTENT: BookConsultContent = {
  hero_badge: "Let's Talk",
  hero_title: 'Book a Consultation',
  hero_subtitle:
    "Schedule a free consultation with our expert team. We'll discuss your project requirements, technical challenges, and explore how we can help bring your vision to life.",

  expect_section_title: 'What to Expect',
  expect_section_subtitle:
    'Our consultation process is designed to understand your needs and provide actionable insights.',
  expect_step_1_title: '1. Discovery Call',
  expect_step_1_desc:
    "We'll start with a friendly conversation to understand your business goals, technical requirements, and project timeline.",
  expect_step_2_title: '2. Solution Design',
  expect_step_2_desc:
    'Our experts will propose tailored solutions, technology stack recommendations, and architecture designs suited to your needs.',
  expect_step_3_title: '3. Project Roadmap',
  expect_step_3_desc:
    "We'll create a detailed roadmap with milestones, timelines, and cost estimates to bring your project to life.",

  consult_title: 'Free 30-Minute Consultation',
  benefit_1_title: 'No Commitment Required',
  benefit_1_desc:
    'Our consultation is completely free with no strings attached. Get expert advice even if you decide not to work with us.',
  benefit_2_title: 'Expert Guidance',
  benefit_2_desc:
    'Meet with our senior engineers and technical leads who have years of experience building successful products.',
  benefit_3_title: 'Flexible Scheduling',
  benefit_3_desc:
    'Choose a time that works best for you. We offer consultations across different time zones to accommodate your schedule.',
  benefit_4_title: 'Actionable Insights',
  benefit_4_desc:
    'Walk away with clear next steps, technology recommendations, and a better understanding of your project scope.',

  card_title: 'Schedule Your Consultation',
  card_subtitle: "Choose how you'd like to get in touch with us.",
  card_btn_schedule: 'Schedule Consultation Now',
  card_btn_inquiry: 'Fill Service Inquiry Form',

  why_section_title: 'Why Work With Asrivo Tech?',
  stat_1_title: '2+ Projects Built',
  stat_1_desc: 'Proven track record of delivering successful digital products across industries.',
  stat_2_title: 'Expert Team',
  stat_2_desc: 'Skilled developers, designers, and technical leads with years of experience.',
  stat_3_title: 'Client-Centric',
  stat_3_desc: 'We prioritize your vision and work collaboratively to achieve your goals.',
  stat_4_title: 'Modern Stack',
  stat_4_desc: 'We use cutting-edge technologies to build fast, secure, and scalable solutions.',

  cta_title: 'Ready to Start Your Project?',
  cta_subtitle: "Let's turn your ideas into reality. Book your free consultation today.",
  cta_btn_primary: 'Book Now',
  cta_btn_secondary: 'View Our Team',
}

/**
 * Fetches book-consult page content with proper typing and fallback to defaults.
 */
export async function getBookConsultContent(): Promise<BookConsultContent> {
  const content = await getPageContent('book-consult')

  return {
    hero_badge: content.hero_badge || DEFAULT_BOOK_CONSULT_CONTENT.hero_badge,
    hero_title: content.hero_title || DEFAULT_BOOK_CONSULT_CONTENT.hero_title,
    hero_subtitle: content.hero_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.hero_subtitle,

    expect_section_title: content.expect_section_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_section_title,
    expect_section_subtitle: content.expect_section_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.expect_section_subtitle,
    expect_step_1_title: content.expect_step_1_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_1_title,
    expect_step_1_desc: content.expect_step_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_1_desc,
    expect_step_2_title: content.expect_step_2_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_2_title,
    expect_step_2_desc: content.expect_step_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_2_desc,
    expect_step_3_title: content.expect_step_3_title || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_3_title,
    expect_step_3_desc: content.expect_step_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.expect_step_3_desc,

    consult_title: content.consult_title || DEFAULT_BOOK_CONSULT_CONTENT.consult_title,
    benefit_1_title: content.benefit_1_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_1_title,
    benefit_1_desc: content.benefit_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_1_desc,
    benefit_2_title: content.benefit_2_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_2_title,
    benefit_2_desc: content.benefit_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_2_desc,
    benefit_3_title: content.benefit_3_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_3_title,
    benefit_3_desc: content.benefit_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_3_desc,
    benefit_4_title: content.benefit_4_title || DEFAULT_BOOK_CONSULT_CONTENT.benefit_4_title,
    benefit_4_desc: content.benefit_4_desc || DEFAULT_BOOK_CONSULT_CONTENT.benefit_4_desc,

    card_title: content.card_title || DEFAULT_BOOK_CONSULT_CONTENT.card_title,
    card_subtitle: content.card_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.card_subtitle,
    card_btn_schedule: content.card_btn_schedule || DEFAULT_BOOK_CONSULT_CONTENT.card_btn_schedule,
    card_btn_inquiry: content.card_btn_inquiry || DEFAULT_BOOK_CONSULT_CONTENT.card_btn_inquiry,

    why_section_title: content.why_section_title || DEFAULT_BOOK_CONSULT_CONTENT.why_section_title,
    stat_1_title: content.stat_1_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_1_title,
    stat_1_desc: content.stat_1_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_1_desc,
    stat_2_title: content.stat_2_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_2_title,
    stat_2_desc: content.stat_2_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_2_desc,
    stat_3_title: content.stat_3_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_3_title,
    stat_3_desc: content.stat_3_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_3_desc,
    stat_4_title: content.stat_4_title || DEFAULT_BOOK_CONSULT_CONTENT.stat_4_title,
    stat_4_desc: content.stat_4_desc || DEFAULT_BOOK_CONSULT_CONTENT.stat_4_desc,

    cta_title: content.cta_title || DEFAULT_BOOK_CONSULT_CONTENT.cta_title,
    cta_subtitle: content.cta_subtitle || DEFAULT_BOOK_CONSULT_CONTENT.cta_subtitle,
    cta_btn_primary: content.cta_btn_primary || DEFAULT_BOOK_CONSULT_CONTENT.cta_btn_primary,
    cta_btn_secondary: content.cta_btn_secondary || DEFAULT_BOOK_CONSULT_CONTENT.cta_btn_secondary,

    meta_title: content.meta_title,
    meta_description: content.meta_description,
  }
}
