/**
 * Standardized API response types
 * Ensures consistent response shapes across all API routes
 */

// Base error structure
export interface ApiErrorDetail {
  message: string
  code?: string
  details?: unknown
  field?: string // For validation errors
}

// Error response
export interface ApiErrorResponse {
  success: false
  error: ApiErrorDetail
}

// Success response
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    hasMore?: boolean
  }
}

// Union type for all API responses
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// Helper function to create success response
export function apiSuccess<T>(
  data: T,
  messageOrMeta?: string | ApiSuccessResponse<T>['meta'],
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  const message = typeof messageOrMeta === 'string' ? messageOrMeta : undefined
  const finalMeta = typeof messageOrMeta === 'object' ? messageOrMeta : meta
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(finalMeta && { meta: finalMeta }),
  }
}

// Helper function to create error response
export function apiError(
  message: string,
  code?: string,
  details?: unknown,
  field?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details !== undefined ? { details } : {}),
      ...(field && { field }),
    },
  }
}

// Validation error helper
export interface ValidationError {
  field: string
  message: string
}

export function apiValidationError(errors: ValidationError[]): ApiErrorResponse {
  return {
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
    },
  }
}

// Common response types
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedResponse<T> = ApiSuccessResponse<PaginatedData<T>>

// Status response (for simple operations like delete)
export interface StatusResponse {
  message: string
}

// Upload response
export interface UploadResponse {
  url: string
  path: string
  fileName: string
  fileSize: number
  fileType?: string
}

// Auth response
export interface AuthResponse {
  user: {
    id: string
    email: string
    role?: string
  }
  session?: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

// Type guard to check if response is error
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}

// Type guard to check if response is success
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}
