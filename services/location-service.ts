import type { Location } from "@/types/weather"

export class LocationService {
  private readonly geocodingUrl = "https://geocoding-api.open-meteo.com/v1"

  async searchLocations(query: string): Promise<Location[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      // Sanitize query
      const sanitizedQuery = query.trim().replace(/[^\w\s-]/g, "")

      if (!sanitizedQuery) {
        return []
      }

      const params = new URLSearchParams({
        name: sanitizedQuery,
        count: "10",
        language: "en",
        format: "json",
      })

      const response = await fetch(`${this.geocodingUrl}/search?${params}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.results || !Array.isArray(data.results)) {
        return []
      }

      return data.results
        .filter((result: any) => this.isValidLocationResult(result))
        .map((result: any) => ({
          name: result.name || "Unknown",
          latitude: result.latitude,
          longitude: result.longitude,
          country: result.country || "",
          region: result.admin1 || "",
        }))
    } catch (error) {
      console.error("Failed to search locations:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to search locations")
    }
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

  async reverseGeocode(latitude: number, longitude: number): Promise<Location | null> {
    try {
      // Validate coordinates
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180 ||
        isNaN(latitude) ||
        isNaN(longitude)
      ) {
        throw new Error("Invalid coordinates")
      }

      // Open-Meteo doesn't provide reverse geocoding, so we'll create a basic location
      return {
        name: "Current Location",
        latitude,
        longitude,
        country: "",
        region: "",
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error)
      return null
    }
  }
}
