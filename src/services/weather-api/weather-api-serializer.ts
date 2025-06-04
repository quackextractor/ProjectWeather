import type { ICurrentWeather, IWeatherForecast, ILocation } from "../../interfaces/weather-interfaces"
import {
  CurrentWeather,
  WeatherCondition,
  WeatherForecast,
  HourlyWeather,
  DailyWeather,
} from "../../models/forecast-models"

export class WeatherApiSerializer {
  public deserializeCurrentWeather(data: any, location: ILocation): ICurrentWeather {
    return new CurrentWeather({
      location,
      temperature: data.temperature,
      feelsLike: data.feelsLike,
      humidity: data.humidity,
      pressure: data.pressure,
      visibility: data.visibility,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      uvIndex: data.uvIndex,
      condition: WeatherCondition.fromCode(data.condition.code),
      timestamp: new Date(data.timestamp),
      temperatureMax: data.temperatureMax,
      temperatureMin: data.temperatureMin,
    })
  }

  public deserializeForecast(data: any, location: ILocation): IWeatherForecast {
    const current = this.deserializeCurrentWeather(data.current, location)

    const hourly = data.hourly.map(
      (h: any) =>
        new HourlyWeather({
          time: new Date(h.time),
          temperature: h.temperature,
          feelsLike: h.feelsLike,
          humidity: h.humidity,
          precipitationProbability: h.precipitationProbability,
          condition: WeatherCondition.fromCode(h.condition.code),
          windSpeed: h.windSpeed,
          windDirection: h.windDirection,
          pressure: h.pressure,
          uvIndex: h.uvIndex,
        }),
    )

    const daily = data.daily.map(
      (d: any) =>
        new DailyWeather({
          date: new Date(d.date),
          temperatureMax: d.temperatureMax,
          temperatureMin: d.temperatureMin,
          feelsLikeMax: d.feelsLikeMax,
          feelsLikeMin: d.feelsLikeMin,
          condition: WeatherCondition.fromCode(d.condition.code),
          precipitationSum: d.precipitationSum,
          precipitationProbability: d.precipitationProbability,
          windSpeed: d.windSpeed,
          windDirection: d.windDirection,
          uvIndex: d.uvIndex,
          sunrise: d.sunrise ? new Date(d.sunrise) : undefined,
          sunset: d.sunset ? new Date(d.sunset) : undefined,
        }),
    )

    return new WeatherForecast({ current, hourly, daily })
  }
}
