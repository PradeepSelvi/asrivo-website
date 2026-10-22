/**
 * HTTP Status Codes
 * Centralized constants for consistent API responses
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * API Error Codes
 * Application-specific error codes for detailed error handling
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CAPTCHA_FAILED: 'CAPTCHA_FAILED',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

/**
 * Standard API Error Messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Validation failed',
  RATE_LIMIT: 'Too many requests. Please try again later',
  INTERNAL_ERROR: 'An error occurred processing your request',
  CAPTCHA_FAILED: 'Security verification failed. Please try again',
  DUPLICATE_EMAIL: 'This email address is already registered',
} as const

/**
 * Rate Limiting Constants
 */
export const RATE_LIMITS = {
  CONTACT_FORM: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  NEWSLETTER: { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  LOGIN: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  API_DEFAULT: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15 minutes
} as const

/**
 * Type exports for TypeScript
 */
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]
