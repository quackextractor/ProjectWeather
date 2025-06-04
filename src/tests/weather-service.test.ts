/**
 * Unit tests for weather service
 * Comprehensive test coverage for all weather-related functionality
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { WeatherApiService } from "../services/weather-api-service"
import { MemoryCacheService } from "../services/cache-service"
import { Location, WeatherCondition } from "../models/weather-models"
import { ApiError, ValidationError } from "../utils/error-handler"

// Mock fetch globally
global.fetch = vi.fn()

describe("WeatherApiService", () => {
  let weatherService: WeatherApiService
  let mockCache: MemoryCacheService<any>
  let mockLocation: Location

  beforeEach(() => {
    mockCache = new MemoryCacheService(10, 300000)
    weatherService = new WeatherApiService(mockCache)
    mockLocation = new Location({
      name: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      country: "Czech Republic",
      region: "Prague",
    })

    // Reset fetch mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getCurrentWeather", () => {
    it("should fetch and return current weather data", async () => {
      const mockApiResponse = {
        current: {
          time: "2024-01-01T12:00:00Z",
          temperature_2m: 15,
          apparent_temperature: 13,
          relative_humidity_2m: 65,
          weather_code: 1,
          pressure_msl: 1013,
          wind_speed_10m: 10,
          wind_direction_10m: 180,
        },
        daily: {
          temperature_2m_max: [18],
          temperature_2m_min: [8],
        },
      }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const result = await weatherService.getCurrentWeather(mockLocation)

      expect(result.temperature).toBe(15)
      expect(result.feelsLike).toBe(13)
      expect(result.humidity).toBe(65)
      expect(result.condition.code).toBe(1)
      expect(result.location).toBe(mockLocation)
    })

    it("should return cached data when available", async () => {
      const mockWeatherData = {
        temperature: 20,
        feelsLike: 18,
        humidity: 60,
        pressure: 1015,
        visibility: 10,
        windSpeed: 5,
        windDirection: 90,
        uvIndex: 5,
        condition: { code: 0 },
        timestamp: new Date().toISOString(),
        temperatureMax: 25,
        temperatureMin: 15,
      }

      mockCache.set("current_50.0755_14.4378", mockWeatherData)

      const result = await weatherService.getCurrentWeather(mockLocation)

      expect(result.temperature).toBe(20)
      expect(fetch).not.toHaveBeenCalled()
    })

    it("should handle API errors gracefully", async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      await expect(weatherService.getCurrentWeather(mockLocation)).rejects.toThrow(ApiError)
    })

    it("should handle network errors", async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error("Network error"))

      await expect(weatherService.getCurrentWeather(mockLocation)).rejects.toThrow()
    })
  })

  describe("searchLocations", () => {
    it("should search and return locations", async () => {
      const mockApiResponse = {
        results: [
          {
            name: "Prague",
            latitude: 50.0755,
            longitude: 14.4378,
            country: "Czech Republic",
            admin1: "Prague",
          },
          {
            name: "Brno",
            latitude: 49.1951,
            longitude: 16.6068,
            country: "Czech Republic",
            admin1: "South Moravian",
          },
        ],
      }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const results = await weatherService.searchLocations("Prague")

      expect(results).toHaveLength(2)
      expect(results[0].name).toBe("Prague")
      expect(results[1].name).toBe("Brno")
    })

    it("should return empty array for short queries", async () => {
      const results = await weatherService.searchLocations("P")
      expect(results).toHaveLength(0)
      expect(fetch).not.toHaveBeenCalled()
    })

    it("should return cached search results", async () => {
      const mockResults = [
        {
          name: "Prague",
          latitude: 50.0755,
          longitude: 14.4378,
          country: "Czech Republic",
          admin1: "Prague",
        },
      ]

      mockCache.set("search_prague", mockResults)

      const results = await weatherService.searchLocations("Prague")

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe("Prague")
      expect(fetch).not.toHaveBeenCalled()
    })

    it("should filter invalid location results", async () => {
      const mockApiResponse = {
        results: [
          {
            name: "Valid Location",
            latitude: 50.0755,
            longitude: 14.4378,
            country: "Czech Republic",
            admin1: "Prague",
          },
          {
            name: "Invalid Location",
            latitude: "invalid",
            longitude: 14.4378,
            country: "Czech Republic",
            admin1: "Prague",
          },
          {
            name: "Another Invalid",
            latitude: 91, // Invalid latitude
            longitude: 14.4378,
            country: "Czech Republic",
            admin1: "Prague",
          },
        ],
      }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const results = await weatherService.searchLocations("test")

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe("Valid Location")
    })
  })

  describe("reverseGeocode", () => {
    it("should create a basic location for valid coordinates", async () => {
      const result = await weatherService.reverseGeocode(50.0755, 14.4378)

      expect(result).not.toBeNull()
      expect(result!.name).toBe("Current Location")
      expect(result!.latitude).toBe(50.0755)
      expect(result!.longitude).toBe(14.4378)
    })

    it("should validate coordinates", async () => {
      await expect(weatherService.reverseGeocode(91, 14.4378)).rejects.toThrow(ValidationError)

      await expect(weatherService.reverseGeocode(50.0755, 181)).rejects.toThrow(ValidationError)

      await expect(weatherService.reverseGeocode(Number.NaN, 14.4378)).rejects.toThrow(ValidationError)
    })
  })

  describe("getForecast", () => {
    it("should fetch and return forecast data", async () => {
      const mockApiResponse = {
        current: {
          time: "2024-01-01T12:00:00Z",
          temperature_2m: 15,
          apparent_temperature: 13,
          relative_humidity_2m: 65,
          weather_code: 1,
          pressure_msl: 1013,
          wind_speed_10m: 10,
          wind_direction_10m: 180,
        },
        hourly: {
          time: ["2024-01-01T12:00:00Z", "2024-01-01T13:00:00Z"],
          temperature_2m: [15, 16],
          apparent_temperature: [13, 14],
          relative_humidity_2m: [65, 60],
          precipitation_probability: [10, 20],
          weather_code: [1, 2],
          wind_speed_10m: [10, 12],
          wind_direction_10m: [180, 190],
          surface_pressure: [1013, 1014],
          uv_index: [3, 4],
        },
        daily: {
          time: ["2024-01-01", "2024-01-02"],
          temperature_2m_max: [18, 20],
          temperature_2m_min: [8, 10],
          apparent_temperature_max: [16, 18],
          apparent_temperature_min: [6, 8],
          weather_code: [1, 2],
          precipitation_sum: [0, 2],
          precipitation_probability_max: [10, 30],
          wind_speed_10m_max: [15, 18],
          wind_direction_10m_dominant: [180, 200],
          uv_index_max: [5, 6],
        },
      }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      })

      const result = await weatherService.getForecast(mockLocation)

      expect(result.current.temperature).toBe(15)
      expect(result.hourly).toHaveLength(2)
      expect(result.daily).toHaveLength(2)
      expect(result.hourly[0].temperature).toBe(15)
      expect(result.daily[0].temperatureMax).toBe(18)
    })
  })
})

describe("Location Model", () => {
  it("should create a valid location", () => {
    const location = new Location({
      name: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      country: "Czech Republic",
      region: "Prague",
    })

    expect(location.name).toBe("Prague")
    expect(location.latitude).toBe(50.0755)
    expect(location.longitude).toBe(14.4378)
  })

  it("should validate coordinates", () => {
    expect(
      () =>
        new Location({
          name: "Invalid",
          latitude: 91,
          longitude: 14.4378,
          country: "Czech Republic",
          region: "Prague",
        }),
    ).toThrow("Invalid latitude")

    expect(
      () =>
        new Location({
          name: "Invalid",
          latitude: 50.0755,
          longitude: 181,
          country: "Czech Republic",
          region: "Prague",
        }),
    ).toThrow("Invalid longitude")
  })

  it("should compare locations correctly", () => {
    const location1 = new Location({
      name: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      country: "Czech Republic",
      region: "Prague",
    })

    const location2 = new Location({
      name: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      country: "Czech Republic",
      region: "Prague",
    })

    const location3 = new Location({
      name: "Brno",
      latitude: 49.1951,
      longitude: 16.6068,
      country: "Czech Republic",
      region: "South Moravian",
    })

    expect(location1.equals(location2)).toBe(true)
    expect(location1.equals(location3)).toBe(false)
  })

  it("should create location from API data", () => {
    const apiData = {
      name: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      country: "Czech Republic",
      admin1: "Prague",
    }

    const location = Location.fromApiData(apiData)

    expect(location.name).toBe("Prague")
    expect(location.region).toBe("Prague")
  })
})

describe("WeatherCondition Model", () => {
  it("should create weather condition from code", () => {
    const condition = WeatherCondition.fromCode(0)

    expect(condition.code).toBe(0)
    expect(condition.description).toBe("Clear sky")
    expect(condition.icon).toBe("sun")
    expect(condition.severity).toBe("low")
  })

  it("should handle unknown weather codes", () => {
    const condition = WeatherCondition.fromCode(999)

    expect(condition.code).toBe(999)
    expect(condition.description).toBe("Unknown")
    expect(condition.icon).toBe("unknown")
  })

  it("should assign correct severity levels", () => {
    expect(WeatherCondition.fromCode(0).severity).toBe("low") // Clear sky
    expect(WeatherCondition.fromCode(2).severity).toBe("medium") // Partly cloudy
    expect(WeatherCondition.fromCode(61).severity).toBe("high") // Rain
    expect(WeatherCondition.fromCode(95).severity).toBe("extreme") // Thunderstorm
  })
})

describe("MemoryCacheService", () => {
  let cache: MemoryCacheService<string>

  beforeEach(() => {
    cache = new MemoryCacheService(3, 1000) // Max 3 items, 1 second TTL
  })

  it("should store and retrieve values", () => {
    cache.set("key1", "value1")
    expect(cache.get("key1")).toBe("value1")
  })

  it("should return null for non-existent keys", () => {
    expect(cache.get("nonexistent")).toBeNull()
  })

  it("should expire values after TTL", async () => {
    cache.set("key1", "value1", 100) // 100ms TTL
    expect(cache.get("key1")).toBe("value1")

    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(cache.get("key1")).toBeNull()
  })

  it("should evict oldest items when cache is full", () => {
    cache.set("key1", "value1")
    cache.set("key2", "value2")
    cache.set("key3", "value3")
    cache.set("key4", "value4") // Should evict key1

    expect(cache.get("key1")).toBeNull()
    expect(cache.get("key2")).toBe("value2")
    expect(cache.get("key3")).toBe("value3")
    expect(cache.get("key4")).toBe("value4")
  })

  it("should clear all values", () => {
    cache.set("key1", "value1")
    cache.set("key2", "value2")

    cache.clear()

    expect(cache.get("key1")).toBeNull()
    expect(cache.get("key2")).toBeNull()
    expect(cache.size()).toBe(0)
  })

  it("should delete specific keys", () => {
    cache.set("key1", "value1")
    cache.set("key2", "value2")

    cache.delete("key1")

    expect(cache.get("key1")).toBeNull()
    expect(cache.get("key2")).toBe("value2")
  })
})
