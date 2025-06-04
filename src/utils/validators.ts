import type { IValidator, ValidationResult, ILocation } from "../interfaces/weather-interfaces"

export class LocationValidator implements IValidator<ILocation> {
  public validate(location: ILocation): ValidationResult {
    const errors: string[] = []

    // Validate name
    if (!location.name || typeof location.name !== "string") {
      errors.push("Location name is required and must be a string")
    } else if (location.name.trim().length === 0) {
      errors.push("Location name cannot be empty")
    } else if (location.name.length > 100) {
      errors.push("Location name cannot exceed 100 characters")
    }

    // Validate coordinates
    if (typeof location.latitude !== "number" || isNaN(location.latitude)) {
      errors.push("Latitude must be a valid number")
    } else if (location.latitude < -90 || location.latitude > 90) {
      errors.push("Latitude must be between -90 and 90 degrees")
    }

    if (typeof location.longitude !== "number" || isNaN(location.longitude)) {
      errors.push("Longitude must be a valid number")
    } else if (location.longitude < -180 || location.longitude > 180) {
      errors.push("Longitude must be between -180 and 180 degrees")
    }

    // Validate country
    if (!location.country || typeof location.country !== "string") {
      errors.push("Country is required and must be a string")
    } else if (location.country.length > 50) {
      errors.push("Country name cannot exceed 50 characters")
    }

    // Validate region
    if (!location.region || typeof location.region !== "string") {
      errors.push("Region is required and must be a string")
    } else if (location.region.length > 50) {
      errors.push("Region name cannot exceed 50 characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class SearchQueryValidator implements IValidator<string> {
  public validate(query: string): ValidationResult {
    const errors: string[] = []

    if (typeof query !== "string") {
      errors.push("Search query must be a string")
      return { isValid: false, errors }
    }

    const trimmedQuery = query.trim()

    if (trimmedQuery.length === 0) {
      errors.push("Search query cannot be empty")
    } else if (trimmedQuery.length < 2) {
      errors.push("Search query must be at least 2 characters long")
    } else if (trimmedQuery.length > 100) {
      errors.push("Search query cannot exceed 100 characters")
    }

    // Check for invalid characters
    const invalidChars = /[<>{}[\]\\/]/
    if (invalidChars.test(trimmedQuery)) {
      errors.push("Search query contains invalid characters")
    }

    // Check for SQL injection patterns
    const sqlPatterns = /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i
    if (sqlPatterns.test(trimmedQuery)) {
      errors.push("Search query contains prohibited patterns")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class CoordinatesValidator implements IValidator<{ latitude: number; longitude: number }> {
  public validate(coords: { latitude: number; longitude: number }): ValidationResult {
    const errors: string[] = []

    // Validate latitude
    if (typeof coords.latitude !== "number") {
      errors.push("Latitude must be a number")
    } else if (isNaN(coords.latitude)) {
      errors.push("Latitude must be a valid number")
    } else if (coords.latitude < -90 || coords.latitude > 90) {
      errors.push("Latitude must be between -90 and 90 degrees")
    }

    // Validate longitude
    if (typeof coords.longitude !== "number") {
      errors.push("Longitude must be a number")
    } else if (isNaN(coords.longitude)) {
      errors.push("Longitude must be a valid number")
    } else if (coords.longitude < -180 || coords.longitude > 180) {
      errors.push("Longitude must be between -180 and 180 degrees")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class TemperatureValidator implements IValidator<number> {
  private readonly minTemp: number
  private readonly maxTemp: number

  constructor(minTemp = -100, maxTemp = 100) {
    this.minTemp = minTemp
    this.maxTemp = maxTemp
  }

  public validate(temperature: number): ValidationResult {
    const errors: string[] = []

    if (typeof temperature !== "number") {
      errors.push("Temperature must be a number")
    } else if (isNaN(temperature)) {
      errors.push("Temperature must be a valid number")
    } else if (temperature < this.minTemp) {
      errors.push(`Temperature cannot be below ${this.minTemp}°C`)
    } else if (temperature > this.maxTemp) {
      errors.push(`Temperature cannot be above ${this.maxTemp}°C`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class WeatherCodeValidator implements IValidator<number> {
  private readonly validCodes = new Set([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
  ])

  public validate(code: number): ValidationResult {
    const errors: string[] = []

    if (typeof code !== "number") {
      errors.push("Weather code must be a number")
    } else if (isNaN(code)) {
      errors.push("Weather code must be a valid number")
    } else if (!Number.isInteger(code)) {
      errors.push("Weather code must be an integer")
    } else if (!this.validCodes.has(code)) {
      errors.push(`Invalid weather code: ${code}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class DateRangeValidator implements IValidator<{ startDate: Date; endDate: Date }> {
  public validate(range: { startDate: Date; endDate: Date }): ValidationResult {
    const errors: string[] = []

    // Validate start date
    if (!(range.startDate instanceof Date)) {
      errors.push("Start date must be a Date object")
    } else if (isNaN(range.startDate.getTime())) {
      errors.push("Start date must be a valid date")
    }

    // Validate end date
    if (!(range.endDate instanceof Date)) {
      errors.push("End date must be a Date object")
    } else if (isNaN(range.endDate.getTime())) {
      errors.push("End date must be a valid date")
    }

    // Validate range
    if (range.startDate instanceof Date && range.endDate instanceof Date) {
      if (range.startDate >= range.endDate) {
        errors.push("Start date must be before end date")
      }

      const maxRange = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      if (range.endDate.getTime() - range.startDate.getTime() > maxRange) {
        errors.push("Date range cannot exceed 30 days")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// Utility functions for common validations
export const ValidationUtils = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  sanitizeString(input: string): string {
    return input.trim().replace(/[<>{}[\]\\/]/g, "")
  },

  isValidTimeZone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
      return true
    } catch {
      return false
    }
  },

  validateApiKey(apiKey: string): ValidationResult {
    const errors: string[] = []

    if (!apiKey || typeof apiKey !== "string") {
      errors.push("API key is required and must be a string")
    } else if (apiKey.length < 10) {
      errors.push("API key is too short")
    } else if (apiKey.length > 100) {
      errors.push("API key is too long")
    } else if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
      errors.push("API key contains invalid characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

// Factory for creating validators
export class ValidatorFactory {
  public static createLocationValidator(): LocationValidator {
    return new LocationValidator()
  }

  public static createSearchQueryValidator(): SearchQueryValidator {
    return new SearchQueryValidator()
  }

  public static createCoordinatesValidator(): CoordinatesValidator {
    return new CoordinatesValidator()
  }

  public static createTemperatureValidator(min?: number, max?: number): TemperatureValidator {
    return new TemperatureValidator(min, max)
  }

  public static createWeatherCodeValidator(): WeatherCodeValidator {
    return new WeatherCodeValidator()
  }

  public static createDateRangeValidator(): DateRangeValidator {
    return new DateRangeValidator()
  }
}
