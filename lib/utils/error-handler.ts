/**
 * Error handling utilities
 * Provides type-safe error handling and consistent error responses
 */

import { ERROR_CODES } from '@/lib/constants'
import type { ApiErrorDetail } from '@/lib/types/api'

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unexpected error occurred'
}

/**
 * Handle API errors with consistent structure
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): ApiErrorDetail {
  // Handle Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
      code: ERROR_CODES.UNKNOWN_ERROR,
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      code: ERROR_CODES.UNKNOWN_ERROR,
    }
  }
  
  // Handle structured errors (e.g., from Supabase)
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return {
        message: error.message,
        code: 'code' in error && typeof error.code === 'string' ? error.code : ERROR_CODES.UNKNOWN_ERROR,
        details: 'details' in error ? error.details : undefined,
      }
    }
  }
  
  // Fallback for unknown error types
  return {
    message: fallbackMessage,
    code: ERROR_CODES.UNKNOWN_ERROR,
    details: error,
  }
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Type guard to check if error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  )
}

/**
 * Log error safely (won't throw if logging fails)
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>): void {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error, additionalInfo)
    } else {
      // In production, log only essential info
      console.error(`[${context}]`, getErrorMessage(error))
    }
  } catch (loggingError) {
    // Silently fail if logging itself fails
    console.error('Error while logging:', loggingError)
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(context, error)
      throw error
    }
  }) as T
}

/**
 * Check if error indicates authentication failure
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('unauthorized') ||
    message.includes('authentication') ||
    message.includes('auth') ||
    message.includes('token') ||
    message.includes('session')
  )
}

/**
 * Check if error indicates validation failure
 */
export function isValidationError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  )
}

/**
 * Check if error indicates resource not found
 */
export function isNotFoundError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return message.includes('not found') || message.includes('404')
}

/**
 * Retry logic for transient errors
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on last attempt or if shouldRetry returns false
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      const delay = delayMs * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Create a custom error class with additional context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = ERROR_CODES.UNKNOWN_ERROR,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Common app errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ERROR_CODES.INVALID_INPUT, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ERROR_CODES.AUTH_REQUIRED, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, ERROR_CODES.AUTH_REQUIRED, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, ERROR_CODES.NOT_FOUND, 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, 429)
    this.name = 'RateLimitError'
  }
}
