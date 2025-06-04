export interface ThemeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ThemeValidator {
  private static readonly REQUIRED_COLORS = [
    "primary",
    "primaryForeground",
    "secondary",
    "secondaryForeground",
    "accent",
    "accentForeground",
    "background",
    "foreground",
    "card",
    "cardForeground",
    "muted",
    "mutedForeground",
    "border",
    "weatherIcon",
    "weatherBgFrom",
    "weatherBgTo",
    "weatherCardAccent",
  ]

  private static readonly HSL_PATTERN = /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/

  public static validateTheme(colors: Record<string, string>): ThemeValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for required colors
    for (const requiredColor of this.REQUIRED_COLORS) {
      if (!colors[requiredColor]) {
        errors.push(`Missing required color: ${requiredColor}`)
      }
    }

    // Validate color format
    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (!this.isValidHSLColor(colorValue)) {
        errors.push(`Invalid HSL format for ${colorName}: ${colorValue}`)
      }
    }

    // Check contrast ratios
    const contrastIssues = this.checkContrastRatios(colors)
    warnings.push(...contrastIssues)

    // Check for accessibility issues
    const accessibilityIssues = this.checkAccessibility(colors)
    warnings.push(...accessibilityIssues)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private static isValidHSLColor(color: string): boolean {
    if (!color || typeof color !== "string") {
      return false
    }

    const match = color.trim().match(this.HSL_PATTERN)
    if (!match) {
      return false
    }

    const [, h, s, l] = match
    const hue = Number.parseFloat(h)
    const saturation = Number.parseFloat(s)
    const lightness = Number.parseFloat(l)

    return hue >= 0 && hue <= 360 && saturation >= 0 && saturation <= 100 && lightness >= 0 && lightness <= 100
  }

  private static hslToRgb(hsl: string): { r: number; g: number; b: number } | null {
    const match = hsl.trim().match(this.HSL_PATTERN)
    if (!match) return null

    const [, h, s, l] = match
    const hue = Number.parseFloat(h) / 360
    const saturation = Number.parseFloat(s) / 100
    const lightness = Number.parseFloat(l) / 100

    const c = (1 - Math.abs(2 * lightness - 1)) * saturation
    const x = c * (1 - Math.abs(((hue * 6) % 2) - 1))
    const m = lightness - c / 2

    let r = 0,
      g = 0,
      b = 0

    if (0 <= hue && hue < 1 / 6) {
      r = c
      g = x
      b = 0
    } else if (1 / 6 <= hue && hue < 2 / 6) {
      r = x
      g = c
      b = 0
    } else if (2 / 6 <= hue && hue < 3 / 6) {
      r = 0
      g = c
      b = x
    } else if (3 / 6 <= hue && hue < 4 / 6) {
      r = 0
      g = x
      b = c
    } else if (4 / 6 <= hue && hue < 5 / 6) {
      r = x
      g = 0
      b = c
    } else if (5 / 6 <= hue && hue < 1) {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  private static calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private static calculateContrastRatio(color1: string, color2: string): number | null {
    const rgb1 = this.hslToRgb(color1)
    const rgb2 = this.hslToRgb(color2)

    if (!rgb1 || !rgb2) return null

    const lum1 = this.calculateLuminance(rgb1)
    const lum2 = this.calculateLuminance(rgb2)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  private static checkContrastRatios(colors: Record<string, string>): string[] {
    const warnings: string[] = []

    const contrastPairs = [
      { fg: "foreground", bg: "background", name: "Text on background" },
      { fg: "primaryForeground", bg: "primary", name: "Primary button text" },
      { fg: "secondaryForeground", bg: "secondary", name: "Secondary button text" },
      { fg: "accentForeground", bg: "accent", name: "Accent text" },
      { fg: "cardForeground", bg: "card", name: "Card text" },
      { fg: "mutedForeground", bg: "muted", name: "Muted text" },
    ]

    for (const pair of contrastPairs) {
      if (colors[pair.fg] && colors[pair.bg]) {
        const ratio = this.calculateContrastRatio(colors[pair.fg], colors[pair.bg])
        if (ratio !== null) {
          if (ratio < 4.5) {
            warnings.push(`Low contrast ratio (${ratio.toFixed(2)}) for ${pair.name}. Recommended: 4.5+`)
          }
        }
      }
    }

    return warnings
  }

  private static checkAccessibility(colors: Record<string, string>): string[] {
    const warnings: string[] = []

    // Check if colors are too similar
    const similarityThreshold = 1.5
    const colorPairs = [
      ["primary", "secondary"],
      ["accent", "primary"],
      ["background", "card"],
    ]

    for (const [color1, color2] of colorPairs) {
      if (colors[color1] && colors[color2]) {
        const ratio = this.calculateContrastRatio(colors[color1], colors[color2])
        if (ratio !== null && ratio < similarityThreshold) {
          warnings.push(`Colors ${color1} and ${color2} are too similar (ratio: ${ratio.toFixed(2)})`)
        }
      }
    }

    // Check for extremely bright or dark colors
    for (const [colorName, colorValue] of Object.entries(colors)) {
      const rgb = this.hslToRgb(colorValue)
      if (rgb) {
        const luminance = this.calculateLuminance(rgb)
        if (luminance > 0.95) {
          warnings.push(`Color ${colorName} is extremely bright and may cause eye strain`)
        } else if (luminance < 0.05) {
          warnings.push(`Color ${colorName} is extremely dark and may be hard to see`)
        }
      }
    }

    return warnings
  }

  public static sanitizeColorValue(color: string): string {
    if (!color || typeof color !== "string") {
      return "0 0% 0%"
    }

    // Remove extra whitespace and normalize format
    const normalized = color.trim().replace(/\s+/g, " ")

    // Validate and return
    if (this.isValidHSLColor(normalized)) {
      return normalized
    }

    // Try to fix common issues
    const fixed = this.attemptColorFix(normalized)
    if (this.isValidHSLColor(fixed)) {
      return fixed
    }

    // Return default if unfixable
    return "0 0% 0%"
  }

  private static attemptColorFix(color: string): string {
    // Remove common prefixes/suffixes
    let fixed = color.replace(/^hsl$$|$$$/g, "").trim()

    // Add missing % signs
    const parts = fixed.split(/\s+/)
    if (parts.length === 3) {
      const [h, s, l] = parts
      if (!s.includes("%")) {
        parts[1] = s + "%"
      }
      if (!l.includes("%")) {
        parts[2] = l + "%"
      }
      fixed = parts.join(" ")
    }

    return fixed
  }

  public static generateColorVariations(baseColor: string): Record<string, string> {
    const rgb = this.hslToRgb(baseColor)
    if (!rgb) {
      return {}
    }

    const match = baseColor.trim().match(this.HSL_PATTERN)
    if (!match) {
      return {}
    }

    const [, h, s, l] = match
    const hue = Number.parseFloat(h)
    const saturation = Number.parseFloat(s)
    const lightness = Number.parseFloat(l)

    return {
      lighter: `${hue} ${saturation}% ${Math.min(100, lightness + 20)}%`,
      darker: `${hue} ${saturation}% ${Math.max(0, lightness - 20)}%`,
      muted: `${hue} ${Math.max(0, saturation - 30)}% ${lightness}%`,
      complement: `${(hue + 180) % 360} ${saturation}% ${lightness}%`,
      analogous1: `${(hue + 30) % 360} ${saturation}% ${lightness}%`,
      analogous2: `${(hue - 30 + 360) % 360} ${saturation}% ${lightness}%`,
    }
  }
}
