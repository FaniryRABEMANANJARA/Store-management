/**
 * Système de logging centralisé
 * Supporte différents niveaux de log et peut être étendu pour envoyer vers un service externe
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: any
  error?: Error
  userId?: string
  path?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error, userId, path } = entry
    
    let logMessage = `[${timestamp}] [${level}] ${message}`
    
    if (path) {
      logMessage += ` | Path: ${path}`
    }
    
    if (userId) {
      logMessage += ` | User: ${userId}`
    }
    
    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message}`
      if (this.isDevelopment && error.stack) {
        logMessage += `\nStack: ${error.stack}`
      }
    }
    
    return logMessage
  }

  private log(level: LogLevel, message: string, options?: {
    context?: any
    error?: Error
    userId?: string
    path?: string
  }) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...options,
    }

    const formattedMessage = this.formatMessage(entry)

    // En production, on pourrait envoyer vers un service externe (Sentry, LogRocket, etc.)
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage)
        }
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        // En production, envoyer vers un service de monitoring
        if (this.isProduction && options?.error) {
          // TODO: Intégrer avec un service de monitoring (Sentry, etc.)
          // Sentry.captureException(options.error)
        }
        break
    }
  }

  debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, { context })
  }

  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, { context })
  }

  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, { context })
  }

  error(message: string, error?: Error, context?: any) {
    this.log(LogLevel.ERROR, message, { error, context })
  }

  // Méthodes spécialisées pour les erreurs HTTP
  logRequestError(
    path: string,
    method: string,
    error: Error,
    userId?: string,
    statusCode?: number
  ) {
    this.error(
      `${method} ${path} - ${statusCode || 'Error'}`,
      error,
      {
        path,
        method,
        statusCode,
        userId,
      }
    )
  }

  logApiError(
    path: string,
    error: Error,
    userId?: string,
    context?: any
  ) {
    this.error(
      `API Error: ${path}`,
      error,
      {
        path,
        userId,
        ...context,
      }
    )
  }
}

export const logger = new Logger()
