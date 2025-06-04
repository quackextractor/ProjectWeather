/**
 * Core interfaces for the weather application
 * Defines contracts for all major components
 */

export interface ILocation {
  readonly name: string
  readonly latitude: number
  readonly longitude: number
  readonly country: string
  readonly region: string
  readonly timezone?: string
}

export interface IWeatherCondition {
  readonly code: number
  readonly description: string
  readonly icon: string
  readonly severity: "low" | "medium" | "high" | "extreme"
}

export interface ICurrentWeather {
  readonly location: ILocation
  readonly temperature: number
  readonly feelsLike: number
  readonly humidity: number
  readonly pressure: number
  readonly visibility: number
  readonly windSpeed: number
  readonly windDirection: number
  readonly uvIndex: number
  readonly condition: IWeatherCondition
  readonly timestamp: Date
  readonly temperatureMax: number
  readonly temperatureMin: number
}

export interface IHourlyWeather {
  readonly time: Date
  readonly temperature: number
  readonly feelsLike: number
  readonly humidity: number
  readonly precipitationProbability: number
  readonly condition: IWeatherCondition
  readonly windSpeed: number
  readonly windDirection: number
  readonly pressure: number
  readonly uvIndex: number
}

export interface IDailyWeather {
  readonly date: Date
  readonly temperatureMax: number
  readonly temperatureMin: number
  readonly feelsLikeMax: number
  readonly feelsLikeMin: number
  readonly condition: IWeatherCondition
  readonly precipitationSum: number
  readonly precipitationProbability: number
  readonly windSpeed: number
  readonly windDirection: number
  readonly uvIndex: number
  readonly sunrise?: Date
  readonly sunset?: Date
}

export interface IWeatherForecast {
  readonly current: ICurrentWeather
  readonly hourly: readonly IHourlyWeather[]
  readonly daily: readonly IDailyWeather[]
  readonly alerts?: readonly IWeatherAlert[]
}

export interface IWeatherAlert {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly severity: "minor" | "moderate" | "severe" | "extreme"
  readonly startTime: Date
  readonly endTime: Date
  readonly areas: readonly string[]
}

export interface IWeatherService {
  getCurrentWeather(location: ILocation): Promise<ICurrentWeather>
  getForecast(location: ILocation): Promise<IWeatherForecast>
  searchLocations(query: string): Promise<readonly ILocation[]>
  reverseGeocode(latitude: number, longitude: number): Promise<ILocation | null>
}

export interface ICacheService<T> {
  get(key: string): T | null
  set(key: string, value: T, ttl?: number): void
  delete(key: string): void
  clear(): void
  size(): number
}

export interface INotificationService {
  requestPermission(): Promise<boolean>
  showNotification(title: string, options?: NotificationOptions): Promise<void>
  isSupported(): boolean
}

export interface IAnalyticsService {
  track(event: string, properties?: Record<string, any>): void
  identify(userId: string, traits?: Record<string, any>): void
  page(name: string, properties?: Record<string, any>): void
}

export interface IErrorHandler {
  handleError(error: Error, context?: string): void
  reportError(error: Error, context?: string): void
}

export interface IValidator<T> {
  validate(data: T): ValidationResult
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
}
