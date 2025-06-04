/**
 * Weather forecast domain models
 * Provides weather data structures for current conditions and forecasts
 */
import type {
  ILocation,
  IWeatherCondition,
  ICurrentWeather,
  IHourlyWeather,
  IDailyWeather,
  IWeatherForecast,
  IWeatherAlert,
} from "../interfaces/weather-interfaces"

export class CurrentWeather implements ICurrentWeather {
  public readonly location: ILocation
  public readonly temperature: number
  public readonly feelsLike: number
  public readonly humidity: number
  public readonly pressure: number
  public readonly visibility: number
  public readonly windSpeed: number
  public readonly windDirection: number
  public readonly uvIndex: number
  public readonly condition: IWeatherCondition
  public readonly timestamp: Date
  public readonly temperatureMax: number
  public readonly temperatureMin: number

  constructor(data: {
    location: ILocation
    temperature: number
    feelsLike: number
    humidity: number
    pressure: number
    visibility: number
    windSpeed: number
    windDirection: number
    uvIndex: number
    condition: IWeatherCondition
    timestamp: Date
    temperatureMax: number
    temperatureMin: number
  }) {
    this.location = data.location
    this.temperature = Math.round(data.temperature)
    this.feelsLike = Math.round(data.feelsLike)
    this.humidity = Math.max(0, Math.min(100, data.humidity))
    this.pressure = Math.max(0, data.pressure)
    this.visibility = Math.max(0, data.visibility)
    this.windSpeed = Math.max(0, data.windSpeed)
    this.windDirection = data.windDirection % 360
    this.uvIndex = Math.max(0, data.uvIndex)
    this.condition = data.condition
    this.timestamp = data.timestamp
    this.temperatureMax = Math.round(data.temperatureMax)
    this.temperatureMin = Math.round(data.temperatureMin)
  }

  public getComfortLevel(): "comfortable" | "mild" | "uncomfortable" | "extreme" {
    const temp = this.temperature
    if (temp >= 18 && temp <= 24 && this.humidity >= 40 && this.humidity <= 60) {
      return "comfortable"
    }
    if (temp >= 15 && temp <= 28 && this.humidity >= 30 && this.humidity <= 70) {
      return "mild"
    }
    if (temp >= 10 && temp <= 32) {
      return "uncomfortable"
    }
    return "extreme"
  }

  public getWindDescription(): string {
    const speed = this.windSpeed
    if (speed < 1) return "Calm"
    if (speed < 6) return "Light air"
    if (speed < 12) return "Light breeze"
    if (speed < 20) return "Gentle breeze"
    if (speed < 29) return "Moderate breeze"
    if (speed < 39) return "Fresh breeze"
    if (speed < 50) return "Strong breeze"
    return "High wind"
  }
}

export class HourlyWeather implements IHourlyWeather {
  public readonly time: Date
  public readonly temperature: number
  public readonly feelsLike: number
  public readonly humidity: number
  public readonly precipitationProbability: number
  public readonly condition: IWeatherCondition
  public readonly windSpeed: number
  public readonly windDirection: number
  public readonly pressure: number
  public readonly uvIndex: number

  constructor(data: {
    time: Date
    temperature: number
    feelsLike: number
    humidity: number
    precipitationProbability: number
    condition: IWeatherCondition
    windSpeed: number
    windDirection: number
    pressure: number
    uvIndex: number
  }) {
    this.time = data.time
    this.temperature = Math.round(data.temperature)
    this.feelsLike = Math.round(data.feelsLike)
    this.humidity = Math.max(0, Math.min(100, data.humidity))
    this.precipitationProbability = Math.max(0, Math.min(100, data.precipitationProbability))
    this.condition = data.condition
    this.windSpeed = Math.max(0, data.windSpeed)
    this.windDirection = data.windDirection % 360
    this.pressure = Math.max(0, data.pressure)
    this.uvIndex = Math.max(0, data.uvIndex)
  }
}

export class DailyWeather implements IDailyWeather {
  public readonly date: Date
  public readonly temperatureMax: number
  public readonly temperatureMin: number
  public readonly feelsLikeMax: number
  public readonly feelsLikeMin: number
  public readonly condition: IWeatherCondition
  public readonly precipitationSum: number
  public readonly precipitationProbability: number
  public readonly windSpeed: number
  public readonly windDirection: number
  public readonly uvIndex: number
  public readonly sunrise?: Date
  public readonly sunset?: Date

  constructor(data: {
    date: Date
    temperatureMax: number
    temperatureMin: number
    feelsLikeMax: number
    feelsLikeMin: number
    condition: IWeatherCondition
    precipitationSum: number
    precipitationProbability: number
    windSpeed: number
    windDirection: number
    uvIndex: number
    sunrise?: Date
    sunset?: Date
  }) {
    this.date = data.date
    this.temperatureMax = Math.round(data.temperatureMax)
    this.temperatureMin = Math.round(data.temperatureMin)
    this.feelsLikeMax = Math.round(data.feelsLikeMax)
    this.feelsLikeMin = Math.round(data.feelsLikeMin)
    this.condition = data.condition
    this.precipitationSum = Math.max(0, data.precipitationSum)
    this.precipitationProbability = Math.max(0, Math.min(100, data.precipitationProbability))
    this.windSpeed = Math.max(0, data.windSpeed)
    this.windDirection = data.windDirection % 360
    this.uvIndex = Math.max(0, data.uvIndex)
    this.sunrise = data.sunrise
    this.sunset = data.sunset
  }

  public getTemperatureRange(): number {
    return this.temperatureMax - this.temperatureMin
  }

  public getAverageTemperature(): number {
    return Math.round((this.temperatureMax + this.temperatureMin) / 2)
  }
}

export class WeatherForecast implements IWeatherForecast {
  public readonly current: ICurrentWeather
  public readonly hourly: readonly IHourlyWeather[]
  public readonly daily: readonly IDailyWeather[]
  public readonly alerts?: readonly IWeatherAlert[]

  constructor(data: {
    current: ICurrentWeather
    hourly: readonly IHourlyWeather[]
    daily: readonly IDailyWeather[]
    alerts?: readonly IWeatherAlert[]
  }) {
    this.current = data.current
    this.hourly = [...data.hourly]
    this.daily = [...data.daily]
    this.alerts = data.alerts ? [...data.alerts] : undefined
  }

  public getHourlyForDay(date: Date): readonly IHourlyWeather[] {
    const targetDate = date.toDateString()
    return this.hourly.filter((hour) => hour.time.toDateString() === targetDate)
  }

  public getDailyForDateRange(startDate: Date, endDate: Date): readonly IDailyWeather[] {
    return this.daily.filter((day) => day.date >= startDate && day.date <= endDate)
  }

  public hasAlerts(): boolean {
    return this.alerts !== undefined && this.alerts.length > 0
  }

  public getActiveAlerts(): readonly IWeatherAlert[] {
    if (!this.alerts) return []
    const now = new Date()
    return this.alerts.filter((alert) => alert.startTime <= now && alert.endTime >= now)
  }
}
