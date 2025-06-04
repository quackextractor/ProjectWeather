import { ThemeValidator } from "./theme-validator"

export interface GeneratedTheme {
  name: string
  colors: Record<string, string>
  metadata: {
    baseColor: string
    algorithm: string
    harmony: string
    accessibility: "AA" | "AAA" | "fail"
  }
}

export class ThemeGenerator {
  public static generateFromBaseColor(
    baseColor: string,
    themeName = "Generated Theme",
    harmony: "monochromatic" | "analogous" | "complementary" | "triadic" = "monochromatic",
  ): GeneratedTheme {
    const sanitizedBase = ThemeValidator.sanitizeColorValue(baseColor)
    const colors = this.generateColorScheme(sanitizedBase, harmony)

    const validation = ThemeValidator.validateTheme(colors)
    const accessibility = this.determineAccessibilityLevel(validation)

    return {
      name: themeName,
      colors,
      metadata: {
        baseColor: sanitizedBase,
        algorithm: "HSL-based generation",
        harmony,
        accessibility,
      },
    }
  }

  private static generateColorScheme(baseColor: string, harmony: string): Record<string, string> {
    const [h, s, l] = this.parseHSL(baseColor)

    switch (harmony) {
      case "monochromatic":
        return this.generateMonochromatic(h, s, l)
      case "analogous":
        return this.generateAnalogous(h, s, l)
      case "complementary":
        return this.generateComplementary(h, s, l)
      case "triadic":
        return this.generateTriadic(h, s, l)
      default:
        return this.generateMonochromatic(h, s, l)
    }
  }

  private static parseHSL(hsl: string): [number, number, number] {
    const match = hsl.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
    if (!match) return [0, 0, 0]

    return [Number.parseFloat(match[1]), Number.parseFloat(match[2]), Number.parseFloat(match[3])]
  }

  private static formatHSL(h: number, s: number, l: number): string {
    return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
  }

  private static generateMonochromatic(h: number, s: number, l: number): Record<string, string> {
    return {
      primary: this.formatHSL(h, s, l),
      primaryForeground: this.formatHSL(h, s, l > 50 ? 10 : 90),
      secondary: this.formatHSL(h, Math.max(0, s - 20), l > 50 ? l - 10 : l + 10),
      secondaryForeground: this.formatHSL(h, s, l > 50 ? 10 : 90),
      accent: this.formatHSL(h, Math.max(0, s - 30), l > 50 ? l - 5 : l + 5),
      accentForeground: this.formatHSL(h, s, l > 50 ? 15 : 85),
      background: this.formatHSL(h, Math.max(0, s - 40), 98),
      foreground: this.formatHSL(h, s, 10),
      card: this.formatHSL(h, Math.max(0, s - 35), 96),
      cardForeground: this.formatHSL(h, s, 15),
      muted: this.formatHSL(h, Math.max(0, s - 30), 94),
      mutedForeground: this.formatHSL(h, Math.max(0, s - 10), 45),
      border: this.formatHSL(h, Math.max(0, s - 25), 90),
      weatherIcon: this.formatHSL(h, s, l),
      weatherBgFrom: this.formatHSL(h, Math.max(0, s - 35), 97),
      weatherBgTo: this.formatHSL(h, Math.max(0, s - 20), 95),
      weatherCardAccent: this.formatHSL(h, Math.max(0, s - 30), 94),
    }
  }

  private static generateAnalogous(h: number, s: number, l: number): Record<string, string> {
    const h1 = (h + 30) % 360
    const h2 = (h - 30 + 360) % 360

    return {
      primary: this.formatHSL(h, s, l),
      primaryForeground: this.formatHSL(h, s, l > 50 ? 10 : 90),
      secondary: this.formatHSL(h1, Math.max(0, s - 15), l > 50 ? l - 10 : l + 10),
      secondaryForeground: this.formatHSL(h1, s, l > 50 ? 10 : 90),
      accent: this.formatHSL(h2, Math.max(0, s - 20), l > 50 ? l - 5 : l + 5),
      accentForeground: this.formatHSL(h2, s, l > 50 ? 15 : 85),
      background: this.formatHSL(h, Math.max(0, s - 40), 98),
      foreground: this.formatHSL(h, s, 10),
      card: this.formatHSL(h, Math.max(0, s - 35), 96),
      cardForeground: this.formatHSL(h, s, 15),
      muted: this.formatHSL(h1, Math.max(0, s - 30), 94),
      mutedForeground: this.formatHSL(h, Math.max(0, s - 10), 45),
      border: this.formatHSL(h, Math.max(0, s - 25), 90),
      weatherIcon: this.formatHSL(h, s, l),
      weatherBgFrom: this.formatHSL(h1, Math.max(0, s - 35), 97),
      weatherBgTo: this.formatHSL(h2, Math.max(0, s - 30), 95),
      weatherCardAccent: this.formatHSL(h1, Math.max(0, s - 25), 94),
    }
  }

  private static generateComplementary(h: number, s: number, l: number): Record<string, string> {
    const complementH = (h + 180) % 360

    return {
      primary: this.formatHSL(h, s, l),
      primaryForeground: this.formatHSL(h, s, l > 50 ? 10 : 90),
      secondary: this.formatHSL(complementH, Math.max(0, s - 20), l > 50 ? l - 10 : l + 10),
      secondaryForeground: this.formatHSL(complementH, s, l > 50 ? 10 : 90),
      accent: this.formatHSL(h, Math.max(0, s - 30), l > 50 ? l - 5 : l + 5),
      accentForeground: this.formatHSL(h, s, l > 50 ? 15 : 85),
      background: this.formatHSL(h, Math.max(0, s - 40), 98),
      foreground: this.formatHSL(h, s, 10),
      card: this.formatHSL(h, Math.max(0, s - 35), 96),
      cardForeground: this.formatHSL(h, s, 15),
      muted: this.formatHSL(h, Math.max(0, s - 30), 94),
      mutedForeground: this.formatHSL(h, Math.max(0, s - 10), 45),
      border: this.formatHSL(h, Math.max(0, s - 25), 90),
      weatherIcon: this.formatHSL(complementH, s, l),
      weatherBgFrom: this.formatHSL(h, Math.max(0, s - 35), 97),
      weatherBgTo: this.formatHSL(complementH, Math.max(0, s - 30), 95),
      weatherCardAccent: this.formatHSL(h, Math.max(0, s - 25), 94),
    }
  }

  private static generateTriadic(h: number, s: number, l: number): Record<string, string> {
    const h1 = (h + 120) % 360
    const h2 = (h + 240) % 360

    return {
      primary: this.formatHSL(h, s, l),
      primaryForeground: this.formatHSL(h, s, l > 50 ? 10 : 90),
      secondary: this.formatHSL(h1, Math.max(0, s - 15), l > 50 ? l - 10 : l + 10),
      secondaryForeground: this.formatHSL(h1, s, l > 50 ? 10 : 90),
      accent: this.formatHSL(h2, Math.max(0, s - 20), l > 50 ? l - 5 : l + 5),
      accentForeground: this.formatHSL(h2, s, l > 50 ? 15 : 85),
      background: this.formatHSL(h, Math.max(0, s - 40), 98),
      foreground: this.formatHSL(h, s, 10),
      card: this.formatHSL(h, Math.max(0, s - 35), 96),
      cardForeground: this.formatHSL(h, s, 15),
      muted: this.formatHSL(h1, Math.max(0, s - 30), 94),
      mutedForeground: this.formatHSL(h, Math.max(0, s - 10), 45),
      border: this.formatHSL(h, Math.max(0, s - 25), 90),
      weatherIcon: this.formatHSL(h, s, l),
      weatherBgFrom: this.formatHSL(h1, Math.max(0, s - 35), 97),
      weatherBgTo: this.formatHSL(h2, Math.max(0, s - 30), 95),
      weatherCardAccent: this.formatHSL(h1, Math.max(0, s - 25), 94),
    }
  }

  private static determineAccessibilityLevel(validation: any): "AA" | "AAA" | "fail" {
    if (!validation.isValid) return "fail"

    const contrastWarnings = validation.warnings.filter((w: string) => w.includes("contrast ratio"))

    if (contrastWarnings.length === 0) return "AAA"
    if (contrastWarnings.length <= 2) return "AA"
    return "fail"
  }

  public static generatePresetVariations(baseTheme: string): GeneratedTheme[] {
    const themes: GeneratedTheme[] = []
    const harmonies: Array<"monochromatic" | "analogous" | "complementary" | "triadic"> = [
      "monochromatic",
      "analogous",
      "complementary",
      "triadic",
    ]

    // Get base color from preset
    let baseColor = "221.2 83.2% 53.3%" // Default blue
    switch (baseTheme) {
      case "ocean":
        baseColor = "199 89% 48%"
        break
      case "sunset":
        baseColor = "24 95% 53%"
        break
    }

    harmonies.forEach((harmony) => {
      const theme = this.generateFromBaseColor(baseColor, `${baseTheme} ${harmony}`, harmony)
      themes.push(theme)
    })

    return themes
  }

  public static generateRandomTheme(name = "Random Theme"): GeneratedTheme {
    // Generate random HSL values
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 60) + 40 // 40-100%
    const lightness = Math.floor(Math.random() * 40) + 30 // 30-70%

    const baseColor = this.formatHSL(hue, saturation, lightness)
    const harmonies: Array<"monochromatic" | "analogous" | "complementary" | "triadic"> = [
      "monochromatic",
      "analogous",
      "complementary",
      "triadic",
    ]
    const randomHarmony = harmonies[Math.floor(Math.random() * harmonies.length)]

    return this.generateFromBaseColor(baseColor, name, randomHarmony)
  }
}
