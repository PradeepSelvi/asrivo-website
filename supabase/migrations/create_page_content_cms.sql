-- ============================================
-- COMPLETE CMS SYSTEM FOR ALL PAGES
-- ============================================
-- This creates a flexible content management system where admins
-- can edit content for any page through the admin panel

-- Drop existing table if needed
DROP TABLE IF EXISTS public.page_content CASCADE;

-- Create page_content table
CREATE TABLE public.page_content (
  id BIGSERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown', 'json', 'image_url')),
  display_label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);

-- Create indexes
CREATE INDEX idx_page_content_page_slug ON public.page_content(page_slug);
CREATE INDEX idx_page_content_active ON public.page_content(is_active);
CREATE INDEX idx_page_content_display_order ON public.page_content(display_order);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active content"
  ON public.page_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage content"
  ON public.page_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION update_page_content_updated_at();

-- Grant permissions
GRANT SELECT ON public.page_content TO anon;
GRANT ALL ON public.page_content TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.page_content_id_seq TO authenticated;

-- ============================================
-- INSERT DEFAULT CONTENT FOR ALL PAGES
-- ============================================

INSERT INTO public.page_content (page_slug, section_key, content_value, content_type, display_label, display_order) VALUES

-- ============================================
-- HOME PAGE
-- ============================================

-- Hero Section
('home', 'hero_title', 'Building Tomorrow''s Digital Solutions', 'text', 'Hero Title', 1),
('home', 'hero_subtitle', 'We transform ideas into powerful digital experiences through innovative software solutions.', 'text', 'Hero Subtitle', 2),
('home', 'hero_cta_primary', 'Start Your Project', 'text', 'Primary Button Text', 3),
('home', 'hero_cta_secondary', 'View Our Work', 'text', 'Secondary Button Text', 4),
('home', 'hero_status_badge', 'Enterprise Modular Architectures', 'text', 'Hero Status Badge', 5),
('home', 'hero_stat_services_label', 'Our Core Services', 'text', 'Hero Stat: Services Label', 6),
('home', 'hero_stat_services_value', '9', 'text', 'Hero Stat: Services Value', 7),
('home', 'hero_stat_reliability_label', 'System Reliability', 'text', 'Hero Stat: Reliability Label', 8),
('home', 'hero_stat_expertise_label', 'Technology Expertise', 'text', 'Hero Stat: Expertise Label', 9),
('home', 'hero_stat_expertise_value', '7+', 'text', 'Hero Stat: Expertise Value', 10),
('home', 'hero_stat_support_label', 'Live Support', 'text', 'Hero Stat: Support Label', 11),
('home', 'hero_stat_support_value', '24/7', 'text', 'Hero Stat: Support Value', 12),
('home', 'hero_scroll_text', 'Scroll to explore', 'text', 'Hero Scroll Text', 13),

-- Stats Section
('home', 'stats_projects', '2', 'text', 'Completed Projects', 20),
('home', 'stats_clients', '2', 'text', 'Happy Clients', 21),
('home', 'stats_team', '9', 'text', 'Team Members', 22),
('home', 'stats_experience', '1', 'text', 'Years of Experience', 23),

-- About Preview Section
('home', 'about_badge', 'Elite Engineering', 'text', 'About Preview Badge', 30),
('home', 'about_title', 'Why Choose Asrivo Tech', 'text', 'About Section Title', 31),
('home', 'about_description', 'We are a team of passionate developers and designers committed to delivering exceptional digital solutions that drive business growth.', 'text', 'About Description', 32),
('home', 'about_stats_services_label', 'Core Services', 'text', 'About Stat: Services Label', 33),
('home', 'about_stats_services_value', '9', 'text', 'About Stat: Services Value', 34),
('home', 'about_stats_services_desc', 'Comprehensive technology solutions for modern businesses.', 'text', 'About Stat: Services Description', 35),
('home', 'about_stats_support_label', 'Support Availability', 'text', 'About Stat: Support Label', 36),
('home', 'about_stats_support_value', '24/7', 'text', 'About Stat: Support Value', 37),
('home', 'about_stats_support_desc', 'Continuous assistance for seamless operations.', 'text', 'About Stat: Support Description', 38),
('home', 'about_stats_tech_label', 'Technology Stack', 'text', 'About Stat: Tech Label', 39),
('home', 'about_stats_tech_value', '10+', 'text', 'About Stat: Tech Value', 40),
('home', 'about_stats_tech_desc', 'Modern tools and frameworks powering solutions.', 'text', 'About Stat: Tech Description', 41),
('home', 'about_stats_reliability_label', 'System Reliability', 'text', 'About Stat: Reliability Label', 42),
('home', 'about_stats_reliability_value', '99%', 'text', 'About Stat: Reliability Value', 43),
('home', 'about_stats_reliability_desc', 'Stable infrastructure powering every service.', 'text', 'About Stat: Reliability Description', 44),
('home', 'about_feature_1', 'Next-Gen AI Integration', 'text', 'About Feature 1', 45),
('home', 'about_feature_2', 'Cloud-Native Architecture', 'text', 'About Feature 2', 46),
('home', 'about_feature_3', 'Zero-Trust Security', 'text', 'About Feature 3', 47),
('home', 'about_feature_4', 'Reliability Service', 'text', 'About Feature 4', 48),
('home', 'about_feature_5', 'High-Velocity DevOps', 'text', 'About Feature 5', 49),
('home', 'about_feature_6', 'Post-Launch Maintenance', 'text', 'About Feature 6', 50),
('home', 'about_cta_primary', 'View Our Work', 'text', 'About CTA Primary', 51),
('home', 'about_cta_secondary', 'Book a Consultation', 'text', 'About CTA Secondary', 52),
('home', 'about_availability_text', 'We are currently accepting new projects.', 'text', 'About Availability Text', 53),

-- Services Preview Section
('home', 'services_badge', 'Our Services', 'text', 'Services Preview Badge', 60),
('home', 'services_title', 'Comprehensive Technology Solutions', 'text', 'Services Preview Title', 61),
('home', 'services_subtitle', 'From concept to deployment, we offer end-to-end services to bring your digital vision to life.', 'text', 'Services Preview Subtitle', 62),
('home', 'services_cta', 'View All Services', 'text', 'Services Preview CTA', 63),

-- Why Choose Us Section
('home', 'why_choose_badge', 'Why Choose Us', 'text', 'Why Choose Badge', 70),
('home', 'why_choose_title', 'What Sets Us Apart', 'text', 'Why Choose Title', 71),
('home', 'why_choose_subtitle', 'We combine technical excellence with a client-first approach to deliver exceptional results.', 'text', 'Why Choose Subtitle', 72),
('home', 'why_choose_reason_1_title', 'Expert Team', 'text', 'Why Choose Reason 1 Title', 73),
('home', 'why_choose_reason_1_desc', 'Our team consists of highly skilled developers, designers, and strategists with proven track records in delivering complex projects.', 'text', 'Why Choose Reason 1 Description', 74),
('home', 'why_choose_reason_2_title', 'Secure & Scalable', 'text', 'Why Choose Reason 2 Title', 75),
('home', 'why_choose_reason_2_desc', 'We build solutions with enterprise-grade security and architecture that scales with your business growth.', 'text', 'Why Choose Reason 2 Description', 76),
('home', 'why_choose_reason_3_title', 'Agile Development', 'text', 'Why Choose Reason 3 Title', 77),
('home', 'why_choose_reason_3_desc', 'Our agile methodology ensures faster delivery, continuous feedback, and flexibility to adapt to changing requirements.', 'text', 'Why Choose Reason 3 Description', 78),
('home', 'why_choose_reason_4_title', 'Long-Term Support', 'text', 'Why Choose Reason 4 Title', 79),
('home', 'why_choose_reason_4_desc', 'We provide ongoing maintenance and support to ensure your solutions continue to perform optimally.', 'text', 'Why Choose Reason 4 Description', 80),

-- Featured Projects Section
('home', 'featured_projects_badge', 'Our Work', 'text', 'Featured Projects Badge', 90),
('home', 'featured_projects_title', 'Featured Projects', 'text', 'Featured Projects Title', 91),
('home', 'featured_projects_description', 'Explore our completed projects that showcase our expertise and innovation.', 'text', 'Featured Projects Description', 92),
('home', 'featured_projects_cta', 'View All Projects', 'text', 'Featured Projects CTA', 93),
('home', 'featured_projects_empty', 'No projects available yet. Check back soon!', 'text', 'Featured Projects Empty State', 94),

-- Team Preview Section
('home', 'team_badge', 'Our Team', 'text', 'Team Preview Badge', 100),
('home', 'team_title', 'Meet the Experts', 'text', 'Team Preview Title', 101),
('home', 'team_subtitle', 'Our talented team of 9 professionals is dedicated to delivering exceptional results.', 'text', 'Team Preview Subtitle', 102),

-- Testimonials Section
('home', 'testimonials_badge', 'Testimonials', 'text', 'Testimonials Badge', 110),
('home', 'testimonials_title', 'What Our Clients Say', 'text', 'Testimonials Title', 111),
('home', 'testimonials_subtitle', 'Hear from our satisfied clients about their experience working with Asrivo Tech.', 'text', 'Testimonials Subtitle', 112),

-- CTA Section
('home', 'cta_title', 'Ready to Build Something Amazing?', 'text', 'CTA Title', 120),
('home', 'cta_description', 'Let''s discuss your project and turn your vision into reality.', 'text', 'CTA Description', 121),
('home', 'cta_button', 'Get Started Today', 'text', 'CTA Button Text', 122),

-- ============================================
-- ABOUT PAGE
-- ============================================
('about', 'hero_title', 'About Asrivo Tech', 'text', 'Page Title', 1),
('about', 'hero_subtitle', 'Innovation Meets Excellence', 'text', 'Page Subtitle', 2),
('about', 'mission_title', 'Our Mission', 'text', 'Mission Title', 10),
('about', 'mission_description', 'To empower businesses through cutting-edge technology solutions that drive innovation and growth.', 'text', 'Mission Description', 11),
('about', 'vision_title', 'Our Vision', 'text', 'Vision Title', 12),
('about', 'vision_description', 'To be the most trusted technology partner for businesses worldwide, known for exceptional quality and innovation.', 'text', 'Vision Description', 13),
('about', 'values_title', 'Our Values', 'text', 'Values Title', 14),
('about', 'founded_year', '2025', 'text', 'Founded Year', 20),
('about', 'team_size', '9', 'text', 'Team Size', 21),
('about', 'projects_completed', '2', 'text', 'Projects Completed', 22),

-- Story Section
('about', 'story_badge', 'Who We Are', 'text', 'Story Badge', 23),
('about', 'story_title', 'Technology-Driven Innovation', 'text', 'Story Title', 24),
('about', 'story_description', 'Founded in August 2025, Asrivo Tech is a technology-driven company building innovative digital products while delivering reliable IT and Digital Marketing solutions. Our goal is to help businesses grow with smart technology, creativity, and quality services.', 'text', 'Story Description', 25),

-- Journey Timeline Section
('about', 'journey_title', 'Our Journey', 'text', 'Journey Title', 30),
('about', 'journey_milestone_1_year', '2025', 'text', 'Milestone 1 Year', 31),
('about', 'journey_milestone_1_title', 'Company Founded', 'text', 'Milestone 1 Title', 32),
('about', 'journey_milestone_1_desc', 'Asrivo Tech was established in August 2025 with a vision to transform businesses through innovative technology solutions.', 'text', 'Milestone 1 Description', 33),
('about', 'journey_milestone_2_year', '2025', 'text', 'Milestone 2 Year', 34),
('about', 'journey_milestone_2_title', 'First Client Projects', 'text', 'Milestone 2 Title', 35),
('about', 'journey_milestone_2_desc', 'Successfully delivered our first two projects, establishing our reputation for quality and reliability.', 'text', 'Milestone 2 Description', 36),
('about', 'journey_milestone_3_year', '2026', 'text', 'Milestone 3 Year', 37),
('about', 'journey_milestone_3_title', 'Team Growth', 'text', 'Milestone 3 Title', 38),
('about', 'journey_milestone_3_desc', 'Expanded our talented team to 9 professionals across development, design, and consulting.', 'text', 'Milestone 3 Description', 39),
('about', 'journey_milestone_4_year', '2026', 'text', 'Milestone 4 Year', 40),
('about', 'journey_milestone_4_title', 'Service Expansion', 'text', 'Milestone 4 Title', 41),
('about', 'journey_milestone_4_desc', 'Expanded our service offerings to include cloud consulting, data mining, and industrial automation.', 'text', 'Milestone 4 Description', 42),

-- Strategic Foundation Section
('about', 'foundation_title', 'Strategic Foundation', 'text', 'Foundation Title', 50),

-- Why Choose Us Section (About Page)
('about', 'why_choose_about_badge', 'Why Choose Us', 'text', 'Why Choose Badge', 60),
('about', 'why_choose_about_title', 'What Makes Us Different', 'text', 'Why Choose Title', 61),
('about', 'why_choose_about_reason_1_title', 'Innovation First', 'text', 'Reason 1 Title', 62),
('about', 'why_choose_about_reason_1_desc', 'We stay ahead of technology trends to deliver cutting-edge solutions.', 'text', 'Reason 1 Description', 63),
('about', 'why_choose_about_reason_2_title', 'Client Partnership', 'text', 'Reason 2 Title', 64),
('about', 'why_choose_about_reason_2_desc', 'We work closely with clients to understand and exceed their expectations.', 'text', 'Reason 2 Description', 65),
('about', 'why_choose_about_reason_3_title', 'Quality Assurance', 'text', 'Reason 3 Title', 66),
('about', 'why_choose_about_reason_3_desc', 'Rigorous testing ensures every solution meets the highest standards.', 'text', 'Reason 3 Description', 67),
('about', 'why_choose_about_reason_4_title', 'Transparent Communication', 'text', 'Reason 4 Title', 68),
('about', 'why_choose_about_reason_4_desc', 'Clear and honest communication throughout every project phase.', 'text', 'Reason 4 Description', 69),
('about', 'why_choose_about_reason_5_title', 'Proven Expertise', 'text', 'Reason 5 Title', 70),
('about', 'why_choose_about_reason_5_desc', 'Delivering successful projects across multiple industries since our founding.', 'text', 'Reason 5 Description', 71),
('about', 'why_choose_about_reason_6_title', 'Ongoing Support', 'text', 'Reason 6 Title', 72),
('about', 'why_choose_about_reason_6_desc', 'Comprehensive post-launch support and maintenance services.', 'text', 'Reason 6 Description', 73),

-- Leadership Quote Section
('about', 'leadership_quote_badge', 'Leadership', 'text', 'Leadership Badge', 80),
('about', 'leadership_quote_text', 'Our mission is to empower businesses through technology and innovation, building solutions that make a real difference.', 'text', 'Leadership Quote Text', 81),
('about', 'leadership_quote_author_name', 'Founder, Asrivo Tech', 'text', 'Quote Author Name', 82),
('about', 'leadership_quote_author_title', 'CEO & Founder', 'text', 'Quote Author Title', 83),

-- Company Profile Section
('about', 'profile_title', 'Company Profile', 'text', 'Profile Title', 90),
('about', 'profile_entity_label', 'Legal Entity', 'text', 'Profile Entity Label', 91),
('about', 'profile_entity_value', 'Asrivo Tech', 'text', 'Profile Entity Value', 92),
('about', 'profile_sector_label', 'Industry Sector', 'text', 'Profile Sector Label', 93),
('about', 'profile_sector_value', 'Information Technology & Services', 'text', 'Profile Sector Value', 94),
('about', 'profile_compliance_label', 'Founded', 'text', 'Profile Compliance Label', 95),
('about', 'profile_compliance_value', 'August 23, 2025', 'text', 'Profile Compliance Value', 96),

-- Partnership Section
('about', 'partnership_badge', 'Partnerships', 'text', 'Partnership Badge', 100),
('about', 'partnership_title', 'Strategic Partnerships', 'text', 'Partnership Title', 101),
('about', 'partnership_description', 'We collaborate with leading technology partners to deliver best-in-class solutions.', 'text', 'Partnership Description', 102),
('about', 'partnership_service_1_title', 'Cloud Infrastructure', 'text', 'Partnership Service 1 Title', 103),
('about', 'partnership_service_1_desc', 'AWS, Azure, Google Cloud partnerships for scalable infrastructure.', 'text', 'Partnership Service 1 Description', 104),
('about', 'partnership_service_2_title', 'Development Tools', 'text', 'Partnership Service 2 Title', 105),
('about', 'partnership_service_2_desc', 'Microsoft, JetBrains, and GitHub partnerships for development excellence.', 'text', 'Partnership Service 2 Description', 106),
('about', 'partnership_service_3_title', 'Security Solutions', 'text', 'Partnership Service 3 Title', 107),
('about', 'partnership_service_3_desc', 'Certified partnerships with leading cybersecurity providers.', 'text', 'Partnership Service 3 Description', 108),
('about', 'partnership_service_4_title', 'Analytics & AI', 'text', 'Partnership Service 4 Title', 109),
('about', 'partnership_service_4_desc', 'Partnerships with leading AI and analytics platforms.', 'text', 'Partnership Service 4 Description', 110),
('about', 'partnership_footer_text', 'Interested in partnering with us?', 'text', 'Partnership Footer Text', 111),
('about', 'partnership_cta_status', 'Accepting Inquiries', 'text', 'Partnership CTA Status', 112),
('about', 'partnership_cta_start', 'Get in Touch', 'text', 'Partnership CTA Button', 113),

-- ============================================
-- SERVICES PAGE
-- ============================================
('services', 'hero_title', 'Our Services', 'text', 'Page Title', 1),
('services', 'hero_subtitle', 'Comprehensive technology solutions tailored to your business needs', 'text', 'Page Subtitle', 2),
('services', 'services_page_badge', 'Services', 'text', 'Page Badge', 3),
('services', 'cta_title', 'Ready to Get Started?', 'text', 'CTA Title', 30),
('services', 'cta_description', 'Let''s discuss how we can help you achieve your goals. All pricing is as per consultation.', 'text', 'CTA Description', 31),
('services', 'cta_button', 'Contact Us Today', 'text', 'CTA Button Text', 32),

-- Process Section
('services', 'process_badge', 'Our Process', 'text', 'Process Badge', 40),
('services', 'process_title', 'How We Work', 'text', 'Process Title', 41),
('services', 'process_subtitle', 'Our proven methodology ensures successful project delivery from concept to launch.', 'text', 'Process Subtitle', 42),
('services', 'process_step_1_title', 'Discovery & Planning', 'text', 'Process Step 1 Title', 43),
('services', 'process_step_1_desc', 'We analyze your requirements and create a detailed project roadmap.', 'text', 'Process Step 1 Description', 44),
('services', 'process_step_2_title', 'Design & Prototyping', 'text', 'Process Step 2 Title', 45),
('services', 'process_step_2_desc', 'Creating user-centric designs and interactive prototypes.', 'text', 'Process Step 2 Description', 46),
('services', 'process_step_3_title', 'Development', 'text', 'Process Step 3 Title', 47),
('services', 'process_step_3_desc', 'Building robust solutions using modern technologies and best practices.', 'text', 'Process Step 3 Description', 48),
('services', 'process_step_4_title', 'Testing & QA', 'text', 'Process Step 4 Title', 49),
('services', 'process_step_4_desc', 'Comprehensive testing to ensure quality and reliability.', 'text', 'Process Step 4 Description', 50),
('services', 'process_step_5_title', 'Deployment', 'text', 'Process Step 5 Title', 51),
('services', 'process_step_5_desc', 'Smooth deployment and launch of your solution.', 'text', 'Process Step 5 Description', 52),
('services', 'process_step_6_title', 'Support & Maintenance', 'text', 'Process Step 6 Title', 53),
('services', 'process_step_6_desc', 'Ongoing support and continuous improvement.', 'text', 'Process Step 6 Description', 54),

-- Status Section
('services', 'status_title', 'Currently Accepting Projects', 'text', 'Status Title', 60),
('services', 'status_description', 'We have availability for new projects. Contact us to get started.', 'text', 'Status Description', 61),

-- ============================================
-- CONTACT PAGE
-- ============================================
('contact', 'hero_title', 'Get in Touch', 'text', 'Page Title', 1),
('contact', 'hero_subtitle', 'Have a project in mind or want to learn more about our services? We''d love to hear from you.', 'text', 'Page Subtitle', 2),
('contact', 'contact_badge', 'Contact Us', 'text', 'Page Badge', 3),
('contact', 'form_title', 'Send Us a Message', 'text', 'Form Section Title', 10),
('contact', 'form_description', 'Fill out the form below and we''ll get back to you within 24 hours.', 'text', 'Form Description', 11),
('contact', 'info_title', 'Contact Information', 'text', 'Info Section Title', 20),
('contact', 'info_description', 'You can also reach us through any of the following channels.', 'text', 'Info Description', 21),

-- Form Labels
('contact', 'form_label_name', 'Full Name', 'text', 'Form Label: Name', 30),
('contact', 'form_label_email', 'Email Address', 'text', 'Form Label: Email', 31),
('contact', 'form_label_phone', 'Phone Number', 'text', 'Form Label: Phone', 32),
('contact', 'form_label_company', 'Company Name', 'text', 'Form Label: Company', 33),
('contact', 'form_label_subject', 'Subject', 'text', 'Form Label: Subject', 34),
('contact', 'form_label_message', 'Your Message', 'text', 'Form Label: Message', 35),
('contact', 'form_placeholder_name', 'John Doe', 'text', 'Form Placeholder: Name', 36),
('contact', 'form_placeholder_email', 'john@example.com', 'text', 'Form Placeholder: Email', 37),
('contact', 'form_placeholder_phone', '+91 XXXXX XXXXX', 'text', 'Form Placeholder: Phone', 38),
('contact', 'form_placeholder_company', 'Your Company', 'text', 'Form Placeholder: Company', 39),
('contact', 'form_placeholder_subject', 'Project Inquiry', 'text', 'Form Placeholder: Subject', 40),
('contact', 'form_placeholder_message', 'Tell us about your project...', 'text', 'Form Placeholder: Message', 41),

-- Contact Info (CORRECT company details)
('contact', 'contact_email', 'hello@asrivotech.com', 'text', 'Contact Email', 50),
('contact', 'contact_phone', '+91 99764 22558', 'text', 'Contact Phone', 51),
('contact', 'contact_address', 'India', 'text', 'Contact Address', 52),
('contact', 'contact_hours', 'Mon-Fri: 9AM-6PM IST', 'text', 'Contact Hours', 53),
('contact', 'contact_linkedin', 'https://linkedin.com/company/asrivotech', 'text', 'LinkedIn URL', 54),
('contact', 'contact_github', 'https://github.com/asrivotech', 'text', 'GitHub URL', 55),
('contact', 'contact_twitter', 'https://twitter.com/asrivotech', 'text', 'Twitter URL', 56),
('contact', 'contact_instagram', 'https://instagram.com/asrivotech', 'text', 'Instagram URL', 57),

-- Complaint Section
('contact', 'complaint_title', 'File a Complaint', 'text', 'Complaint Title', 60),
('contact', 'complaint_description', 'If you have concerns about our services, please let us know.', 'text', 'Complaint Description', 61),
('contact', 'complaint_email', 'complaints@asrivotech.com', 'text', 'Complaint Email', 62),
('contact', 'complaint_phone', '+91 99764 22558', 'text', 'Complaint Phone', 63),
('contact', 'complaint_form_title', 'Submit a Complaint', 'text', 'Complaint Form Title', 64),
('contact', 'complaint_form_description', 'We take all complaints seriously and will respond within 48 hours.', 'text', 'Complaint Form Description', 65),
('contact', 'complaint_submit_button', 'Submit Complaint', 'text', 'Complaint Submit Button', 66),

-- Status Check Section
('contact', 'status_check_title', 'Check Inquiry Status', 'text', 'Status Check Title', 70),
('contact', 'status_check_description', 'Enter your inquiry ID to check the status of your submission.', 'text', 'Status Check Description', 71),
('contact', 'status_check_button', 'Check Status', 'text', 'Status Check Button', 72),
('contact', 'status_check_placeholder', 'Enter Inquiry ID', 'text', 'Status Check Placeholder', 73),

-- ============================================
-- PROJECTS PAGE
-- ============================================
('projects', 'hero_title', 'Our Projects', 'text', 'Page Title', 1),
('projects', 'hero_subtitle', 'Explore our portfolio of completed projects and see how we''ve helped businesses transform digitally.', 'text', 'Page Subtitle', 2),
('projects', 'projects_badge', 'Portfolio', 'text', 'Page Badge', 3),
('projects', 'filter_all', 'All Projects', 'text', 'Filter: All Text', 10),
('projects', 'filter_featured', 'Featured', 'text', 'Filter: Featured Text', 11),

-- Stats Section
('projects', 'stats_title', 'Project Statistics', 'text', 'Stats Title', 20),
('projects', 'stats_total_label', 'Completed Projects', 'text', 'Stats Total Label', 21),
('projects', 'stats_total_value', '2', 'text', 'Stats Total Value', 22),
('projects', 'stats_active_label', 'Happy Clients', 'text', 'Stats Active Label', 23),
('projects', 'stats_active_value', '2', 'text', 'Stats Active Value', 24),

-- Buttons and Labels
('projects', 'button_view_all', 'View All Projects', 'text', 'Button: View All', 30),
('projects', 'button_load_more', 'Load More', 'text', 'Button: Load More', 31),
('projects', 'empty_state_message', 'No projects found matching your criteria.', 'text', 'Empty State Message', 32),

-- CTA Section
('projects', 'cta_title', 'Have a Project in Mind?', 'text', 'CTA Title', 40),
('projects', 'cta_description', 'Let''s discuss how we can bring your vision to life.', 'text', 'CTA Description', 41),
('projects', 'cta_button', 'Start Your Project', 'text', 'CTA Button', 42),

-- ============================================
-- TEAM PAGE
-- ============================================
('team', 'hero_title', 'Meet the Team Behind Asrivo Tech', 'text', 'Page Title', 1),
('team', 'hero_subtitle', 'Our 9-member team of professionals combines deep technical expertise with a passion for innovation.', 'text', 'Page Subtitle', 2),
('team', 'team_badge', 'Our Team', 'text', 'Page Badge', 3),
('team', 'management_title', 'Management Team', 'text', 'Management Section Title', 10),
('team', 'management_description', 'Experienced leaders guiding our vision and strategy for success.', 'text', 'Management Description', 11),
('team', 'management_badge', 'Leadership', 'text', 'Management Badge', 12),
('team', 'development_title', 'Our Technical Team', 'text', 'Development Section Title', 13),
('team', 'development_description', 'Meet the skilled developers building the next generation of digital solutions.', 'text', 'Development Description', 14),
('team', 'development_badge', 'Engineers', 'text', 'Development Badge', 15),

-- Empty State
('team', 'empty_state_title', 'No Team Members Yet', 'text', 'Empty State Title', 20),
('team', 'empty_state_description', 'We''re building our team. Check back soon!', 'text', 'Empty State Description', 21),

-- Company Contact Section
('team', 'company_contact_title', 'Connect With Us', 'text', 'Company Contact Title', 30),
('team', 'company_contact_description', 'Reach out to our team through any of these channels.', 'text', 'Company Contact Description', 31),
('team', 'company_contact_email', 'hello@asrivotech.com', 'text', 'Company Contact Email', 32),
('team', 'company_contact_email_label', 'Email Us', 'text', 'Company Contact Email Label', 33),
('team', 'company_contact_linkedin', 'https://linkedin.com/company/asrivotech', 'text', 'Company Contact LinkedIn', 34),
('team', 'company_contact_linkedin_label', 'LinkedIn', 'text', 'Company Contact LinkedIn Label', 35),
('team', 'company_contact_github', 'https://github.com/asrivotech', 'text', 'Company Contact GitHub', 36),
('team', 'company_contact_github_label', 'GitHub', 'text', 'Company Contact GitHub Label', 37),
('team', 'company_contact_whatsapp', 'https://wa.me/919976422558', 'text', 'Company Contact WhatsApp', 38),
('team', 'company_contact_whatsapp_label', 'WhatsApp', 'text', 'Company Contact WhatsApp Label', 39),
('team', 'company_contact_phone', '+91 99764 22558', 'text', 'Company Phone', 40),
('team', 'company_contact_button', 'Get in Touch', 'text', 'Company Contact Button', 41),

-- Join CTA Section
('team', 'join_cta_title', 'Want to Join Our Team?', 'text', 'Join CTA Title', 50),
('team', 'join_cta_description', 'We''re always looking for talented people to join our growing team.', 'text', 'Join CTA Description', 51),
('team', 'join_cta_button', 'View Open Positions', 'text', 'Join CTA Button', 52),

-- ============================================
-- CAREERS PAGE
-- ============================================
('careers', 'hero_title', 'Join Our Team at Asrivo Tech', 'text', 'Page Title', 1),
('careers', 'hero_subtitle', 'We''re a team of passionate builders crafting digital solutions that make a real difference.', 'text', 'Page Subtitle', 2),
('careers', 'careers_badge', 'Careers', 'text', 'Page Badge', 3),
('careers', 'positions_title', 'Open Positions', 'text', 'Positions Section Title', 10),
('careers', 'no_positions_title', 'No Open Positions Right Now', 'text', 'No Positions Title', 20),
('careers', 'no_positions_description', 'We don''t have any active openings at the moment, but we''re always interested in talented people.', 'text', 'No Positions Description', 21),
('careers', 'feature_1', 'Competitive Salary & Benefits', 'text', 'Feature 1', 30),
('careers', 'feature_2', 'Remote & Flexible Work', 'text', 'Feature 2', 31),
('careers', 'feature_3', 'Growth & Learning Opportunities', 'text', 'Feature 3', 32),
('careers', 'job_label_location', 'Location', 'text', 'Job Label: Location', 40),
('careers', 'job_label_salary', 'Salary', 'text', 'Job Label: Salary', 41),
('careers', 'job_label_posted', 'Posted', 'text', 'Job Label: Posted', 42),
('careers', 'job_button_apply', 'Apply Now', 'text', 'Job Button: Apply', 43),
('careers', 'job_button_closed', 'Position Closed', 'text', 'Job Button: Closed', 44),
('careers', 'cta_footer_title', 'Don''t See a Perfect Fit?', 'text', 'CTA Footer Title', 50),
('careers', 'cta_footer_description', 'We''re always looking for talented people. Send us your resume and we''ll keep you in mind for future opportunities.', 'text', 'CTA Footer Description', 51),
('careers', 'cta_footer_button', 'Send Resume', 'text', 'CTA Footer Button', 52),
('careers', 'disabled_title', 'Applications Paused', 'text', 'Disabled State Title', 60),
('careers', 'disabled_description', 'We are not currently accepting new applications. Please check back later.', 'text', 'Disabled State Description', 61),
('careers', 'disabled_button', 'Notify Me', 'text', 'Disabled State Button', 62);

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 
  page_slug,
  COUNT(*) as content_items
FROM public.page_content
GROUP BY page_slug
ORDER BY page_slug;
