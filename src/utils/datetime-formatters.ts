export class DateTimeFormatter {
  public static formatTime(date: Date, format: "12h" | "24h" = "12h"): string {
    if (format === "24h") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  public static formatDate(date: Date, format: "short" | "medium" | "long" = "medium"): string {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check for relative dates
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Format based on requested format
    switch (format) {
      case "short":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      case "long":
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      default:
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
    }
  }

  public static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} at ${this.formatTime(date)}`
  }

  public static getRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) {
      return "Just now"
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return this.formatDate(date)
    }
  }

  public static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""}`
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`
    } else {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`
    }
  }

  public static isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  public static isTomorrow(date: Date): boolean {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  public static isYesterday(date: Date): boolean {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.toDateString() === yesterday.toDateString()
  }

  public static getTimeOfDay(date: Date): "morning" | "afternoon" | "evening" | "night" {
    const hour = date.getHours()

    if (hour >= 5 && hour < 12) {
      return "morning"
    } else if (hour >= 12 && hour < 17) {
      return "afternoon"
    } else if (hour >= 17 && hour < 21) {
      return "evening"
    } else {
      return "night"
    }
  }

  public static formatTimeRange(startDate: Date, endDate: Date): string {
    const startTime = this.formatTime(startDate)
    const endTime = this.formatTime(endDate)

    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startTime} - ${endTime}`
    } else {
      return `${this.formatDateTime(startDate)} - ${this.formatDateTime(endDate)}`
    }
  }

  public static getWeekday(date: Date, format: "short" | "long" = "long"): string {
    return date.toLocaleDateString("en-US", {
      weekday: format,
    })
  }

  public static getMonth(date: Date, format: "short" | "long" | "numeric" = "long"): string {
    if (format === "numeric") {
      return (date.getMonth() + 1).toString()
    }

    return date.toLocaleDateString("en-US", {
      month: format,
    })
  }
}
