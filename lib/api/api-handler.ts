import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from '@/lib/constants/http'
import { logError } from '@/lib/utils/error-handler'

/**
 * Standard API Response Types
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: any
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * API Handler Options
 */
interface ApiHandlerOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  skipRateLimit?: boolean
}

/**
 * API Handler Context - passed to route handlers
 */
export interface ApiContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: any | null
  request: NextRequest
}

/**
 * API Route Handler Function Type
 */
type ApiRouteHandler<T = any> = (
  context: ApiContext,
  ...args: any[]
) => Promise<ApiResponse<T> | NextResponse>

/**
 * Create a successful API response
 */
export function apiSuccess<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return { success: true, data, message }
}

/**
 * Create an error API response
 */
export function apiError(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: { message, code, details }
  }
}

/**
 * Main API Handler Wrapper
 * Handles common concerns: auth, error handling, logging
 */
export function apiHandler<T = any>(
  handler: ApiRouteHandler<T>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const context: Partial<ApiContext> = { request }

    try {
      // 1. Create Supabase client
      const supabase = await createClient()
      context.supabase = supabase

      // 2. Check authentication if required
      if (options.requireAuth || options.requireAdmin) {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          return NextResponse.json(
            apiError(ERROR_MESSAGES.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR),
            { status: HTTP_STATUS.UNAUTHORIZED }
          )
        }
        
        context.user = user

        // 3. Check admin privileges if required
        if (options.requireAdmin) {
          const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          if (!adminProfile) {
            return NextResponse.json(
              apiError(ERROR_MESSAGES.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR),
              { status: HTTP_STATUS.FORBIDDEN }
            )
          }
        }
      }

      // 4. Execute the handler
      const result = await handler(context as ApiContext, ...args)

      // 5. Return response
      if (result instanceof NextResponse) {
        return result
      }

      const status = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
      return NextResponse.json(result, { status })

    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const firstError = error.errors[0]
        return NextResponse.json(
          apiError(
            `Validation failed: ${firstError.path.join('.')}: ${firstError.message}`,
            ERROR_CODES.VALIDATION_ERROR,
            error.errors
          ),
          { status: HTTP_STATUS.BAD_REQUEST }
        )
      }

      // Log the error
      logError('API Handler Error', error, { 
        path: request.url,
        user: context.user?.id 
      })

      // Return generic error
      return NextResponse.json(
        apiError(ERROR_MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR),
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }
  }
}

/**
 * Convenience wrapper for authenticated routes
 */
export function authenticatedHandler<T = any>(handler: ApiRouteHandler<T>) {
  return apiHandler(handler, { requireAuth: true })
}

/**
 * Convenience wrapper for admin-only routes
 */
export function adminHandler<T = any>(handler: ApiRouteHandler<T>) {
  return apiHandler(handler, { requireAuth: true, requireAdmin: true })
}
