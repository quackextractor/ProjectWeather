/**
 * Application configuration interface and implementation
 * Provides centralized configuration management for the weather application
 */
export interface IAppConfig {
  readonly api: {
    readonly baseUrl: string
    readonly geocodingUrl: string
    readonly timeout: number
    readonly retryAttempts: number
    readonly rateLimitPerDay: number
  }
  readonly ui: {
    readonly defaultTheme: string
    readonly defaultTemperatureUnit: "celsius" | "fahrenheit"
    readonly defaultLanguage: string
    readonly animationDuration: number
    readonly debounceDelay: number
  }
  readonly cache: {
    readonly weatherCacheDuration: number
    readonly locationCacheDuration: number
    readonly maxCacheSize: number
  }
  readonly defaults: {
    readonly city: string
    readonly coordinates: {
      readonly latitude: number
      readonly longitude: number
    }
    readonly forecastDays: number
  }
  readonly features: {
    readonly enableGeolocation: boolean
    readonly enableNotifications: boolean
    readonly enableOfflineMode: boolean
    readonly enableAnalytics: boolean
  }
}

/**
 * Default application configuration
 * Implements the IAppConfig interface with sensible defaults
 */
export class AppConfig implements IAppConfig {
  public readonly api = {
    baseUrl: process.env.NEXT_PUBLIC_WEATHER_API_URL || "https://api.open-meteo.com/v1",
    geocodingUrl: process.env.NEXT_PUBLIC_GEOCODING_API_URL || "https://geocoding-api.open-meteo.com/v1",
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
    retryAttempts: Number(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS) || 3,
    rateLimitPerDay: Number(process.env.NEXT_PUBLIC_RATE_LIMIT) || 10000,
  } as const

  public readonly ui = {
    defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME || "default",
    defaultTemperatureUnit: (process.env.NEXT_PUBLIC_DEFAULT_TEMP_UNIT as "celsius" | "fahrenheit") || "celsius",
    defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en",
    animationDuration: Number(process.env.NEXT_PUBLIC_ANIMATION_DURATION) || 300,
    debounceDelay: Number(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY) || 300,
  } as const

  public readonly cache = {
    weatherCacheDuration: Number(process.env.NEXT_PUBLIC_WEATHER_CACHE_DURATION) || 300000, // 5 minutes
    locationCacheDuration: Number(process.env.NEXT_PUBLIC_LOCATION_CACHE_DURATION) || 3600000, // 1 hour
    maxCacheSize: Number(process.env.NEXT_PUBLIC_MAX_CACHE_SIZE) || 100,
  } as const

  public readonly defaults = {
    city: process.env.NEXT_PUBLIC_DEFAULT_CITY || "Prague",
    coordinates: {
      latitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || 50.0755,
      longitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LON) || 14.4378,
    },
    forecastDays: Number(process.env.NEXT_PUBLIC_FORECAST_DAYS) || 7,
  } as const

  public readonly features = {
    enableGeolocation: process.env.NEXT_PUBLIC_ENABLE_GEOLOCATION !== "false",
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE !== "false",
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  } as const

  /**
   * Validates the configuration and throws an error if invalid
   */
  public validate(): void {
    if (!this.api.baseUrl) {
      throw new Error("API base URL is required")
    }
    if (this.api.timeout <= 0) {
      throw new Error("API timeout must be positive")
    }
    if (this.cache.weatherCacheDuration <= 0) {
      throw new Error("Cache duration must be positive")
    }
  }

  /**
   * Creates a configuration instance from environment variables
   */
  public static fromEnvironment(): AppConfig {
    const config = new AppConfig()
    config.validate()
    return config
  }
}

// Singleton instance
export const appConfig = AppConfig.fromEnvironment()
