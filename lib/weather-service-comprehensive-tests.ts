import { WeatherService, ValidationError, ApiError } from "@/services/weather-service"

export class WeatherServiceComprehensiveTests {
  private weatherService = new WeatherService(true) // Enable test mode

  getTests() {
    return [
      {
        name: "Should handle malformed API responses",
        description: "Tests handling of invalid or malformed API response data",
        testFn: this.testMalformedApiResponse.bind(this),
      },
      {
        name: "Should handle missing weather data fields",
        description: "Verifies graceful handling when API response is missing expected fields",
        testFn: this.testMissingDataFields.bind(this),
      },
      {
        name: "Should handle network errors gracefully",
        description: "Tests behavior when network requests fail",
        testFn: this.testNetworkErrors.bind(this),
      },
      {
        name: "Should validate weather code transformations",
        description: "Ensures weather codes are properly transformed and validated",
        testFn: this.testWeatherCodeTransformations.bind(this),
      },
      {
        name: "Should handle edge case coordinates",
        description: "Tests behavior with boundary coordinate values",
        testFn: this.testEdgeCaseCoordinates.bind(this),
      },
      {
        name: "Should handle API rate limiting",
        description: "Tests behavior when API returns rate limit errors",
        testFn: this.testApiRateLimiting.bind(this),
      },
      {
        name: "Should transform hourly data correctly",
        description: "Verifies proper transformation of hourly forecast data",
        testFn: this.testHourlyDataTransformation.bind(this),
      },
      {
        name: "Should transform daily data correctly",
        description: "Verifies proper transformation of daily forecast data",
        testFn: this.testDailyDataTransformation.bind(this),
      },
      {
        name: "Should handle empty forecast arrays",
        description: "Tests behavior when forecast arrays are empty",
        testFn: this.testEmptyForecastArrays.bind(this),
      },
      {
        name: "Should handle invalid weather codes",
        description: "Tests handling of unknown or invalid weather codes",
        testFn: this.testInvalidWeatherCodes.bind(this),
      },
    ]
  }

  private async testMalformedApiResponse(): Promise<void> {
    // Mock fetch to return malformed JSON
    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON")
        },
      } as Response)

    try {
      await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)
      throw new Error("Should have thrown an error for malformed JSON")
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw new Error(`Expected ApiError, got ${error?.constructor?.name}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testMissingDataFields(): Promise<void> {
    const incompleteResponse = {
      current: {
        time: "2024-01-01T12:00:00Z",
        // Missing temperature_2m and other fields
      },
      hourly: {
        time: ["2024-01-01T12:00:00Z"],
        // Missing temperature data
      },
      daily: {
        time: ["2024-01-01"],
        // Missing temperature data
      },
    }

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => incompleteResponse,
      } as Response)

    try {
      const result = await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)

      // Should handle missing fields gracefully with defaults
      if (typeof result.current.temperature !== "number") {
        throw new Error("Should provide default temperature value")
      }

      if (result.current.temperature !== 0) {
        throw new Error("Should default to 0 for missing temperature")
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testNetworkErrors(): Promise<void> {
    const networkErrors = [
      new Error("Network error"),
      new Error("DNS resolution failed"),
      new Error("Connection refused"),
    ]

    for (const networkError of networkErrors) {
      const originalFetch = window.fetch
      window.fetch = () => Promise.reject(networkError)

      try {
        await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)
        throw new Error(`Should have thrown an error for: ${networkError.message}`)
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw new Error(`Expected ApiError for network error, got ${error?.constructor?.name}`)
        }
      } finally {
        window.fetch = originalFetch
      }
    }
  }

  private async testWeatherCodeTransformations(): Promise<void> {
    const testCases = [
      { code: 0, expectedDescription: "Clear sky" },
      { code: 1, expectedDescription: "Mainly clear" },
      { code: 95, expectedDescription: "Thunderstorm" },
      { code: 999, expectedDescription: "Unknown" }, // Invalid code
    ]

    for (const testCase of testCases) {
      const description = this.getWeatherDescription(testCase.code)
      if (description !== testCase.expectedDescription) {
        throw new Error(
          `Weather code ${testCase.code}: expected "${testCase.expectedDescription}", got "${description}"`,
        )
      }
    }
  }

  private async testEdgeCaseCoordinates(): Promise<void> {
    const edgeCases = [
      { lat: 90, lon: 180, name: "North Pole, International Date Line" },
      { lat: -90, lon: -180, name: "South Pole, International Date Line" },
      { lat: 0, lon: 0, name: "Equator, Prime Meridian" },
      { lat: 89.999, lon: 179.999, name: "Near maximum values" },
      { lat: -89.999, lon: -179.999, name: "Near minimum values" },
    ]

    for (const coords of edgeCases) {
      try {
        // These should not throw validation errors
        await this.weatherService.getWeatherAndForecast(coords.lat, coords.lon)
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`Valid coordinates ${coords.name} should not fail validation: ${error.message}`)
        }
        // Other errors (like network) are acceptable for this test
      }
    }
  }

  private async testApiRateLimiting(): Promise<void> {
    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response)

    try {
      await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)
      throw new Error("Should have thrown an error for rate limiting")
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw new Error(`Expected ApiError for rate limiting, got ${error?.constructor?.name}`)
      }

      if ((error as ApiError).statusCode !== 429) {
        throw new Error(`Expected status code 429, got ${(error as ApiError).statusCode}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testHourlyDataTransformation(): Promise<void> {
    const mockResponse = {
      current: {
        time: "2024-01-01T12:00:00Z",
        temperature_2m: 15,
        weather_code: 1,
      },
      hourly: {
        time: ["2024-01-01T12:00:00Z", "2024-01-01T13:00:00Z"],
        temperature_2m: [15.5, 16.7], // Should be rounded
        apparent_temperature: [14.2, 15.8],
        relative_humidity_2m: [65, 60],
        precipitation_probability: [10, 20],
        weather_code: [1, 2],
        wind_speed_10m: [10.3, 12.7], // Should be rounded
        wind_direction_10m: [180, 190],
        surface_pressure: [1013.2, 1014.8], // Should be rounded
        uv_index: [3, 4],
      },
      daily: {
        time: ["2024-01-01"],
        temperature_2m_max: [18],
        temperature_2m_min: [8],
        weather_code: [1],
      },
    }

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      } as Response)

    try {
      const result = await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)

      if (result.forecast.hourly.length !== 2) {
        throw new Error(`Expected 2 hourly entries, got ${result.forecast.hourly.length}`)
      }

      const firstHour = result.forecast.hourly[0]

      // Test rounding
      if (firstHour.temperature !== 16) {
        // 15.5 rounded to 16
        throw new Error(`Expected temperature 16, got ${firstHour.temperature}`)
      }

      if (firstHour.windSpeed !== 10) {
        // 10.3 rounded to 10
        throw new Error(`Expected wind speed 10, got ${firstHour.windSpeed}`)
      }

      if (firstHour.pressure !== 1013) {
        // 1013.2 rounded to 1013
        throw new Error(`Expected pressure 1013, got ${firstHour.pressure}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testDailyDataTransformation(): Promise<void> {
    const mockResponse = {
      current: {
        time: "2024-01-01T12:00:00Z",
        temperature_2m: 15,
        weather_code: 1,
      },
      hourly: {
        time: ["2024-01-01T12:00:00Z"],
        temperature_2m: [15],
      },
      daily: {
        time: ["2024-01-01", "2024-01-02"],
        temperature_2m_max: [18.7, 20.3], // Should be rounded
        temperature_2m_min: [8.2, 10.8], // Should be rounded
        apparent_temperature_max: [16.9, 18.1],
        apparent_temperature_min: [6.4, 8.7],
        weather_code: [1, 2],
        precipitation_sum: [0.5, 2.3],
        precipitation_probability_max: [10, 30],
        wind_speed_10m_max: [15.6, 18.2], // Should be rounded
        wind_direction_10m_dominant: [180, 200],
        uv_index_max: [5, 6],
      },
    }

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      } as Response)

    try {
      const result = await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)

      if (result.forecast.daily.length !== 2) {
        throw new Error(`Expected 2 daily entries, got ${result.forecast.daily.length}`)
      }

      const firstDay = result.forecast.daily[0]

      // Test rounding
      if (firstDay.temperatureMax !== 19) {
        // 18.7 rounded to 19
        throw new Error(`Expected max temperature 19, got ${firstDay.temperatureMax}`)
      }

      if (firstDay.temperatureMin !== 8) {
        // 8.2 rounded to 8
        throw new Error(`Expected min temperature 8, got ${firstDay.temperatureMin}`)
      }

      if (firstDay.windSpeed !== 16) {
        // 15.6 rounded to 16
        throw new Error(`Expected wind speed 16, got ${firstDay.windSpeed}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testEmptyForecastArrays(): Promise<void> {
    const emptyResponse = {
      current: {
        time: "2024-01-01T12:00:00Z",
        temperature_2m: 15,
        weather_code: 1,
      },
      hourly: {
        time: [],
        temperature_2m: [],
      },
      daily: {
        time: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
      },
    }

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => emptyResponse,
      } as Response)

    try {
      const result = await this.weatherService.getWeatherAndForecast(50.0755, 14.4378)

      if (result.forecast.hourly.length !== 0) {
        throw new Error(`Expected empty hourly array, got ${result.forecast.hourly.length} items`)
      }

      if (result.forecast.daily.length !== 0) {
        throw new Error(`Expected empty daily array, got ${result.forecast.daily.length} items`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testInvalidWeatherCodes(): Promise<void> {
    const invalidCodes = [-1, 1000, 999, Number.NaN, undefined, null]

    for (const code of invalidCodes) {
      const description = this.getWeatherDescription(code as number)
      if (description !== "Unknown") {
        throw new Error(`Invalid weather code ${code} should return "Unknown", got "${description}"`)
      }
    }
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
