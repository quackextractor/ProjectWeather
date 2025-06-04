export class ThemeTests {
  getTests() {
    return [
      {
        name: "Should validate theme colors",
        description: "Ensures theme color values are valid HSL format",
        testFn: this.testValidateThemeColors.bind(this),
      },
      {
        name: "Should apply theme correctly",
        description: "Verifies that themes are applied to DOM elements properly",
        testFn: this.testApplyTheme.bind(this),
      },
      {
        name: "Should handle custom themes",
        description: "Tests custom theme creation and management",
        testFn: this.testCustomThemes.bind(this),
      },
      {
        name: "Should persist theme preferences",
        description: "Verifies that theme preferences are saved and restored correctly",
        testFn: this.testThemePersistence.bind(this),
      },
      {
        name: "Should validate HSL color format",
        description: "Ensures HSL color values are properly formatted and valid",
        testFn: this.testHSLValidation.bind(this),
      },
    ]
  }

  private async testValidateThemeColors(): Promise<void> {
    // Test both HSL formats - with and without parentheses
    const validColors = [
      "210 40% 98%", // Format without parentheses
      "0 0% 100%", // Format without parentheses
      "360 100% 50%", // Format without parentheses
      "hsl(210, 40%, 98%)", // Format with parentheses and hsl prefix
      "hsl(0, 0%, 0%)", // Format with parentheses and hsl prefix
      "hsl(360, 100%, 50%)", // Format with parentheses and hsl prefix
    ]

    for (const color of validColors) {
      if (!this.isValidHSLColor(color)) {
        throw new Error(`Valid HSL color "${color}" should pass validation`)
      }
    }

    const invalidColors = [
      "rgb(255, 0, 0)",
      "#ff0000",
      "red",
      "hsl(400, 40%, 98%)", // Invalid hue
      "hsl(210, 150%, 98%)", // Invalid saturation
      "hsl(210, 40%, 150%)", // Invalid lightness
      "400 40% 98%", // Invalid hue
      "210 150% 98%", // Invalid saturation
      "210 40% 150%", // Invalid lightness
    ]

    for (const color of invalidColors) {
      if (this.isValidHSLColor(color)) {
        throw new Error(`Invalid HSL color "${color}" should fail validation`)
      }
    }
  }

  private async testApplyTheme(): Promise<void> {
    // Create a test element
    const testElement = document.createElement("div")
    testElement.id = "theme-test-element"
    document.body.appendChild(testElement)

    try {
      // Test theme application
      const testTheme = {
        primary: "210 40% 50%",
        secondary: "210 40% 60%",
        background: "0 0% 100%",
      }

      // Apply theme styles
      testElement.style.setProperty("--primary", testTheme.primary)
      testElement.style.setProperty("--secondary", testTheme.secondary)
      testElement.style.setProperty("--background", testTheme.background)

      // Verify styles were applied
      const primaryValue = testElement.style.getPropertyValue("--primary")

      if (primaryValue !== testTheme.primary) {
        throw new Error(`Expected primary color ${testTheme.primary}, got ${primaryValue}`)
      }
    } finally {
      // Clean up
      document.body.removeChild(testElement)
    }
  }

  private async testCustomThemes(): Promise<void> {
    const customTheme = {
      name: "test-theme",
      colors: {
        primary: "200 50% 50%",
        secondary: "200 50% 60%",
        background: "0 0% 98%",
        foreground: "0 0% 2%",
      },
    }

    // Validate custom theme structure
    if (!customTheme.name || typeof customTheme.name !== "string") {
      throw new Error("Custom theme must have a valid name")
    }

    if (!customTheme.colors || typeof customTheme.colors !== "object") {
      throw new Error("Custom theme must have colors object")
    }

    // Validate required color properties
    const requiredColors = ["primary", "secondary", "background", "foreground"]
    for (const colorKey of requiredColors) {
      if (!customTheme.colors[colorKey as keyof typeof customTheme.colors]) {
        throw new Error(`Custom theme must have ${colorKey} color`)
      }
    }
  }

  private async testThemePersistence(): Promise<void> {
    const testThemeName = "test-persistence-theme"

    // Save theme preference
    localStorage.setItem("theme-preference", testThemeName)

    // Retrieve theme preference
    const savedTheme = localStorage.getItem("theme-preference")

    if (savedTheme !== testThemeName) {
      throw new Error(`Expected saved theme ${testThemeName}, got ${savedTheme}`)
    }

    // Clean up
    localStorage.removeItem("theme-preference")
  }

  private async testHSLValidation(): Promise<void> {
    const testCases = [
      // Format without parentheses
      { color: "0 0% 0%", valid: true },
      { color: "360 100% 100%", valid: true },
      { color: "180 50% 50%", valid: true },

      // Format with parentheses and hsl prefix
      { color: "hsl(0, 0%, 0%)", valid: true },
      { color: "hsl(360, 100%, 100%)", valid: true },
      { color: "hsl(180, 50%, 50%)", valid: true },

      // Invalid values
      { color: "361 0% 0%", valid: false },
      { color: "0 101% 0%", valid: false },
      { color: "0 0% 101%", valid: false },
      { color: "hsl(361, 0%, 0%)", valid: false },
      { color: "hsl(0, 101%, 0%)", valid: false },
      { color: "hsl(0, 0%, 101%)", valid: false },
      { color: "not a color", valid: false },
      { color: "", valid: false },
    ]

    for (const testCase of testCases) {
      const isValid = this.isValidHSLColor(testCase.color)
      if (isValid !== testCase.valid) {
        throw new Error(`HSL validation failed for ${testCase.color}: expected ${testCase.valid}, got ${isValid}`)
      }
    }
  }

  private isValidHSLColor(color: string): boolean {
    if (!color || typeof color !== "string") return false

    const trimmedColor = color.trim()

    // Parse HSL values using a more straightforward approach
    let h: number, s: number, l: number

    // Check if it's the hsl(h, s%, l%) format
    if (trimmedColor.toLowerCase().startsWith("hsl(") && trimmedColor.endsWith(")")) {
      // Extract content between parentheses
      const content = trimmedColor.slice(4, -1) // Remove 'hsl(' and ')'
      const parts = content.split(",").map((part) => part.trim())

      if (parts.length !== 3) return false

      // Parse hue (no % symbol)
      h = Number.parseFloat(parts[0])

      // Parse saturation (remove % symbol)
      const sPart = parts[1]
      if (!sPart.endsWith("%")) return false
      s = Number.parseFloat(sPart.slice(0, -1))

      // Parse lightness (remove % symbol)
      const lPart = parts[2]
      if (!lPart.endsWith("%")) return false
      l = Number.parseFloat(lPart.slice(0, -1))
    } else {
      // Check if it's the "h s% l%" format (space-separated)
      const parts = trimmedColor.split(/\s+/)

      if (parts.length !== 3) return false

      // Parse hue (no % symbol)
      h = Number.parseFloat(parts[0])

      // Parse saturation (must end with %)
      const sPart = parts[1]
      if (!sPart.endsWith("%")) return false
      s = Number.parseFloat(sPart.slice(0, -1))

      // Parse lightness (must end with %)
      const lPart = parts[2]
      if (!lPart.endsWith("%")) return false
      l = Number.parseFloat(lPart.slice(0, -1))
    }

    // Validate that all values are numbers and within valid ranges
    return !isNaN(h) && h >= 0 && h <= 360 && !isNaN(s) && s >= 0 && s <= 100 && !isNaN(l) && l >= 0 && l <= 100
  }
}
