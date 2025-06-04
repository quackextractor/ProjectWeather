/**
 * Weather API validation utilities
 */
import { ValidationError } from "../../utils/error-handler"

export class WeatherApiValidator {
  public validateCoordinates(latitude: number, longitude: number): void {
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
      throw new ValidationError("Invalid coordinates provided")
    }
  }

  public validateSearchQuery(query: string): boolean {
    return query && query.length >= 2
  }

  public sanitizeQuery(query: string): string {
    return query.trim().replace(/[^\w\s-]/g, "")
  }
}
