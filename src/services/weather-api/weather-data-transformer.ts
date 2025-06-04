import type { ILocation, ICurrentWeather, IWeatherForecast } from "../../interfaces/weather-interfaces"
import {
  CurrentWeather,
  WeatherCondition,
  WeatherForecast,
  HourlyWeather,
  DailyWeather,
} from "../../models/forecast-models"

export class WeatherDataTransformer {
  public transformCurrentWeather(data: any, location: ILocation): ICurrentWeather {
    const current = data.current
    const daily = data.daily

    return new CurrentWeather({
      location,
      temperature: current.temperature_2m || 0,
      feelsLike: current.apparent_temperature || current.temperature_2m || 0,
      humidity: current.relative_humidity_2m || 0,
      pressure: current.pressure_msl || current.surface_pressure || 1013,
      visibility: 10, // Default value as Open-Meteo doesn't provide this
      windSpeed: current.wind_speed_10m || 0,
      windDirection: current.wind_direction_10m || 0,
      uvIndex: 5, // Default value for current weather
      condition: WeatherCondition.fromCode(current.weather_code || 0),
      timestamp: new Date(current.time || Date.now()),
      temperatureMax: daily?.temperature_2m_max?.[0] || current.temperature_2m || 0,
      temperatureMin: daily?.temperature_2m_min?.[0] || current.temperature_2m || 0,
    })
  }

  public transformForecast(data: any, location: ILocation): IWeatherForecast {
    const current = this.transformCurrentWeather(data, location)

    const hourly = (data.hourly.time || []).map(
      (time: string, index: number) =>
        new HourlyWeather({
          time: new Date(time),
          temperature: data.hourly.temperature_2m?.[index] || 0,
          feelsLike: data.hourly.apparent_temperature?.[index] || 0,
          humidity: data.hourly.relative_humidity_2m?.[index] || 0,
          precipitationProbability: data.hourly.precipitation_probability?.[index] || 0,
          condition: WeatherCondition.fromCode(data.hourly.weather_code?.[index] || 0),
          windSpeed: data.hourly.wind_speed_10m?.[index] || 0,
          windDirection: data.hourly.wind_direction_10m?.[index] || 0,
          pressure: data.hourly.surface_pressure?.[index] || 1013,
          uvIndex: data.hourly.uv_index?.[index] || 0,
        }),
    )

    const daily = (data.daily.time || []).map(
      (time: string, index: number) =>
        new DailyWeather({
          date: new Date(time),
          temperatureMax: data.daily.temperature_2m_max?.[index] || 0,
          temperatureMin: data.daily.temperature_2m_min?.[index] || 0,
          feelsLikeMax: data.daily.apparent_temperature_max?.[index] || 0,
          feelsLikeMin: data.daily.apparent_temperature_min?.[index] || 0,
          condition: WeatherCondition.fromCode(data.daily.weather_code?.[index] || 0),
          precipitationSum: data.daily.precipitation_sum?.[index] || 0,
          precipitationProbability: data.daily.precipitation_probability_max?.[index] || 0,
          windSpeed: data.daily.wind_speed_10m_max?.[index] || 0,
          windDirection: data.daily.wind_direction_10m_dominant?.[index] || 0,
          uvIndex: data.daily.uv_index_max?.[index] || 0,
          sunrise: data.daily.sunrise?.[index] ? new Date(data.daily.sunrise[index]) : undefined,
          sunset: data.daily.sunset?.[index] ? new Date(data.daily.sunset[index]) : undefined,
        }),
    )

    return new WeatherForecast({
      current,
      hourly,
      daily,
    })
  }

  public transformLocationResults(results: any[]): any[] {
    return results.filter(this.isValidLocationResult).map((result: any) => ({
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country || "",
      admin1: result.admin1 || "",
    }))
  }

  private isValidLocationResult(result: any): boolean {
    return (
      result &&
      typeof result.name === "string" &&
      typeof result.latitude === "number" &&
      typeof result.longitude === "number" &&
      result.latitude >= -90 &&
      result.latitude <= 90 &&
      result.longitude >= -180 &&
      result.longitude <= 180 &&
      !isNaN(result.latitude) &&
      !isNaN(result.longitude)
    )
  }
}
