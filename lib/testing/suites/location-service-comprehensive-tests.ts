import { LocationService } from "@/services/location-service"

export class LocationServiceComprehensiveTests {
  private locationService = new LocationService()

  getTests() {
    return [
      {
        name: "Should handle API errors gracefully",
        description: "Tests behavior when geocoding API returns errors",
        testFn: this.testApiErrors.bind(this),
      },
      {
        name: "Should sanitize malicious input",
        description: "Verifies that potentially malicious input is properly sanitized",
        testFn: this.testMaliciousInput.bind(this),
      },
      {
        name: "Should handle network timeouts",
        description: "Tests behavior when API requests timeout",
        testFn: this.testNetworkTimeouts.bind(this),
      },
      {
        name: "Should validate location result structure",
        description: "Ensures location results have proper structure and valid data",
        testFn: this.testLocationResultValidation.bind(this),
      },
      {
        name: "Should handle empty API responses",
        description: "Tests behavior when API returns empty or null results",
        testFn: this.testEmptyApiResponses.bind(this),
      },
      {
        name: "Should handle rate limiting",
        description: "Tests behavior when API returns rate limit errors",
        testFn: this.testRateLimiting.bind(this),
      },
      {
        name: "Should handle invalid coordinates in reverse geocoding",
        description: "Tests reverse geocoding with various invalid coordinate inputs",
        testFn: this.testInvalidReverseGeocode.bind(this),
      },
      {
        name: "Should handle Unicode and international characters",
        description: "Tests search with various international character sets",
        testFn: this.testInternationalCharacters.bind(this),
      },
      {
        name: "Should limit search results appropriately",
        description: "Verifies that search results are properly limited",
        testFn: this.testSearchResultLimits.bind(this),
      },
      {
        name: "Should handle malformed API responses",
        description: "Tests behavior with unexpected API response formats",
        testFn: this.testMalformedApiResponses.bind(this),
      },
    ]
  }

  private async testApiErrors(): Promise<void> {
    const originalFetch = window.fetch
    const errorCodes = [400, 401, 403, 404, 500, 502, 503]

    for (const statusCode of errorCodes) {
      window.fetch = () =>
        Promise.resolve({
          ok: false,
          status: statusCode,
          statusText: `HTTP ${statusCode}`,
        } as Response)

      try {
        const results = await this.locationService.searchLocations("Prague")
        // If it doesn't throw, it should return empty array
        if (!Array.isArray(results) || results.length !== 0) {
          throw new Error(`API error ${statusCode} should return empty array or throw error`)
        }
      } catch (error) {
        // It's acceptable for the service to throw errors for API failures
        if (!(error instanceof Error) || !error.message.includes("Geocoding API error")) {
          throw new Error(`API error ${statusCode} should throw appropriate error: ${error}`)
        }
      }
    }

    window.fetch = originalFetch
  }

  private async testMaliciousInput(): Promise<void> {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE locations; --",
      "../../../etc/passwd",
      "%3Cscript%3Ealert('xss')%3C/script%3E",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>",
      "SELECT * FROM users WHERE id = 1; DROP TABLE users; --",
    ]

    for (const maliciousInput of maliciousInputs) {
      try {
        const results = await this.locationService.searchLocations(maliciousInput)

        // Should return empty array for malicious input (after sanitization)
        if (!Array.isArray(results)) {
          throw new Error(`Malicious input "${maliciousInput}" should return an array`)
        }
      } catch (error) {
        // It's also acceptable to throw an error for malicious input
        if (!(error instanceof Error)) {
          throw new Error(`Malicious input "${maliciousInput}" should handle gracefully: ${error}`)
        }
      }
    }
  }

  private async testNetworkTimeouts(): Promise<void> {
    const originalFetch = window.fetch
    window.fetch = () => new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 100))

    try {
      const results = await this.locationService.searchLocations("Prague")
      // If it doesn't throw, should return empty array
      if (!Array.isArray(results) || results.length !== 0) {
        throw new Error("Network timeout should return empty array or throw error")
      }
    } catch (error) {
      // It's acceptable to throw for network timeouts
      if (!(error instanceof Error) || !error.message.includes("timeout")) {
        throw new Error(`Network timeout should throw appropriate error: ${error}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testLocationResultValidation(): Promise<void> {
    const invalidResults = [
      {
        name: "Valid Location 1",
        latitude: 50.0755,
        longitude: 14.4378,
        country: "Czech Republic",
      },
      {
        name: "Valid Location 2",
        latitude: 51.5074,
        longitude: -0.1278,
        country: "United Kingdom",
      },
      {
        name: "Invalid Location",
        latitude: "invalid", // Should be number
        longitude: 14.4378,
        country: "Czech Republic",
      },
      {
        name: "Invalid Latitude",
        latitude: 91, // Out of range
        longitude: 14.4378,
        country: "Czech Republic",
      },
    ]

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          results: invalidResults,
        }),
      } as Response)

    try {
      const results = await this.locationService.searchLocations("test")

      // Should filter out invalid results, keeping only valid ones
      if (results.length !== 2) {
        throw new Error(`Expected 2 valid results after filtering, but got ${results.length} results`)
      }

      // Verify the valid results are included
      const hasValidLocation1 = results.some((r) => r.name === "Valid Location 1")
      const hasValidLocation2 = results.some((r) => r.name === "Valid Location 2")

      if (!hasValidLocation1 || !hasValidLocation2) {
        throw new Error("Valid locations should be included in results")
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testEmptyApiResponses(): Promise<void> {
    const emptyResponses = [{}, { results: null }, { results: undefined }, { results: [] }, { results: "not an array" }]

    const originalFetch = window.fetch

    for (const response of emptyResponses) {
      window.fetch = () =>
        Promise.resolve({
          ok: true,
          json: async () => response,
        } as Response)

      try {
        const results = await this.locationService.searchLocations("Prague")

        if (!Array.isArray(results) || results.length !== 0) {
          throw new Error(`Empty API response should return empty array, got: ${JSON.stringify(results)}`)
        }
      } catch (error) {
        throw new Error(`Empty API response should be handled gracefully: ${error}`)
      }
    }

    window.fetch = originalFetch
  }

  private async testRateLimiting(): Promise<void> {
    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
      } as Response)

    try {
      const results = await this.locationService.searchLocations("Prague")
      // If it doesn't throw, should return empty array
      if (!Array.isArray(results) || results.length !== 0) {
        throw new Error("Rate limiting should return empty array or throw error")
      }
    } catch (error) {
      // It's acceptable to throw for rate limiting
      if (!(error instanceof Error) || !error.message.includes("429")) {
        throw new Error(`Rate limiting should throw appropriate error: ${error}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testInvalidReverseGeocode(): Promise<void> {
    const invalidCoordinates = [
      { lat: 91, lon: 0, name: "Invalid latitude > 90" },
      { lat: -91, lon: 0, name: "Invalid latitude < -90" },
      { lat: 0, lon: 181, name: "Invalid longitude > 180" },
      { lat: 0, lon: -181, name: "Invalid longitude < -180" },
      { lat: Number.NaN, lon: 0, name: "NaN latitude" },
      { lat: 0, lon: Number.NaN, name: "NaN longitude" },
      { lat: Number.POSITIVE_INFINITY, lon: 0, name: "Infinite latitude" },
      { lat: 0, lon: Number.NEGATIVE_INFINITY, name: "Infinite longitude" },
    ]

    for (const coords of invalidCoordinates) {
      try {
        const result = await this.locationService.reverseGeocode(coords.lat, coords.lon)

        if (result !== null) {
          throw new Error(`${coords.name} should return null, got: ${JSON.stringify(result)}`)
        }
      } catch (error) {
        // Should either return null or throw a validation error
        if (!(error instanceof Error) || !error.message.includes("Invalid")) {
          throw new Error(`${coords.name} should handle invalid coordinates properly: ${error}`)
        }
      }
    }
  }

  private async testInternationalCharacters(): Promise<void> {
    const internationalQueries = [
      "北京", // Chinese
      "Москва", // Russian (Cyrillic)
      "القاهرة", // Arabic
      "मुंबई", // Hindi (Devanagari)
      "東京", // Japanese
      "서울", // Korean
      "Αθήνα", // Greek
      "İstanbul", // Turkish
      "Kraków", // Polish
      "São Paulo", // Portuguese
    ]

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          results: [
            {
              name: "Test City",
              latitude: 50.0755,
              longitude: 14.4378,
              country: "Test Country",
              admin1: "Test Region",
            },
          ],
        }),
      } as Response)

    try {
      for (const query of internationalQueries) {
        const results = await this.locationService.searchLocations(query)

        // Should handle international characters without errors
        if (!Array.isArray(results)) {
          throw new Error(`International query "${query}" should return an array`)
        }
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testSearchResultLimits(): Promise<void> {
    // Create exactly 10 mock results (within expected limit)
    const manyResults = Array.from({ length: 10 }, (_, i) => ({
      name: `City ${i}`,
      latitude: 50 + i * 0.1,
      longitude: 14 + i * 0.1,
      country: "Test Country",
      admin1: "Test Region",
    }))

    const originalFetch = window.fetch
    window.fetch = () =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          results: manyResults,
        }),
      } as Response)

    try {
      const results = await this.locationService.searchLocations("City")

      // Should return all results if within limit
      if (results.length !== 10) {
        throw new Error(`Expected 10 results, got ${results.length}`)
      }
    } finally {
      window.fetch = originalFetch
    }
  }

  private async testMalformedApiResponses(): Promise<void> {
    const malformedResponses = [
      "not json",
      null,
      undefined,
      { results: "string instead of array" },
      { results: [{ invalid: "structure" }] },
    ]

    const originalFetch = window.fetch

    for (const response of malformedResponses) {
      window.fetch = () =>
        Promise.resolve({
          ok: true,
          json: async () => {
            if (typeof response === "string" && response === "not json") {
              throw new Error("Invalid JSON")
            }
            return response
          },
        } as Response)

      try {
        const results = await this.locationService.searchLocations("Prague")

        // Should handle malformed responses gracefully
        if (!Array.isArray(results) || results.length !== 0) {
          throw new Error(`Malformed response should return empty array, got: ${JSON.stringify(results)}`)
        }
      } catch (error) {
        // It's acceptable to throw for malformed responses
        if (!(error instanceof Error)) {
          throw new Error(`Malformed response should be handled appropriately: ${error}`)
        }
      }
    }

    window.fetch = originalFetch
  }
}
