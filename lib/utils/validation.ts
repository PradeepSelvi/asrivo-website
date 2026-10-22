import { z } from 'zod'

/**
 * Reusable validation schemas for API routes
 * Helps prevent injection attacks and invalid data
 */

// Email validation
export const emailSchema = z.string().email().min(5).max(255)

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
  type: z.enum(['inquiry', 'support', 'partnership', 'feedback']).optional(),
  captchaToken: z.string().optional(),
})

// Client inquiry / Service inquiry schema
export const clientInquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().min(5).max(30),
  company: z.string().max(100).optional().nullable(),
  whatsapp: z.string().max(30).optional().nullable(),
  countryCode: z.string().max(10).optional().nullable(),
  whatsappCountryCode: z.string().max(10).optional().nullable(),
  preferredContact: z.string().max(50).optional().nullable(),
  preferred_contact: z.string().max(50).optional().nullable(),
  projectTypes: z.array(z.string()).optional(),
  project_types: z.array(z.string()).optional(),
  service: z.string().max(100).optional().nullable(),
  service_type: z.string().max(100).optional().nullable(),
  otherProjectType: z.string().max(200).optional().nullable(),
  other_project_type: z.string().max(200).optional().nullable(),
  projectDescription: z.string().max(10000).optional().nullable(),
  project_description: z.string().max(10000).optional().nullable(),
  message: z.string().max(10000).optional().nullable(),
  hasExisting: z.union([z.string(), z.boolean()]).optional().nullable(),
  has_existing: z.union([z.string(), z.boolean()]).optional().nullable(),
  existingLink: z.string().max(1000).optional().nullable(),
  existing_link: z.string().max(1000).optional().nullable(),
  targetPlatform: z.array(z.string()).optional().nullable(),
  target_platform: z.array(z.string()).optional().nullable(),
  keyFeatures: z.array(z.string()).optional().nullable(),
  key_features: z.array(z.string()).optional().nullable(),
  otherKeyFeature: z.string().max(200).optional().nullable(),
  other_key_feature: z.string().max(200).optional().nullable(),
  budgetRange: z.string().max(100).optional().nullable(),
  budget_range: z.string().max(100).optional().nullable(),
  budget: z.string().max(100).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  targetAudience: z.string().max(2000).optional().nullable(),
  target_audience: z.string().max(2000).optional().nullable(),
  painPoints: z.string().max(5000).optional().nullable(),
  pain_points: z.string().max(5000).optional().nullable(),
  referenceLinks: z.string().max(2000).optional().nullable(),
  reference_links: z.string().max(2000).optional().nullable(),
  hearAboutUs: z.string().max(200).optional().nullable(),
  hear_about_us: z.string().max(200).optional().nullable(),
  prdFileUrl: z.string().max(2000).optional().nullable(),
  prd_file_url: z.string().max(2000).optional().nullable(),
  prdFileName: z.string().max(500).optional().nullable(),
  prd_file_name: z.string().max(500).optional().nullable(),
  prdText: z.string().max(20000).optional().nullable(),
  prd_text: z.string().max(20000).optional().nullable(),
  captchaToken: z.string().optional().nullable(),
})

export const serviceInquirySchema = clientInquirySchema

// Newsletter subscription
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100).optional(),
  captchaToken: z.string().optional(),
})

// Consultation booking
export const consultationSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  availability: z.string().min(1),
  preferredMode: z.enum(['video', 'phone', 'in-person']),
  message: z.string().max(1000).optional(),
  captchaToken: z.string().optional(),
})

// Schedule meeting
export const scheduleSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  service_type: z.string().max(100).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  brief: z.string().max(1000).optional(),
  message: z.string().max(1000).optional(),
  timezone: z.string().max(100).optional(),
  captchaToken: z.string().optional(),
})

// Complaint submission
export const complaintSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().max(20).optional(),
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  category: z.enum(['service', 'billing', 'technical', 'other']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  proofDocumentUrl: z.string().url().optional(),
  captchaToken: z.string().optional(),
})

// Job application
export const jobApplicationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  full_name: z.string().min(2).max(100).optional(),
  email: emailSchema,
  phone: z.string().max(20),
  job_id: z.string().optional(),
  job_title: z.string().optional(),
  job_posting_id: z.string().uuid().optional(),
  cover_letter: z.string().max(5000).optional().or(z.literal('')),
  resume_url: z.string().url().optional().or(z.literal('')),
  experience_years: z.number().int().min(0).max(50).optional(),
  years_of_experience: z.union([z.number(), z.string()]).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  expected_salary: z.string().max(50).optional(),
  available_from: z.string().max(100).optional(),
  notice_period: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  willing_to_relocate: z.boolean().optional(),
  captchaToken: z.string().optional(),
})

// Helper function to safely parse and validate
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      }
    }
    return { success: false, error: 'Invalid request data' }
  }
}
