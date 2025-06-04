import { jest } from "@jest/globals"

export function setupTestMocks() {
  // Mock fetch if not available
  if (typeof global.fetch === "undefined") {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      // Mock weather API responses
      if (url.includes("api.open-meteo.com/v1/forecast")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              current: {
                time: new Date().toISOString(),
                temperature_2m: 20,
                apparent_temperature: 18,
                relative_humidity_2m: 65,
                weather_code: 1,
                pressure_msl: 1013,
                wind_speed_10m: 10,
                wind_direction_10m: 180,
              },
              hourly: {
                time: Array.from({ length: 24 }, (_, i) => new Date(Date.now() + i * 3600000).toISOString()),
                temperature_2m: Array.from({ length: 24 }, () => 20 + Math.random() * 10),
                apparent_temperature: Array.from({ length: 24 }, () => 18 + Math.random() * 10),
                relative_humidity_2m: Array.from({ length: 24 }, () => 60 + Math.random() * 20),
                precipitation_probability: Array.from({ length: 24 }, () => Math.random() * 100),
                weather_code: Array.from({ length: 24 }, () => Math.floor(Math.random() * 3)),
                wind_speed_10m: Array.from({ length: 24 }, () => 5 + Math.random() * 15),
                wind_direction_10m: Array.from({ length: 24 }, () => Math.random() * 360),
                surface_pressure: Array.from({ length: 24 }, () => 1010 + Math.random() * 10),
                uv_index: Array.from({ length: 24 }, () => Math.random() * 10),
              },
              daily: {
                time: Array.from(
                  { length: 7 },
                  (_, i) => new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
                ),
                temperature_2m_max: Array.from({ length: 7 }, () => 25 + Math.random() * 10),
                temperature_2m_min: Array.from({ length: 7 }, () => 15 + Math.random() * 5),
                apparent_temperature_max: Array.from({ length: 7 }, () => 23 + Math.random() * 10),
                apparent_temperature_min: Array.from({ length: 7 }, () => 13 + Math.random() * 5),
                weather_code: Array.from({ length: 7 }, () => Math.floor(Math.random() * 3)),
                precipitation_sum: Array.from({ length: 7 }, () => Math.random() * 10),
                precipitation_probability_max: Array.from({ length: 7 }, () => Math.random() * 100),
                wind_speed_10m_max: Array.from({ length: 7 }, () => 10 + Math.random() * 20),
                wind_direction_10m_dominant: Array.from({ length: 7 }, () => Math.random() * 360),
                uv_index_max: Array.from({ length: 7 }, () => Math.random() * 10),
              },
            }),
        })
      }

      // Mock geocoding API responses
      if (url.includes("geocoding-api.open-meteo.com/v1/search")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  name: "Prague",
                  latitude: 50.0755,
                  longitude: 14.4378,
                  country: "Czech Republic",
                  admin1: "Prague",
                },
                {
                  name: "London",
                  latitude: 51.5074,
                  longitude: -0.1278,
                  country: "United Kingdom",
                  admin1: "England",
                },
              ],
            }),
        })
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })
  }

  // Mock localStorage
  if (typeof global.localStorage === "undefined") {
    const storage = new Map<string, string>()
    global.localStorage = {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      length: storage.size,
      key: (index: number) => Array.from(storage.keys())[index] || null,
    }
  }

  // Mock navigator.geolocation
  if (typeof global.navigator === "undefined") {
    global.navigator = {} as any
  }

  if (!global.navigator.geolocation) {
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 50.0755,
            longitude: 14.4378,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        })
      }),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    }
  }

  // Mock window.matchMedia for theme detection
  if (typeof global.matchMedia === "undefined") {
    global.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  }
}

// Initialize mocks
setupTestMocks()
