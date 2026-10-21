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

// Service inquiry
export const serviceInquirySchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  service: z.string().max(100).optional(),
  service_type: z.string().max(100).optional(),
  budget: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  message: z.string().max(5000).optional(),
  project_description: z.string().max(5000).optional(),
  captchaToken: z.string().optional(),
})

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
