/**
 * Application-wide constants
 * Central location for all magic numbers and configuration values
 */

// File Upload Limits
export const FILE_LIMITS = {
  PROFILE_IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  },
  DOCUMENT: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },
  COMPLAINT_PROOF: {
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  },
  PARTNERSHIP_DOCUMENT: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  GENERAL_UPLOAD: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'
    ],
  },
} as const

// Session Configuration
export const SESSION = {
  ADMIN_DURATION: 2 * 60 * 60, // 2 hours in seconds
  USER_DURATION: 7 * 24 * 60 * 60, // 7 days in seconds
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
} as const

// CAPTCHA Configuration
export const CAPTCHA = {
  THRESHOLD_STRICT: 0.7, // For admin actions, high security
  THRESHOLD_NORMAL: 0.5, // For public forms, balanced
  THRESHOLD_LENIENT: 0.3, // For newsletter, lower barrier
} as const

// Rate Limiting Configuration
export const RATE_LIMIT = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
  },
  API: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  CONTACT_FORM: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const

// Notification Configuration
export const NOTIFICATIONS = {
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_AGE_DAYS: 30,
  UNREAD_THRESHOLD: 50, // Show warning if more than 50 unread
} as const

// Email Configuration
export const EMAIL = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000, // 30 seconds
} as const

// Validation
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  EMAIL: {
    MAX_LENGTH: 254, // RFC 5321
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 5000,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
} as const

// Storage Buckets
export const STORAGE_BUCKETS = {
  USER_PROFILES: 'user-profiles',
  INQUIRY_DOCUMENTS: 'inquiry-documents',
  COMPLAINT_PROOFS: 'proof of complain',
  PARTNERSHIP_DOCUMENTS: 'partnership-documents',
  PROJECT_IMAGES: 'project-images',
} as const

// HTTP Status Codes (commonly used)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Error Codes
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  CAPTCHA_FAILED: 'CAPTCHA_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

// Time Constants (for display)
export const TIME = {
  SECOND_MS: 1000,
  MINUTE_MS: 60 * 1000,
  HOUR_MS: 60 * 60 * 1000,
  DAY_MS: 24 * 60 * 60 * 1000,
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
} as const
