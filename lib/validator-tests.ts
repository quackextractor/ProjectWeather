export class ValidatorTests {
  getTests() {
    return [
      {
        name: "Should validate coordinates",
        description: "Tests coordinate validation for latitude and longitude",
        testFn: this.testCoordinateValidation.bind(this),
      },
      {
        name: "Should validate search queries",
        description: "Verifies search query validation and sanitization",
        testFn: this.testSearchQueryValidation.bind(this),
      },
      {
        name: "Should validate temperature values",
        description: "Tests temperature value validation",
        testFn: this.testTemperatureValidation.bind(this),
      },
      {
        name: "Should validate weather codes",
        description: "Verifies weather code validation",
        testFn: this.testWeatherCodeValidation.bind(this),
      },
      {
        name: "Should sanitize input strings",
        description: "Tests input sanitization functionality",
        testFn: this.testInputSanitization.bind(this),
      },
    ]
  }

  private testCoordinateValidation(): void {
    // Valid coordinates
    const validCases = [
      { lat: 0, lon: 0 },
      { lat: 90, lon: 180 },
      { lat: -90, lon: -180 },
      { lat: 50.0755, lon: 14.4378 },
    ]

    for (const coords of validCases) {
      if (!this.isValidCoordinate(coords.lat, coords.lon)) {
        throw new Error(`Valid coordinates ${coords.lat}, ${coords.lon} should pass validation`)
      }
    }

    // Invalid coordinates
    const invalidCases = [
      { lat: 91, lon: 0 },
      { lat: -91, lon: 0 },
      { lat: 0, lon: 181 },
      { lat: 0, lon: -181 },
      { lat: Number.NaN, lon: 0 },
      { lat: 0, lon: Number.NaN },
    ]

    for (const coords of invalidCases) {
      if (this.isValidCoordinate(coords.lat, coords.lon)) {
        throw new Error(`Invalid coordinates ${coords.lat}, ${coords.lon} should fail validation`)
      }
    }
  }

  private testSearchQueryValidation(): void {
    // Valid queries
    const validQueries = ["Prague", "New York", "São Paulo", "London, UK", "Paris France"]

    for (const query of validQueries) {
      if (!this.isValidSearchQuery(query)) {
        throw new Error(`Valid query "${query}" should pass validation`)
      }
    }

    // Invalid queries
    const invalidQueries = [
      "",
      "  ",
      "a", // Too short
      '<script>alert("xss")</script>',
      "SELECT * FROM users",
      "A".repeat(101), // Too long
    ]

    for (const query of invalidQueries) {
      if (this.isValidSearchQuery(query)) {
        throw new Error(`Invalid query "${query}" should fail validation`)
      }
    }
  }

  private testTemperatureValidation(): void {
    // Valid temperatures
    const validTemps = [-50, 0, 25, 50, 100]

    for (const temp of validTemps) {
      if (!this.isValidTemperature(temp)) {
        throw new Error(`Valid temperature ${temp} should pass validation`)
      }
    }

    // Invalid temperatures
    const invalidTemps = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -200, 200]

    for (const temp of invalidTemps) {
      if (this.isValidTemperature(temp)) {
        throw new Error(`Invalid temperature ${temp} should fail validation`)
      }
    }
  }

  private testWeatherCodeValidation(): void {
    // Valid weather codes (WMO codes)
    const validCodes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 95, 96, 99]

    for (const code of validCodes) {
      if (!this.isValidWeatherCode(code)) {
        throw new Error(`Valid weather code ${code} should pass validation`)
      }
    }

    // Invalid weather codes
    const invalidCodes = [-1, 100, 999, Number.NaN, 1.5]

    for (const code of invalidCodes) {
      if (this.isValidWeatherCode(code)) {
        throw new Error(`Invalid weather code ${code} should fail validation`)
      }
    }
  }

  private testInputSanitization(): void {
    const testCases = [
      {
        input: '<script>alert("xss")</script>',
        expected: 'scriptalert("xss")/script',
      },
      {
        input: "Normal text",
        expected: "Normal text",
      },
      {
        input: "  Trimmed  ",
        expected: "Trimmed",
      },
      {
        input: "Text with <tags>",
        expected: "Text with tags",
      },
    ]

    for (const testCase of testCases) {
      const result = this.sanitizeInput(testCase.input)
      if (result !== testCase.expected) {
        throw new Error(`Expected "${testCase.expected}", got "${result}"`)
      }
    }
  }

  // Helper validation methods
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    )
  }

  private isValidSearchQuery(query: string): boolean {
    if (typeof query !== "string") return false

    const trimmed = query.trim()
    if (trimmed.length < 2 || trimmed.length > 100) return false

    // Check for dangerous patterns
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /(union|select|insert|update|delete|drop)/i]

    return !dangerousPatterns.some((pattern) => pattern.test(trimmed))
  }

  private isValidTemperature(temp: number): boolean {
    return typeof temp === "number" && !isNaN(temp) && isFinite(temp) && temp >= -100 && temp <= 150
  }

  private isValidWeatherCode(code: number): boolean {
    const validCodes = new Set([
      0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
    ])

    return typeof code === "number" && Number.isInteger(code) && validCodes.has(code)
  }

  private sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>{}[\]\\]/g, "")
      .replace(/\s+/g, " ")
  }
}
