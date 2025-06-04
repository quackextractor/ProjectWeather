import { LocationService } from "@/services/location-service"

export class LocationServiceTests {
  private locationService = new LocationService()

  getTests() {
    return [
      {
        name: "Should search locations by query",
        description: "Verifies that location search returns relevant results",
        testFn: this.testLocationSearch.bind(this),
      },
      {
        name: "Should handle empty search query",
        description: "Ensures empty queries are handled gracefully",
        testFn: this.testEmptyQuery.bind(this),
      },
      {
        name: "Should validate search results",
        description: "Verifies that search results have valid coordinates and names",
        testFn: this.testSearchResultValidation.bind(this),
      },
      {
        name: "Should handle special characters in query",
        description: "Tests search functionality with special characters",
        testFn: this.testSpecialCharacters.bind(this),
      },
      {
        name: "Should reverse geocode coordinates",
        description: "Verifies reverse geocoding functionality",
        testFn: this.testReverseGeocode.bind(this),
      },
    ]
  }

  private async testLocationSearch(): Promise<void> {
    const query = "Prague"

    try {
      const results = await this.locationService.searchLocations(query)

      if (!Array.isArray(results)) {
        throw new Error("Search results should be an array")
      }

      if (results.length === 0) {
        throw new Error('Search should return at least one result for "Prague"')
      }

      const firstResult = results[0]
      if (!firstResult.name || !firstResult.country) {
        throw new Error("Search results should have name and country")
      }

      if (typeof firstResult.latitude !== "number" || typeof firstResult.longitude !== "number") {
        throw new Error("Search results should have numeric coordinates")
      }
    } catch (error) {
      throw new Error(`Location search failed: ${error}`)
    }
  }

  private async testEmptyQuery(): Promise<void> {
    const emptyQueries = ["", "  ", "\t", "\n"]

    for (const query of emptyQueries) {
      const results = await this.locationService.searchLocations(query)

      if (!Array.isArray(results) || results.length !== 0) {
        throw new Error(`Empty query "${query}" should return empty array`)
      }
    }
  }

  private async testSearchResultValidation(): Promise<void> {
    const query = "London"

    try {
      const results = await this.locationService.searchLocations(query)

      for (const result of results) {
        // Validate coordinates
        if (result.latitude < -90 || result.latitude > 90) {
          throw new Error(`Invalid latitude: ${result.latitude}`)
        }

        if (result.longitude < -180 || result.longitude > 180) {
          throw new Error(`Invalid longitude: ${result.longitude}`)
        }

        // Validate required fields
        if (!result.name || result.name.trim().length === 0) {
          throw new Error("Location name is required")
        }

        if (typeof result.name !== "string") {
          throw new Error("Location name must be a string")
        }
      }
    } catch (error) {
      throw new Error(`Search result validation failed: ${error}`)
    }
  }

  private async testSpecialCharacters(): Promise<void> {
    const specialQueries = ["São Paulo", "Zürich", "Москва", "北京", "café", "naïve"]

    for (const query of specialQueries) {
      try {
        const results = await this.locationService.searchLocations(query)

        // Should not throw an error and should return an array
        if (!Array.isArray(results)) {
          throw new Error(`Special character query "${query}" should return an array`)
        }
      } catch (error) {
        throw new Error(`Special character handling failed for "${query}": ${error}`)
      }
    }
  }

  private async testReverseGeocode(): Promise<void> {
    const testCases = [
      { lat: 50.0755, lon: 14.4378, name: "Prague coordinates" },
      { lat: 51.5074, lon: -0.1278, name: "London coordinates" },
      { lat: 40.7128, lon: -74.006, name: "New York coordinates" },
    ]

    for (const testCase of testCases) {
      try {
        const result = await this.locationService.reverseGeocode(testCase.lat, testCase.lon)

        if (!result) {
          throw new Error(`Reverse geocoding should return a result for ${testCase.name}`)
        }

        if (Math.abs(result.latitude - testCase.lat) > 0.01) {
          throw new Error(`Latitude mismatch for ${testCase.name}`)
        }

        if (Math.abs(result.longitude - testCase.lon) > 0.01) {
          throw new Error(`Longitude mismatch for ${testCase.name}`)
        }

        if (!result.name || result.name.length === 0) {
          throw new Error(`Result should have a name for ${testCase.name}`)
        }
      } catch (error) {
        throw new Error(`Reverse geocoding failed for ${testCase.name}: ${error}`)
      }
    }
  }
}
