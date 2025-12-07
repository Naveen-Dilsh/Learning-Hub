/**
 * Performance Logger Utility
 * Tracks database queries, API routes, and overall request times
 */

class PerformanceLogger {
  constructor() {
    this.logs = []
    this.enabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_PERF_LOGGING === 'true'
  }

  /**
   * Log database query performance
   */
  logDatabaseQuery(operation, model, duration, query = null) {
    if (!this.enabled) return

    const log = {
      type: 'DATABASE',
      operation,
      model,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      query: query ? JSON.stringify(query).substring(0, 200) : null,
    }

    // Only log slow queries (> 100ms) or all in development
    if (duration > 100 || process.env.NODE_ENV === 'development') {
      console.log(`[DB] ${operation} ${model}: ${duration.toFixed(2)}ms`)
      if (query && duration > 500) {
        console.log(`[DB] Query:`, query)
      }
    }

    this.logs.push(log)
    return log
  }

  /**
   * Log API route performance
   */
  logAPIRoute(method, path, duration, details = {}) {
    if (!this.enabled) return

    const log = {
      type: 'API',
      method,
      path,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ...details,
    }

    // Log all API routes
    const status = details.status || '200'
    const color = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢'
    
    console.log(`${color} [API] ${method} ${path}: ${duration.toFixed(2)}ms ${details.dbTime ? `(DB: ${details.dbTime.toFixed(2)}ms)` : ''}`)

    this.logs.push(log)
    return log
  }

  /**
   * Log page render performance
   */
  logPageRender(path, duration, details = {}) {
    if (!this.enabled) return

    const log = {
      type: 'PAGE',
      path,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      ...details,
    }

    if (duration > 1000) {
      console.log(`[PAGE] ${path}: ${duration.toFixed(2)}ms`)
    }

    this.logs.push(log)
    return log
  }

  /**
   * Create a timer for measuring execution time
   */
  startTimer(label) {
    return {
      label,
      start: Date.now(),
      end: null,
      duration: null,
      stop: function() {
        this.end = Date.now()
        this.duration = this.end - this.start
        return this.duration
      },
    }
  }

  /**
   * Get recent logs
   */
  getLogs(limit = 50) {
    return this.logs.slice(-limit)
  }

  /**
   * Get slow queries (> threshold)
   */
  getSlowQueries(threshold = 500) {
    return this.logs.filter(
      log => log.type === 'DATABASE' && parseFloat(log.duration) > threshold
    )
  }

  /**
   * Get slow API routes (> threshold)
   */
  getSlowAPIRoutes(threshold = 1000) {
    return this.logs.filter(
      log => log.type === 'API' && parseFloat(log.duration) > threshold
    )
  }

  /**
   * Clear logs
   */
  clear() {
    this.logs = []
  }
}

// Singleton instance
export const performanceLogger = new PerformanceLogger()

/**
 * Wrapper for Prisma queries to log performance
 */
export function withPerformanceLogging(prisma) {
  // Store original query methods
  const originalFindMany = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = Date.now()
          const result = await query(args)
          const duration = Date.now() - start

          performanceLogger.logDatabaseQuery(
            operation,
            model,
            duration,
            args
          )

          return result
        },
      },
    },
  })

  return originalFindMany
}

/**
 * API route performance wrapper
 */
export function withAPIPerformanceLogging(handler) {
  return async (request, context) => {
    const start = Date.now()
    const timer = performanceLogger.startTimer('API')
    const dbTimer = performanceLogger.startTimer('DB')

    try {
      const response = await handler(request, context)
      const duration = timer.stop()
      const dbTime = dbTimer.duration || 0

      const path = request.nextUrl?.pathname || request.url
      const method = request.method

      performanceLogger.logAPIRoute(method, path, duration, {
        status: response?.status || 200,
        dbTime,
      })

      return response
    } catch (error) {
      const duration = timer.stop()
      const path = request.nextUrl?.pathname || request.url
      const method = request.method

      performanceLogger.logAPIRoute(method, path, duration, {
        status: 500,
        error: error.message,
      })

      throw error
    }
  }
}

