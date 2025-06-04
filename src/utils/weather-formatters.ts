/**
 * Weather-specific formatting utilities
 * Provides consistent formatting for weather measurements
 */

export class TemperatureFormatter {
  public static format(temperature: number, unit: "celsius" | "fahrenheit" = "celsius", precision = 0): string {
    let temp = temperature

    if (unit === "fahrenheit") {
      temp = (temperature * 9) / 5 + 32
    }

    const symbol = unit === "celsius" ? "°C" : "°F"
    return `${temp.toFixed(precision)}${symbol}`
  }

  public static convert(
    temperature: number,
    fromUnit: "celsius" | "fahrenheit",
    toUnit: "celsius" | "fahrenheit",
  ): number {
    if (fromUnit === toUnit) return temperature

    if (fromUnit === "celsius" && toUnit === "fahrenheit") {
      return (temperature * 9) / 5 + 32
    }

    if (fromUnit === "fahrenheit" && toUnit === "celsius") {
      return ((temperature - 32) * 5) / 9
    }

    return temperature
  }

  public static getComfortLevel(
    temperature: number,
    unit: "celsius" | "fahrenheit" = "celsius",
  ): {
    level: "freezing" | "cold" | "cool" | "comfortable" | "warm" | "hot" | "extreme"
    description: string
    color: string
  } {
    let temp = temperature
    if (unit === "fahrenheit") {
      temp = ((temperature - 32) * 5) / 9 // Convert to Celsius for comparison
    }

    if (temp < -10) {
      return { level: "freezing", description: "Freezing", color: "#1e40af" }
    } else if (temp < 5) {
      return { level: "cold", description: "Cold", color: "#3b82f6" }
    } else if (temp < 15) {
      return { level: "cool", description: "Cool", color: "#06b6d4" }
    } else if (temp < 25) {
      return { level: "comfortable", description: "Comfortable", color: "#10b981" }
    } else if (temp < 30) {
      return { level: "warm", description: "Warm", color: "#f59e0b" }
    } else if (temp < 40) {
      return { level: "hot", description: "Hot", color: "#ef4444" }
    } else {
      return { level: "extreme", description: "Extreme Heat", color: "#dc2626" }
    }
  }
}

export class WindFormatter {
  public static formatSpeed(speed: number, unit: "kmh" | "mph" | "ms" = "kmh"): string {
    let convertedSpeed = speed
    let unitSymbol = "km/h"

    switch (unit) {
      case "mph":
        convertedSpeed = speed * 0.621371
        unitSymbol = "mph"
        break
      case "ms":
        convertedSpeed = speed / 3.6
        unitSymbol = "m/s"
        break
    }

    return `${Math.round(convertedSpeed)} ${unitSymbol}`
  }

  public static getDirection(degrees: number): string {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]

    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  public static getDirectionName(degrees: number): string {
    const directions = [
      "North",
      "North-Northeast",
      "Northeast",
      "East-Northeast",
      "East",
      "East-Southeast",
      "Southeast",
      "South-Southeast",
      "South",
      "South-Southwest",
      "Southwest",
      "West-Southwest",
      "West",
      "West-Northwest",
      "Northwest",
      "North-Northwest",
    ]

    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  public static getBeaufortScale(speedKmh: number): {
    scale: number
    description: string
    effects: string
  } {
    if (speedKmh < 1) {
      return { scale: 0, description: "Calm", effects: "Smoke rises vertically" }
    } else if (speedKmh < 6) {
      return { scale: 1, description: "Light air", effects: "Smoke drift indicates wind direction" }
    } else if (speedKmh < 12) {
      return { scale: 2, description: "Light breeze", effects: "Wind felt on face, leaves rustle" }
    } else if (speedKmh < 20) {
      return { scale: 3, description: "Gentle breeze", effects: "Leaves and small twigs in motion" }
    } else if (speedKmh < 29) {
      return { scale: 4, description: "Moderate breeze", effects: "Small branches move, dust raised" }
    } else if (speedKmh < 39) {
      return { scale: 5, description: "Fresh breeze", effects: "Small trees sway" }
    } else if (speedKmh < 50) {
      return { scale: 6, description: "Strong breeze", effects: "Large branches move" }
    } else if (speedKmh < 62) {
      return { scale: 7, description: "High wind", effects: "Whole trees in motion" }
    } else if (speedKmh < 75) {
      return { scale: 8, description: "Gale", effects: "Twigs break off trees" }
    } else if (speedKmh < 89) {
      return { scale: 9, description: "Strong gale", effects: "Slight structural damage" }
    } else if (speedKmh < 103) {
      return { scale: 10, description: "Storm", effects: "Trees uprooted" }
    } else if (speedKmh < 118) {
      return { scale: 11, description: "Violent storm", effects: "Widespread damage" }
    } else {
      return { scale: 12, description: "Hurricane", effects: "Devastating damage" }
    }
  }
}

export class PressureFormatter {
  public static format(pressure: number, unit: "hPa" | "inHg" | "mmHg" = "hPa"): string {
    let convertedPressure = pressure
    let unitSymbol = "hPa"

    switch (unit) {
      case "inHg":
        convertedPressure = pressure * 0.02953
        unitSymbol = "inHg"
        break
      case "mmHg":
        convertedPressure = pressure * 0.75006
        unitSymbol = "mmHg"
        break
    }

    const precision = unit === "inHg" ? 2 : 0
    return `${convertedPressure.toFixed(precision)} ${unitSymbol}`
  }

  public static getTrend(
    currentPressure: number,
    previousPressure: number,
  ): {
    trend: "rising" | "falling" | "steady"
    description: string
    symbol: string
  } {
    const diff = currentPressure - previousPressure

    if (Math.abs(diff) < 1) {
      return { trend: "steady", description: "Steady", symbol: "→" }
    } else if (diff > 0) {
      return { trend: "rising", description: "Rising", symbol: "↗" }
    } else {
      return { trend: "falling", description: "Falling", symbol: "↘" }
    }
  }
}

export class HumidityFormatter {
  public static format(humidity: number): string {
    return `${Math.round(humidity)}%`
  }

  public static getComfortLevel(humidity: number): {
    level: "very-dry" | "dry" | "comfortable" | "humid" | "very-humid"
    description: string
    color: string
  } {
    if (humidity < 30) {
      return { level: "very-dry", description: "Very Dry", color: "#dc2626" }
    } else if (humidity < 40) {
      return { level: "dry", description: "Dry", color: "#f59e0b" }
    } else if (humidity <= 60) {
      return { level: "comfortable", description: "Comfortable", color: "#10b981" }
    } else if (humidity <= 70) {
      return { level: "humid", description: "Humid", color: "#f59e0b" }
    } else {
      return { level: "very-humid", description: "Very Humid", color: "#dc2626" }
    }
  }
}

export class UVIndexFormatter {
  public static format(uvIndex: number): string {
    return Math.round(uvIndex).toString()
  }

  public static getLevel(uvIndex: number): {
    level: "low" | "moderate" | "high" | "very-high" | "extreme"
    description: string
    color: string
    protection: string
  } {
    if (uvIndex <= 2) {
      return {
        level: "low",
        description: "Low",
        color: "#10b981",
        protection: "No protection required",
      }
    } else if (uvIndex <= 5) {
      return {
        level: "moderate",
        description: "Moderate",
        color: "#f59e0b",
        protection: "Seek shade during midday hours",
      }
    } else if (uvIndex <= 7) {
      return {
        level: "high",
        description: "High",
        color: "#ef4444",
        protection: "Protection required",
      }
    } else if (uvIndex <= 10) {
      return {
        level: "very-high",
        description: "Very High",
        color: "#dc2626",
        protection: "Extra protection required",
      }
    } else {
      return {
        level: "extreme",
        description: "Extreme",
        color: "#7c2d12",
        protection: "Avoid being outside",
      }
    }
  }
}
