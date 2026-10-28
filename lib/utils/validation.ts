import { z } from 'zod'

/**
 * Reusable validation schemas for API routes
 * Helps prevent injection attacks and invalid data
 */

// Safe linear-time email validation (CWE-1333 ReDoS mitigation)
// RFC 5321 max length is 254 chars. Disjoint token classes prevent catastrophic backtracking.
export const SAFE_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length < 5 || trimmed.length > 254) return false
  return SAFE_EMAIL_REGEX.test(trimmed)
}

// Email validation schema: bounds length first so oversized inputs never touch regex
export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .regex(SAFE_EMAIL_REGEX, 'Invalid email address format')

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  company: z.string().max(100).optional().nullable().or(z.literal('')),
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  subject: z.string().max(200).optional().nullable().or(z.literal('')),
  message: z.string().min(1).max(5000),
  type: z.string().max(50).optional().nullable(),
  captchaToken: z.string().optional().nullable(),
}).passthrough()

// Client inquiry / Service inquiry schema
export const clientInquirySchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  company: z.string().max(100).optional().nullable().or(z.literal('')),
  whatsapp: z.string().max(30).optional().nullable().or(z.literal('')),
  countryCode: z.string().max(10).optional().nullable(),
  whatsappCountryCode: z.string().max(10).optional().nullable(),
  preferredContact: z.string().max(50).optional().nullable(),
  preferred_contact: z.string().max(50).optional().nullable(),
  projectTypes: z.array(z.string()).optional(),
  project_types: z.array(z.string()).optional(),
  service: z.string().max(100).optional().nullable(),
  service_type: z.string().max(100).optional().nullable(),
  otherProjectType: z.string().max(200).optional().nullable().or(z.literal('')),
  other_project_type: z.string().max(200).optional().nullable().or(z.literal('')),
  projectDescription: z.string().max(10000).optional().nullable().or(z.literal('')),
  project_description: z.string().max(10000).optional().nullable().or(z.literal('')),
  message: z.string().max(10000).optional().nullable().or(z.literal('')),
  hasExisting: z.union([z.string(), z.boolean()]).optional().nullable(),
  has_existing: z.union([z.string(), z.boolean()]).optional().nullable(),
  existingLink: z.string().max(1000).optional().nullable().or(z.literal('')),
  existing_link: z.string().max(1000).optional().nullable().or(z.literal('')),
  targetPlatform: z.array(z.string()).optional().nullable(),
  target_platform: z.array(z.string()).optional().nullable(),
  keyFeatures: z.array(z.string()).optional().nullable(),
  key_features: z.array(z.string()).optional().nullable(),
  otherKeyFeature: z.string().max(200).optional().nullable().or(z.literal('')),
  other_key_feature: z.string().max(200).optional().nullable().or(z.literal('')),
  budgetRange: z.string().max(100).optional().nullable(),
  budget_range: z.string().max(100).optional().nullable(),
  budget: z.string().max(100).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  targetAudience: z.string().max(2000).optional().nullable().or(z.literal('')),
  target_audience: z.string().max(2000).optional().nullable().or(z.literal('')),
  painPoints: z.string().max(5000).optional().nullable().or(z.literal('')),
  pain_points: z.string().max(5000).optional().nullable().or(z.literal('')),
  referenceLinks: z.string().max(2000).optional().nullable().or(z.literal('')),
  reference_links: z.string().max(2000).optional().nullable().or(z.literal('')),
  hearAboutUs: z.string().max(200).optional().nullable().or(z.literal('')),
  hear_about_us: z.string().max(200).optional().nullable().or(z.literal('')),
  prdFileUrl: z.string().max(2000).optional().nullable().or(z.literal('')),
  prd_file_url: z.string().max(2000).optional().nullable().or(z.literal('')),
  prdFileName: z.string().max(500).optional().nullable().or(z.literal('')),
  prd_file_name: z.string().max(500).optional().nullable().or(z.literal('')),
  prdText: z.string().max(20000).optional().nullable().or(z.literal('')),
  prd_text: z.string().max(20000).optional().nullable().or(z.literal('')),
  captchaToken: z.string().optional().nullable(),
}).passthrough()

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
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().max(100).optional().nullable().or(z.literal('')),
  priority: z.string().max(50).optional().nullable().or(z.literal('')),
  proofDocumentUrl: z.string().max(1000).optional().nullable().or(z.literal('')),
  captchaToken: z.string().optional().nullable(),
}).passthrough()

// Job application
export const jobApplicationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  full_name: z.string().min(2).max(100).optional(),
  email: emailSchema,
  phone: z.string().max(30).optional().nullable().or(z.literal('')),
  job_id: z.union([z.string(), z.number()]).optional().nullable(),
  position_id: z.union([z.string(), z.number()]).optional().nullable(),
  job_title: z.string().optional().nullable().or(z.literal('')),
  job_posting_id: z.string().optional().nullable(),
  cover_letter: z.string().max(5000).optional().nullable().or(z.literal('')),
  resume_url: z.string().max(500).optional().nullable().or(z.literal('')),
  experience_years: z.union([z.number(), z.string()]).optional().nullable(),
  years_of_experience: z.union([z.number(), z.string()]).optional().nullable(),
  linkedin: z.string().max(500).optional().nullable().or(z.literal('')),
  linkedin_url: z.string().max(500).optional().nullable().or(z.literal('')),
  portfolio: z.string().max(500).optional().nullable().or(z.literal('')),
  portfolio_url: z.string().max(500).optional().nullable().or(z.literal('')),
  expected_salary: z.string().max(50).optional().nullable(),
  available_from: z.string().max(100).optional().nullable(),
  notice_period: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  willing_to_relocate: z.boolean().optional().nullable(),
  captchaToken: z.string().optional().nullable(),
}).passthrough()

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional().nullable(),
})

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'welcome123',
  'letmein123',
  'changeme123',
])

// Update password schema
export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      .refine(
        (val) => !COMMON_WEAK_PASSWORDS.has(val.toLowerCase()),
        'Password is too common. Please choose a more secure password.'
      ),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = updatePasswordSchema

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

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
