import type { WeatherData, ForecastData, HourlyWeather, DailyWeather } from "@/types/weather"

export class WeatherService {
  private readonly baseUrl = "https://api.open-meteo.com/v1"
  private readonly timeout = 10000 // 10 seconds
  private isTestMode = false

  constructor(testMode = false) {
    this.isTestMode = testMode
  }

  async getWeatherAndForecast(
    latitude: number,
    longitude: number,
  ): Promise<{ current: WeatherData; forecast: ForecastData }> {
    try {
      // Validate coordinates first
      const validationError = this.validateCoordinates(latitude, longitude)
      if (validationError) {
        throw new ValidationError(validationError)
      }

      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "surface_pressure",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
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
        ].join(","),
        timezone: "auto",
        forecast_days: "7",
      })

      const response = await this.fetchWithTimeout(`${this.baseUrl}/forecast?${params}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new ApiError(`Weather API error: ${response.status} ${response.statusText}`, response.status)
      }

      const data = await response.json()

      if (!data.current || !data.hourly || !data.daily) {
        throw new ApiError("Invalid weather data received")
      }

      const currentWeather = this.transformCurrentWeather(data)
      const forecast = this.transformForecastData(data)

      return { current: currentWeather, forecast }
    } catch (error) {
      // Only log unexpected errors, not validation or expected test errors
      if (!this.isTestMode && !(error instanceof ValidationError)) {
        console.error("Failed to fetch weather data:", error)
      }

      if (error instanceof ValidationError || error instanceof ApiError || error instanceof TimeoutError) {
        throw error
      }

      if (error instanceof Error) {
        throw new ApiError(`Failed to fetch weather data: ${error.message}`)
      }

      throw new ApiError("Failed to fetch weather data")
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(`Request timeout after ${this.timeout}ms`)
      }
      throw error
    }
  }

  private validateCoordinates(latitude: number, longitude: number): string | null {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return "Coordinates must be numbers"
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return "Coordinates cannot be NaN"
    }

    if (latitude < -90 || latitude > 90) {
      return "Latitude must be between -90 and 90 degrees"
    }

    if (longitude < -180 || longitude > 180) {
      return "Longitude must be between -180 and 180 degrees"
    }

    return null
  }

  // Keep these methods for backward compatibility but mark as deprecated
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const { current } = await this.getWeatherAndForecast(latitude, longitude)
    return current
  }

  async getForecast(latitude: number, longitude: number): Promise<ForecastData> {
    const { forecast } = await this.getWeatherAndForecast(latitude, longitude)
    return forecast
  }

  private transformCurrentWeather(data: any): WeatherData {
    const current = data.current
    const daily = data.daily

    return {
      temperature: Math.round(current.temperature_2m || 0),
      feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
      humidity: current.relative_humidity_2m || 0,
      pressure: Math.round(current.pressure_msl || current.surface_pressure || 1013),
      visibility: 10, // Open-Meteo doesn't provide visibility, using default
      windSpeed: Math.round(current.wind_speed_10m || 0),
      windDirection: current.wind_direction_10m || 0,
      uvIndex: 5, // Open-Meteo doesn't provide UV index in current for free tier
      weatherCode: Number(current.weather_code) || 0,
      description: this.getWeatherDescription(Number(current.weather_code) || 0),
      timestamp: new Date(current.time || Date.now()),
      temperatureMax: Math.round(daily?.temperature_2m_max?.[0] || current.temperature_2m || 0),
      temperatureMin: Math.round(daily?.temperature_2m_min?.[0] || current.temperature_2m || 0),
    }
  }

  private transformForecastData(data: any): ForecastData {
    const hourly: HourlyWeather[] = (data.hourly.time || []).map((time: string, index: number) => ({
      time: new Date(time),
      temperature: Math.round(data.hourly.temperature_2m?.[index] || 0),
      feelsLike: Math.round(data.hourly.apparent_temperature?.[index] || 0),
      humidity: data.hourly.relative_humidity_2m?.[index] || 0,
      precipitationProbability: data.hourly.precipitation_probability?.[index] || 0,
      weatherCode: Number(data.hourly.weather_code?.[index]) || 0,
      windSpeed: Math.round(data.hourly.wind_speed_10m?.[index] || 0),
      windDirection: data.hourly.wind_direction_10m?.[index] || 0,
      pressure: Math.round(data.hourly.surface_pressure?.[index] || 1013),
      uvIndex: data.hourly.uv_index?.[index] || 0,
    }))

    const daily: DailyWeather[] = (data.daily.time || []).map((time: string, index: number) => ({
      date: new Date(time),
      temperatureMax: Math.round(data.daily.temperature_2m_max?.[index] || 0),
      temperatureMin: Math.round(data.daily.temperature_2m_min?.[index] || 0),
      feelsLikeMax: Math.round(data.daily.apparent_temperature_max?.[index] || 0),
      feelsLikeMin: Math.round(data.daily.apparent_temperature_min?.[index] || 0),
      weatherCode: Number(data.daily.weather_code?.[index]) || 0,
      description: this.getWeatherDescription(Number(data.daily.weather_code?.[index]) || 0),
      precipitationSum: data.daily.precipitation_sum?.[index] || 0,
      precipitationProbability: data.daily.precipitation_probability_max?.[index] || 0,
      windSpeed: Math.round(data.daily.wind_speed_10m_max?.[index] || 0),
      windDirection: data.daily.wind_direction_10m_dominant?.[index] || 0,
      uvIndex: data.daily.uv_index_max?.[index] || 0,
    }))

    return { hourly, daily }
  }

  private getWeatherDescription(code: number): string {
    const descriptions: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    }

    return descriptions[code] || "Unknown"
  }
}

// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class ApiError extends Error {
  public readonly statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TimeoutError"
  }
}
