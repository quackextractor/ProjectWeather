export interface Location {
  name: string
  latitude: number
  longitude: number
  country: string
  region: string
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  visibility: number
  windSpeed: number
  windDirection: number
  uvIndex: number
  weatherCode: number
  description: string
  timestamp: Date
  temperatureMax: number
  temperatureMin: number
}

export interface HourlyWeather {
  time: Date
  temperature: number
  feelsLike: number
  humidity: number
  precipitationProbability: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
}

export interface DailyWeather {
  date: Date
  temperatureMax: number
  temperatureMin: number
  feelsLikeMax: number
  feelsLikeMin: number
  weatherCode: number
  description: string
  precipitationSum: number
  precipitationProbability: number
  windSpeed: number
  windDirection: number
  uvIndex: number
}

export interface ForecastData {
  hourly: HourlyWeather[]
  daily: DailyWeather[]
}

export interface ApiUsage {
  callsToday: number
  dailyLimit: number
  resetTime: Date
}
