/**
 * Application logger
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  context?: string
  data?: Record<string, unknown>
  error?: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment && !this.isTest) {
      this.log('debug', message, options)
    }
  }

  /**
   * Info level logging
   */
  info(message: string, options?: LogOptions): void {
    if (!this.isTest) {
      this.log('info', message, options)
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, options?: LogOptions): void {
    if (!this.isTest) {
      this.log('warn', message, options)
    }
  }

  /**
   * Error level logging (always logs)
   */
  error(message: string, options?: LogOptions): void {
    this.log('error', message, options)
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const timestamp = new Date().toISOString()
    const context = options?.context ? `[${options.context}]` : ''
    const prefix = `${timestamp} ${level.toUpperCase()} ${context}`

    try {
      if (this.isDevelopment) {
        // Development: Rich logging with all details
        const logFn = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log

        logFn(`${prefix} ${message}`)
        
        if (options?.data) {
          logFn('Data:', options.data)
        }
        
        if (options?.error) {
          logFn('Error:', options.error)
        }
      } else {
        // Production: Minimal logging, structured
        const logData = {
          timestamp,
          level,
          message,
          ...(options?.context ? { context: options.context } : {}),
          ...(options?.data ? { data: options.data } : {}),
          ...(options?.error ? { error: this.sanitizeError(options.error) } : {}),
        }

        const logFn = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     console.log

        logFn(JSON.stringify(logData))
      }
    } catch (loggingError) {
      // Fallback if logging itself fails
      console.error('Logger error:', loggingError)
      console.error('Original message:', message)
    }
  }

  /**
   * Sanitize error for safe logging
   */
  private sanitizeError(error: unknown): unknown {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      }
    }
    
    if (typeof error === 'object' && error !== null) {
      // Remove sensitive fields
      const sanitized = { ...error }
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'key']
      
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          (sanitized as Record<string, string>)[key] = '[REDACTED]'
        }
      }
      
      return sanitized
    }
    
    return error
  }

  /**
   * Create a child logger with a fixed context
   */
  child(context: string): Logger {
    const childLogger = new Logger()
    const originalLog = childLogger.log.bind(childLogger)
    
    childLogger.log = (level: LogLevel, message: string, options?: LogOptions) => {
      originalLog(level, message, {
        ...options,
        context: options?.context ? `${context}:${options.context}` : context,
      })
    }
    
    return childLogger
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for testing
export { Logger }
