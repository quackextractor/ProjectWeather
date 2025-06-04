import { formatTemperature, formatTime, formatDate, getWindDirection, getUVIndexLevel } from "@/lib/utils"

export class FormatterTests {
  getTests() {
    return [
      {
        name: "Should format temperature correctly",
        description: "Tests temperature formatting in both Celsius and Fahrenheit",
        testFn: this.testTemperatureFormatting.bind(this),
      },
      {
        name: "Should format time correctly",
        description: "Verifies time formatting functionality",
        testFn: this.testTimeFormatting.bind(this),
      },
      {
        name: "Should format dates correctly",
        description: "Tests date formatting with relative dates",
        testFn: this.testDateFormatting.bind(this),
      },
      {
        name: "Should convert wind direction",
        description: "Tests wind direction degree to compass conversion",
        testFn: this.testWindDirection.bind(this),
      },
      {
        name: "Should categorize UV index",
        description: "Verifies UV index level categorization",
        testFn: this.testUVIndexLevel.bind(this),
      },
    ]
  }

  private testTemperatureFormatting(): void {
    // Test Celsius formatting
    const celsiusResult = formatTemperature(20, "celsius")
    if (celsiusResult !== "20°C") {
      throw new Error(`Expected "20°C", got "${celsiusResult}"`)
    }

    // Test Fahrenheit formatting
    const fahrenheitResult = formatTemperature(20, "fahrenheit")
    if (fahrenheitResult !== "68°F") {
      throw new Error(`Expected "68°F", got "${fahrenheitResult}"`)
    }

    // Test negative temperatures
    const negativeResult = formatTemperature(-5, "celsius")
    if (negativeResult !== "-5°C") {
      throw new Error(`Expected "-5°C", got "${negativeResult}"`)
    }

    // Test rounding
    const roundedResult = formatTemperature(20.7, "celsius")
    if (roundedResult !== "21°C") {
      throw new Error(`Expected "21°C", got "${roundedResult}"`)
    }
  }

  private testTimeFormatting(): void {
    const testDate = new Date("2024-01-15T14:30:00Z")
    const timeResult = formatTime(testDate)

    // Should return a time string (format may vary by locale)
    if (!timeResult || typeof timeResult !== "string") {
      throw new Error("Time formatting should return a non-empty string")
    }

    // Should contain time indicators
    if (!timeResult.match(/\d+:\d+/) && !timeResult.match(/\d+\s?(AM|PM)/i)) {
      throw new Error(`Time format "${timeResult}" should contain time indicators`)
    }
  }

  private testDateFormatting(): void {
    const today = new Date()
    const todayResult = formatDate(today)

    if (todayResult !== "Today") {
      throw new Error(`Expected "Today", got "${todayResult}"`)
    }

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowResult = formatDate(tomorrow)

    if (tomorrowResult !== "Tomorrow") {
      throw new Error(`Expected "Tomorrow", got "${tomorrowResult}"`)
    }

    // Test past date
    const pastDate = new Date("2024-01-15")
    const pastResult = formatDate(pastDate)

    if (!pastResult || typeof pastResult !== "string") {
      throw new Error("Date formatting should return a non-empty string")
    }
  }

  private testWindDirection(): void {
    const testCases = [
      { degrees: 0, expected: "N" },
      { degrees: 90, expected: "E" },
      { degrees: 180, expected: "S" },
      { degrees: 270, expected: "W" },
      { degrees: 45, expected: "NE" },
      { degrees: 135, expected: "SE" },
      { degrees: 225, expected: "SW" },
      { degrees: 315, expected: "NW" },
    ]

    for (const testCase of testCases) {
      const result = getWindDirection(testCase.degrees)
      if (result !== testCase.expected) {
        throw new Error(`Expected "${testCase.expected}" for ${testCase.degrees}°, got "${result}"`)
      }
    }

    // Test edge cases
    const result360 = getWindDirection(360)
    if (result360 !== "N") {
      throw new Error(`Expected "N" for 360°, got "${result360}"`)
    }
  }

  private testUVIndexLevel(): void {
    const testCases = [
      { uvIndex: 1, expected: "Low" },
      { uvIndex: 3, expected: "Moderate" },
      { uvIndex: 6, expected: "High" },
      { uvIndex: 8, expected: "Very High" },
      { uvIndex: 12, expected: "Extreme" },
    ]

    for (const testCase of testCases) {
      const result = getUVIndexLevel(testCase.uvIndex)
      if (result !== testCase.expected) {
        throw new Error(`Expected "${testCase.expected}" for UV ${testCase.uvIndex}, got "${result}"`)
      }
    }

    // Test boundary values
    const lowBoundary = getUVIndexLevel(2)
    if (lowBoundary !== "Low") {
      throw new Error(`Expected "Low" for UV 2, got "${lowBoundary}"`)
    }

    const moderateBoundary = getUVIndexLevel(5)
    if (moderateBoundary !== "Moderate") {
      throw new Error(`Expected "Moderate" for UV 5, got "${moderateBoundary}"`)
    }
  }
}
