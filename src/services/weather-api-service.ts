import type {
  IWeatherService,
  ILocation,
  ICurrentWeather,
  IWeatherForecast,
  ICacheService,
} from "../interfaces/weather-interfaces"
import { Location } from "../models/core-models"
import { WeatherApiClient } from "./weather-api/weather-api-client"
import { WeatherDataTransformer } from "./weather-api/weather-data-transformer"
import { WeatherApiCache } from "./weather-api/weather-api-cache"
import { WeatherApiSerializer } from "./weather-api/weather-api-serializer"
import { WeatherApiValidator } from "./weather-api/weather-api-validator"

export class WeatherApiService implements IWeatherService {
  private readonly client: WeatherApiClient
  private readonly transformer: WeatherDataTransformer
  private readonly cache: WeatherApiCache
  private readonly serializer: WeatherApiSerializer
  private readonly validator: WeatherApiValidator

  constructor(cacheService?: ICacheService<any>) {
    this.client = new WeatherApiClient()
    this.transformer = new WeatherDataTransformer()
    this.cache = new WeatherApiCache(cacheService)
    this.serializer = new WeatherApiSerializer()
    this.validator = new WeatherApiValidator()
  }

  public async getCurrentWeather(location: ILocation): Promise<ICurrentWeather> {
    const cached = this.cache.getCurrentWeatherFromCache(location)

    if (cached) {
      return this.serializer.deserializeCurrentWeather(cached, location)
    }

    try {
      const data = await this.client.fetchWeatherData(location.latitude, location.longitude)
      const currentWeather = this.transformer.transformCurrentWeather(data, location)

      this.cache.cacheCurrentWeather(location, currentWeather)
      return currentWeather
    } catch (error) {
      throw this.client.handleApiError(error, "getCurrentWeather")
    }
  }

  public async getForecast(location: ILocation): Promise<IWeatherForecast> {
    const cached = this.cache.getForecastFromCache(location)

    if (cached) {
      return this.serializer.deserializeForecast(cached, location)
    }

    try {
      const data = await this.client.fetchWeatherData(location.latitude, location.longitude)
      const forecast = this.transformer.transformForecast(data, location)

      this.cache.cacheForecast(location, forecast)
      return forecast
    } catch (error) {
      throw this.client.handleApiError(error, "getForecast")
    }
  }

  public async searchLocations(query: string): Promise<readonly ILocation[]> {
    if (!this.validator.validateSearchQuery(query)) {
      return []
    }

    const cached = this.cache.getLocationSearchFromCache(query)

    if (cached) {
      return cached.map((data: any) => Location.fromApiData(data))
    }

    try {
      const response = await this.client.searchLocations(query)

      if (!response.results || !Array.isArray(response.results)) {
        return []
      }

      const transformedResults = this.transformer.transformLocationResults(response.results)
      const locations = transformedResults.map((result: any) => Location.fromApiData(result))

      this.cache.cacheLocationSearch(query, response.results)
      return locations
    } catch (error) {
      throw this.client.handleApiError(error, "searchLocations")
    }
  }

  public async reverseGeocode(latitude: number, longitude: number): Promise<ILocation | null> {
    this.validator.validateCoordinates(latitude, longitude)

    const cached = this.cache.getReverseGeocodeFromCache(latitude, longitude)

    if (cached) {
      return Location.fromApiData(cached)
    }

    try {
      // Open-Meteo doesn't provide reverse geocoding, so we create a basic location
      const location = new Location({
        name: "Current Location",
        latitude,
        longitude,
        country: "",
        region: "",
      })

      const locationData = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        admin1: location.region,
      }

      this.cache.cacheReverseGeocode(latitude, longitude, locationData)
      return location
    } catch (error) {
      console.error("Failed to reverse geocode:", error)
      return null
    }
  }
}
