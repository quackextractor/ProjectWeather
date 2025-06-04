import type { INotificationService } from "../interfaces/weather-interfaces"
import { appConfig } from "../config/app-config"

export class BrowserNotificationService implements INotificationService {
  private permission: NotificationPermission = "default"

  constructor() {
    if (this.isSupported()) {
      this.permission = Notification.permission
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn("Notifications are not supported in this browser")
      return false
    }

    if (this.permission === "granted") {
      return true
    }

    if (this.permission === "denied") {
      console.warn("Notification permission has been denied")
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === "granted"
    } catch (error) {
      console.error("Failed to request notification permission:", error)
      return false
    }
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Notifications are not supported")
    }

    if (this.permission !== "granted") {
      const granted = await this.requestPermission()
      if (!granted) {
        throw new Error("Notification permission not granted")
      }
    }

    const defaultOptions: NotificationOptions = {
      icon: "/weather-icon.png",
      badge: "/weather-badge.png",
      tag: "weather-notification",
      renotify: true,
      requireInteraction: false,
      ...options,
    }

    try {
      const notification = new Notification(title, defaultOptions)

      // Auto-close after 5 seconds if not interactive
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // Handle notification events
      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        notification.close()

        // Navigate to weather app if clicked
        if (options?.data?.url) {
          window.location.href = options.data.url
        }
      }

      notification.onerror = (error) => {
        console.error("Notification error:", error)
      }
    } catch (error) {
      console.error("Failed to show notification:", error)
      throw new Error("Failed to display notification")
    }
  }

  public isSupported(): boolean {
    return "Notification" in window && "serviceWorker" in navigator
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  public async showWeatherAlert(
    alertTitle: string,
    alertDescription: string,
    severity: "minor" | "moderate" | "severe" | "extreme",
  ): Promise<void> {
    const severityIcons = {
      minor: "🌤️",
      moderate: "⚠️",
      severe: "🌩️",
      extreme: "🚨",
    }

    const severityColors = {
      minor: "#3b82f6",
      moderate: "#f59e0b",
      severe: "#ef4444",
      extreme: "#dc2626",
    }

    await this.showNotification(`${severityIcons[severity]} ${alertTitle}`, {
      body: alertDescription,
      icon: "/weather-alert-icon.png",
      tag: `weather-alert-${severity}`,
      requireInteraction: severity === "severe" || severity === "extreme",
      data: {
        severity,
        timestamp: Date.now(),
        url: window.location.href,
      },
      actions: [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    })
  }

  public async showWeatherUpdate(
    locationName: string,
    temperature: number,
    condition: string,
    temperatureUnit: "celsius" | "fahrenheit" = "celsius",
  ): Promise<void> {
    const tempSymbol = temperatureUnit === "celsius" ? "°C" : "°F"
    const title = `Weather Update - ${locationName}`
    const body = `${temperature}${tempSymbol}, ${condition}`

    await this.showNotification(title, {
      body,
      icon: "/weather-update-icon.png",
      tag: "weather-update",
      requireInteraction: false,
      data: {
        type: "weather-update",
        location: locationName,
        temperature,
        condition,
        timestamp: Date.now(),
      },
    })
  }

  public async showLocationUpdate(locationName: string): Promise<void> {
    await this.showNotification("Location Updated", {
      body: `Weather location changed to ${locationName}`,
      icon: "/location-icon.png",
      tag: "location-update",
      requireInteraction: false,
      data: {
        type: "location-update",
        location: locationName,
        timestamp: Date.now(),
      },
    })
  }
}

/**
 * Mock notification service for testing and development
 */
export class MockNotificationService implements INotificationService {
  private mockPermission: NotificationPermission = "default"
  private notifications: Array<{ title: string; options?: NotificationOptions }> = []

  public async requestPermission(): Promise<boolean> {
    console.log("[Mock] Requesting notification permission")
    this.mockPermission = "granted"
    return true
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    console.log("[Mock] Showing notification:", title, options)
    this.notifications.push({ title, options })
  }

  public isSupported(): boolean {
    return true
  }

  public getNotifications(): Array<{ title: string; options?: NotificationOptions }> {
    return [...this.notifications]
  }

  public clearNotifications(): void {
    this.notifications = []
  }

  public getPermissionStatus(): NotificationPermission {
    return this.mockPermission
  }
}

/**
 * Notification service factory
 */
export class NotificationServiceFactory {
  public static create(): INotificationService {
    if (appConfig.features.enableNotifications && typeof window !== "undefined") {
      return new BrowserNotificationService()
    }
    return new MockNotificationService()
  }
}

// Default notification service instance
export const notificationService = NotificationServiceFactory.create()
