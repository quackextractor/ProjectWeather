import { appConfig } from "../../config/app-config"
import { ApiError, NetworkError } from "../../utils/error-handler"

export class WeatherApiClient {
  private readonly baseUrl: string
  private readonly geocodingUrl: string
  private readonly timeout: number
  private readonly retryAttempts: number

  constructor() {
    this.baseUrl = appConfig.api.baseUrl
    this.geocodingUrl = appConfig.api.geocodingUrl
    this.timeout = appConfig.api.timeout
    this.retryAttempts = appConfig.api.retryAttempts
  }

  public async fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "weather_code",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation_probability",
        "weather_code",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "uv_index",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_direction_10m_dominant",
        "uv_index_max",
        "sunrise",
        "sunset",
      ].join(","),
      timezone: "auto",
      forecast_days: appConfig.defaults.forecastDays.toString(),
    })

    return this.fetchWithRetry(`${this.baseUrl}/forecast?${params}`)
  }

  public async searchLocations(query: string): Promise<any> {
    const sanitizedQuery = this.sanitizeQuery(query)
    const params = new URLSearchParams({
      name: sanitizedQuery,
      count: "10",
      language: "en",
      format: "json",
    })

    return this.fetchWithRetry(`${this.geocodingUrl}/search?${params}`)
  }

  private async fetchWithRetry(url: string): Promise<any> {
    let lastError: Error

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new ApiError(`API request failed: ${response.status} ${response.statusText}`, response.status)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error

        if (error instanceof ApiError || attempt === this.retryAttempts) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        await this.delay(Math.pow(2, attempt - 1) * 1000)
      }
    }

    throw lastError!
  }

  private sanitizeQuery(query: string): string {
    return query.trim().replace(/[^\w\s-]/g, "")
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public handleApiError(error: any, context: string): Error {
    if (error instanceof ApiError || error instanceof NetworkError) {
      return error
    }

    if (error.name === "AbortError") {
      return new NetworkError("Request timeout")
    }

    if (!navigator.onLine) {
      return new NetworkError("No internet connection")
    }

    return new ApiError(`Failed to ${context}: ${error.message}`)
  }
}
