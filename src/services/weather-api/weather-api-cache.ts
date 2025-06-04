/**
 * Weather API caching layer
 */
import type { ICurrentWeather, IWeatherForecast, ILocation, ICacheService } from "../../interfaces/weather-interfaces"
import { MemoryCacheService } from "../cache-service"
import { appConfig } from "../../config/app-config"

export class WeatherApiCache {
  private readonly cache: ICacheService<any>

  constructor(cacheService?: ICacheService<any>) {
    this.cache =
      cacheService || new MemoryCacheService(appConfig.cache.maxCacheSize, appConfig.cache.weatherCacheDuration)
  }

  public getCurrentWeatherFromCache(location: ILocation): any | null {
    const cacheKey = `current_${location.latitude}_${location.longitude}`
    return this.cache.get(cacheKey)
  }

  public cacheCurrentWeather(location: ILocation, weather: ICurrentWeather): void {
    const cacheKey = `current_${location.latitude}_${location.longitude}`
    const serialized = this.serializeCurrentWeather(weather)
    this.cache.set(cacheKey, serialized)
  }

  public getForecastFromCache(location: ILocation): any | null {
    const cacheKey = `forecast_${location.latitude}_${location.longitude}`
    return this.cache.get(cacheKey)
  }

  public cacheForecast(location: ILocation, forecast: IWeatherForecast): void {
    const cacheKey = `forecast_${location.latitude}_${location.longitude}`
    const serialized = this.serializeForecast(forecast)
    this.cache.set(cacheKey, serialized)
  }

  public getLocationSearchFromCache(query: string): any[] | null {
    const cacheKey = `search_${query.toLowerCase()}`
    return this.cache.get(cacheKey)
  }

  public cacheLocationSearch(query: string, results: any[]): void {
    const cacheKey = `search_${query.toLowerCase()}`
    this.cache.set(cacheKey, results, appConfig.cache.locationCacheDuration)
  }

  public getReverseGeocodeFromCache(latitude: number, longitude: number): any | null {
    const cacheKey = `reverse_${latitude}_${longitude}`
    return this.cache.get(cacheKey)
  }

  public cacheReverseGeocode(latitude: number, longitude: number, location: any): void {
    const cacheKey = `reverse_${latitude}_${longitude}`
    this.cache.set(cacheKey, location)
  }

  private serializeCurrentWeather(weather: ICurrentWeather): any {
    return {
      temperature: weather.temperature,
      feelsLike: weather.feelsLike,
      humidity: weather.humidity,
      pressure: weather.pressure,
      visibility: weather.visibility,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      uvIndex: weather.uvIndex,
      condition: {
        code: weather.condition.code,
        description: weather.condition.description,
      },
      timestamp: weather.timestamp.toISOString(),
      temperatureMax: weather.temperatureMax,
      temperatureMin: weather.temperatureMin,
    }
  }

  private serializeForecast(forecast: IWeatherForecast): any {
    return {
      current: this.serializeCurrentWeather(forecast.current),
      hourly: forecast.hourly.map((h) => ({
        time: h.time.toISOString(),
        temperature: h.temperature,
        feelsLike: h.feelsLike,
        humidity: h.humidity,
        precipitationProbability: h.precipitationProbability,
        condition: { code: h.condition.code },
        windSpeed: h.windSpeed,
        windDirection: h.windDirection,
        pressure: h.pressure,
        uvIndex: h.uvIndex,
      })),
      daily: forecast.daily.map((d) => ({
        date: d.date.toISOString(),
        temperatureMax: d.temperatureMax,
        temperatureMin: d.temperatureMin,
        feelsLikeMax: d.feelsLikeMax,
        feelsLikeMin: d.feelsLikeMin,
        condition: { code: d.condition.code },
        precipitationSum: d.precipitationSum,
        precipitationProbability: d.precipitationProbability,
        windSpeed: d.windSpeed,
        windDirection: d.windDirection,
        uvIndex: d.uvIndex,
        sunrise: d.sunrise?.toISOString(),
        sunset: d.sunset?.toISOString(),
      })),
    }
  }
}
