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
  message: z.string().min(10).max(5000),
  type: z.enum(['inquiry', 'support', 'partnership', 'feedback']).optional(),
})

// Service inquiry
export const serviceInquirySchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  service: z.string().min(1).max(100),
  budget: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  message: z.string().min(10).max(5000),
})

// Newsletter subscription
export const newsletterSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100).optional(),
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
})

// Schedule meeting
export const scheduleSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  brief: z.string().min(10).max(1000),
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
})

// Job application
export const jobApplicationSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: emailSchema,
  phone: z.string().max(20),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  job_posting_id: z.string().uuid(),
  cover_letter: z.string().min(50).max(5000),
  resume_url: z.string().url(),
  experience_years: z.number().int().min(0).max(50),
  expected_salary: z.string().max(50).optional(),
  notice_period: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
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
