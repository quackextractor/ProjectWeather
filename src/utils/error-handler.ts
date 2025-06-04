import type { IErrorHandler } from "../interfaces/weather-interfaces"

export class ApiError extends Error {
  public readonly statusCode?: number
  public readonly isRetryable: boolean

  constructor(message: string, statusCode?: number, isRetryable = false) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.isRetryable = isRetryable
  }
}

export class NetworkError extends Error {
  public readonly isRetryable = true

  constructor(message = "Network error occurred") {
    super(message)
    this.name = "NetworkError"
  }
}

export class ValidationError extends Error {
  public readonly field?: string
  public readonly isRetryable = false

  constructor(message: string, field?: string) {
    super(message)
    this.name = "ValidationError"
    this.field = field
  }
}

export class CacheError extends Error {
  public readonly isRetryable = false

  constructor(message: string) {
    super(message)
    this.name = "CacheError"
  }
}

export class ConfigurationError extends Error {
  public readonly isRetryable = false

  constructor(message: string) {
    super(message)
    this.name = "ConfigurationError"
  }
}

export class ErrorHandler implements IErrorHandler {
  private readonly enableReporting: boolean
  private readonly maxReports: number
  private reportCount = 0

  constructor(enableReporting = false, maxReports = 10) {
    this.enableReporting = enableReporting
    this.maxReports = maxReports
  }

  public handleError(error: Error, context?: string): void {
    const errorInfo = this.createErrorInfo(error, context)

    // Log error to console
    console.error(`[${errorInfo.type}] ${errorInfo.message}`, {
      context: errorInfo.context,
      stack: errorInfo.stack,
      timestamp: errorInfo.timestamp,
    })

    // Report error if enabled and within limits
    if (this.enableReporting && this.reportCount < this.maxReports) {
      this.reportError(error, context)
      this.reportCount++
    }

    // Show user-friendly message
    this.showUserMessage(errorInfo)
  }

  public reportError(error: Error, context?: string): void {
    if (!this.enableReporting) return

    try {
      const errorReport = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // In a real application, you would send this to your error reporting service
      console.log("Error report:", errorReport)
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError)
    }
  }

  private createErrorInfo(error: Error, context?: string) {
    return {
      type: error.name || "Error",
      message: error.message || "An unknown error occurred",
      context: context || "Unknown",
      stack: error.stack,
      timestamp: new Date().toISOString(),
      isRetryable: this.isRetryableError(error),
    }
  }

  private isRetryableError(error: Error): boolean {
    if (error instanceof ApiError) return error.isRetryable
    if (error instanceof NetworkError) return error.isRetryable
    if (error instanceof ValidationError) return error.isRetryable
    if (error instanceof CacheError) return error.isRetryable
    if (error instanceof ConfigurationError) return error.isRetryable

    // Default to non-retryable for unknown errors
    return false
  }

  private showUserMessage(errorInfo: any): void {
    let userMessage = "An error occurred. Please try again."

    switch (errorInfo.type) {
      case "NetworkError":
        userMessage = "Network connection problem. Please check your internet connection."
        break
      case "ApiError":
        userMessage = "Weather service is temporarily unavailable. Please try again later."
        break
      case "ValidationError":
        userMessage = "Invalid input provided. Please check your data and try again."
        break
      case "ConfigurationError":
        userMessage = "Application configuration error. Please contact support."
        break
    }

    // In a real application, you might show this in a toast notification
    // For now, we'll just log it
    console.warn("User message:", userMessage)
  }

  public static createFromResponse(response: Response): ApiError {
    const isRetryable = response.status >= 500 || response.status === 429
    return new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, isRetryable)
  }

  public static isRetryable(error: Error): boolean {
    if (error instanceof ApiError) return error.isRetryable
    if (error instanceof NetworkError) return true
    return false
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler(process.env.NODE_ENV === "production", 10)

// Global error event listeners
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    globalErrorHandler.handleError(event.error, "Global error handler")
  })

  window.addEventListener("unhandledrejection", (event) => {
    globalErrorHandler.handleError(
      new Error(event.reason?.message || "Unhandled promise rejection"),
      "Unhandled promise rejection",
    )
  })
}
