/**
 * Production-safe logging utility
 * Logs are only shown in development or can be sent to monitoring service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    }

    // In development, log to console with formatting
    if (this.isDevelopment) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[level]

      console[level === 'debug' ? 'log' : level](
        `${emoji} [${level.toUpperCase()}] ${message}`,
        context ? context : ''
      )
    }

    // In production, send to monitoring service
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      // TODO: Send to your monitoring service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureMessage(message, { level, extra: context })
      //senetry key requide
      console[level](JSON.stringify(logData))
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : undefined,
    })
  }

  // Specific logger for API routes
  apiRequest(method: string, path: string, statusCode: number, duration?: number) {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  // Specific logger for database operations
  dbQuery(query: string, duration?: number, error?: Error) {
    if (error) {
      this.error('Database Query Failed', error, { query, duration })
    } else if (this.isDevelopment) {
      this.debug('Database Query', { query, duration: duration ? `${duration}ms` : undefined })
    }
  }

  // Specific logger for authentication events
  auth(event: string, userId?: string, success: boolean = true) {
    const level = success ? 'info' : 'warn'
    this.log(level, `Auth: ${event}`, { userId, success })
  }
}

export const logger = new Logger()
