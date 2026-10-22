-- ============================================
-- ADD SERVICES PAGE CMS FIELDS
-- ============================================
-- This migration adds all 8 services with their titles, descriptions,
-- and features to the page_content table

-- Insert Services Page Content
INSERT INTO public.page_content (page_slug, section_key, content_value, content_type, display_label, display_order) VALUES
-- Service 1: Custom Software Development
('services', 'service_1_title', 'Custom Software Development', 'text', 'Service 1 Title', 200),
('services', 'service_1_description', 'We build tailored software solutions that address your unique business challenges. Our team delivers robust, scalable applications designed to streamline operations and drive growth with your specific needs in mind.', 'textarea', 'Service 1 Description', 201),
('services', 'service_1_feature_1', 'Enterprise Application development', 'text', 'Service 1 Feature 1', 202),
('services', 'service_1_feature_2', 'Modern System architecture design', 'text', 'Service 1 Feature 2', 203),
('services', 'service_1_feature_3', 'API development and integration', 'text', 'Service 1 Feature 3', 204),
('services', 'service_1_feature_4', 'Database design and optimization', 'text', 'Service 1 Feature 4', 205),

-- Service 2: Web Application Development
('services', 'service_2_title', 'Web Application Development', 'text', 'Service 2 Title', 210),
('services', 'service_2_description', 'Modern, responsive web applications that deliver exceptional user experiences across all devices. We use the latest technologies to build fast, secure, and scalable web solutions.', 'textarea', 'Service 2 Description', 211),
('services', 'service_2_feature_1', 'Progressive Web Apps (PWA)', 'text', 'Service 2 Feature 1', 212),
('services', 'service_2_feature_2', 'Single Page Applications (SPA)', 'text', 'Service 2 Feature 2', 213),
('services', 'service_2_feature_3', 'E-commerce platforms', 'text', 'Service 2 Feature 3', 214),
('services', 'service_2_feature_4', 'Content Management Systems', 'text', 'Service 2 Feature 4', 215),

-- Service 3: Mobile Application Development
('services', 'service_3_title', 'Mobile Application Development', 'text', 'Service 3 Title', 220),
('services', 'service_3_description', 'Native and cross-platform mobile applications for iOS and Android. We create intuitive, high-performance apps that engage users and drive business results.', 'textarea', 'Service 3 Description', 221),
('services', 'service_3_feature_1', 'iOS and Android native apps', 'text', 'Service 3 Feature 1', 222),
('services', 'service_3_feature_2', 'Cross-platform development (React Native, Flutter)', 'text', 'Service 3 Feature 2', 223),
('services', 'service_3_feature_3', 'Mobile UI/UX design', 'text', 'Service 3 Feature 3', 224),
('services', 'service_3_feature_4', 'App store optimization', 'text', 'Service 3 Feature 4', 225),

-- Service 4: Cloud & DevOps Solutions
('services', 'service_4_title', 'Cloud & DevOps Solutions', 'text', 'Service 4 Title', 230),
('services', 'service_4_description', 'Scalable cloud infrastructure and automated deployment pipelines. We help you leverage the full potential of cloud computing for efficiency and cost savings.', 'textarea', 'Service 4 Description', 231),
('services', 'service_4_feature_1', 'Cloud migration and strategy', 'text', 'Service 4 Feature 1', 232),
('services', 'service_4_feature_2', 'Infrastructure as Code (IaC)', 'text', 'Service 4 Feature 2', 233),
('services', 'service_4_feature_3', 'CI/CD pipeline implementation', 'text', 'Service 4 Feature 3', 234),
('services', 'service_4_feature_4', 'Kubernetes and container orchestration', 'text', 'Service 4 Feature 4', 235),

-- Service 5: Web Hosting
('services', 'service_5_title', 'Web Hosting', 'text', 'Service 5 Title', 240),
('services', 'service_5_description', 'Intelligent automation solutions powered by machine learning and artificial intelligence. Transform your business processes with smart, data-driven systems.', 'textarea', 'Service 5 Description', 241),
('services', 'service_5_feature_1', 'Machine learning model development', 'text', 'Service 5 Feature 1', 242),
('services', 'service_5_feature_2', 'Natural language processing', 'text', 'Service 5 Feature 2', 243),
('services', 'service_5_feature_3', 'Process automation (RPA)', 'text', 'Service 5 Feature 3', 244),
('services', 'service_5_feature_4', 'Predictive analytics', 'text', 'Service 5 Feature 4', 245),

-- Service 6: Enterprise IT Consulting
('services', 'service_6_title', 'Enterprise IT Consulting', 'text', 'Service 6 Title', 250),
('services', 'service_6_description', 'Strategic technology consulting to guide your digital transformation journey. Our experts help you make informed decisions and optimize your IT investments.', 'textarea', 'Service 6 Description', 251),
('services', 'service_6_feature_1', 'Digital transformation strategy', 'text', 'Service 6 Feature 1', 252),
('services', 'service_6_feature_2', 'Technology roadmap planning', 'text', 'Service 6 Feature 2', 253),
('services', 'service_6_feature_3', 'IT architecture assessment', 'text', 'Service 6 Feature 3', 254),
('services', 'service_6_feature_4', 'Vendor selection and management', 'text', 'Service 6 Feature 4', 255),

-- Service 7: Digital Marketing
('services', 'service_7_title', 'Digital Marketing', 'text', 'Service 7 Title', 260),
('services', 'service_7_description', 'Delivering result-driven digital marketing solutions to enhance brand visibility, generate quality leads, and accelerate business growth.', 'textarea', 'Service 7 Description', 261),
('services', 'service_7_feature_1', 'Search Engine Optimization (SEO) & Search Engine Marketing (SEM)', 'text', 'Service 7 Feature 1', 262),
('services', 'service_7_feature_2', 'Social Media Marketing & Paid Advertising (Meta, Instagram, LinkedIn, Google Ads)', 'text', 'Service 7 Feature 2', 263),
('services', 'service_7_feature_3', 'Branding & Content Marketing', 'text', 'Service 7 Feature 3', 264),
('services', 'service_7_feature_4', 'Lead Generation & Performance Marketing', 'text', 'Service 7 Feature 4', 265),

-- Service 8: Product Engineering
('services', 'service_8_title', 'Product Engineering', 'text', 'Service 8 Title', 270),
('services', 'service_8_description', 'End-to-end product development from concept to launch. We help startups and enterprises build innovative digital products that succeed in the market.', 'textarea', 'Service 8 Description', 271),
('services', 'service_8_feature_1', 'Product strategy and roadmapping', 'text', 'Service 8 Feature 1', 272),
('services', 'service_8_feature_2', 'MVP development', 'text', 'Service 8 Feature 2', 273),
('services', 'service_8_feature_3', 'Product scaling and optimization', 'text', 'Service 8 Feature 3', 274),
('services', 'service_8_feature_4', 'Technical due diligence', 'text', 'Service 8 Feature 4', 275)

ON CONFLICT (page_slug, section_key) 
DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  content_type = EXCLUDED.content_type,
  display_label = EXCLUDED.display_label,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
