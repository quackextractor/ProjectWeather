import type { ILocation, IWeatherCondition } from "../interfaces/weather-interfaces"

export class Location implements ILocation {
  public readonly name: string
  public readonly latitude: number
  public readonly longitude: number
  public readonly country: string
  public readonly region: string
  public readonly timezone?: string

  constructor(data: {
    name: string
    latitude: number
    longitude: number
    country: string
    region: string
    timezone?: string
  }) {
    this.validateCoordinates(data.latitude, data.longitude)

    this.name = data.name.trim()
    this.latitude = data.latitude
    this.longitude = data.longitude
    this.country = data.country.trim()
    this.region = data.region.trim()
    this.timezone = data.timezone?.trim()
  }

  private validateCoordinates(lat: number, lon: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`)
    }
    if (lon < -180 || lon > 180) {
      throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`)
    }
  }

  public toString(): string {
    return `${this.name}, ${this.region}, ${this.country}`
  }

  public equals(other: ILocation): boolean {
    return Math.abs(this.latitude - other.latitude) < 0.001 && Math.abs(this.longitude - other.longitude) < 0.001
  }

  public static fromApiData(data: any): Location {
    return new Location({
      name: data.name || "Unknown",
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      country: data.country || "",
      region: data.admin1 || data.region || "",
      timezone: data.timezone,
    })
  }
}

export class WeatherCondition implements IWeatherCondition {
  public readonly code: number
  public readonly description: string
  public readonly icon: string
  public readonly severity: "low" | "medium" | "high" | "extreme"

  constructor(code: number, description: string) {
    this.code = code
    this.description = description
    this.icon = this.getIconFromCode(code)
    this.severity = this.getSeverityFromCode(code)
  }

  private getIconFromCode(code: number): string {
    const iconMap: Record<number, string> = {
      0: "sun",
      1: "partly-cloudy",
      2: "cloudy",
      3: "overcast",
      45: "fog",
      48: "fog",
      51: "drizzle",
      53: "drizzle",
      55: "drizzle",
      61: "rain",
      63: "rain",
      65: "heavy-rain",
      71: "snow",
      73: "snow",
      75: "heavy-snow",
      95: "thunderstorm",
      96: "thunderstorm",
      99: "thunderstorm",
    }
    return iconMap[code] || "unknown"
  }

  private getSeverityFromCode(code: number): "low" | "medium" | "high" | "extreme" {
    if ([0, 1].includes(code)) return "low"
    if ([2, 3, 45, 48, 51, 53].includes(code)) return "medium"
    if ([55, 61, 63, 71, 73].includes(code)) return "high"
    return "extreme"
  }

  public static fromCode(code: number): WeatherCondition {
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
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    }

    return new WeatherCondition(code, descriptions[code] || "Unknown")
  }
}
