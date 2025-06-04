"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { defaultThemes, darkThemeOverrides } from "./theme-definitions"

type Theme = "light" | "dark" | "system"
type TemperatureUnit = "celsius" | "fahrenheit"

export interface CustomTheme {
  id: string
  name: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    muted: string
    mutedForeground: string
    border: string
    weatherIcon: string
    weatherBgFrom: string
    weatherBgTo: string
    weatherCardAccent: string
  }
  createdAt: Date
}

interface ThemeContextType {
  theme: Theme
  themePreset: string
  temperatureUnit: TemperatureUnit
  customThemes: CustomTheme[]
  activeCustomTheme: CustomTheme | null
  setTheme: (theme: Theme) => void
  setThemePreset: (preset: string) => void
  setTemperatureUnit: (unit: TemperatureUnit) => void
  createCustomTheme: (theme: Omit<CustomTheme, "id" | "createdAt">) => void
  updateCustomTheme: (id: string, theme: Partial<CustomTheme>) => void
  deleteCustomTheme: (id: string) => void
  applyCustomTheme: (theme: CustomTheme) => void
  resetToPresetTheme: (preset: string) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [themePreset, setThemePreset] = useState<string>("default")
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius")
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [activeCustomTheme, setActiveCustomTheme] = useState<CustomTheme | null>(null)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  // Load saved settings and custom themes
  useEffect(() => {
    const savedTheme = localStorage.getItem("weather-theme") as Theme
    const savedPreset = localStorage.getItem("weather-theme-preset")
    const savedUnit = localStorage.getItem("weather-temperature-unit") as TemperatureUnit
    const savedCustomThemes = localStorage.getItem("weather-custom-themes")
    const savedActiveCustomTheme = localStorage.getItem("weather-active-custom-theme")

    if (savedTheme) setTheme(savedTheme)
    if (savedPreset) setThemePreset(savedPreset)
    if (savedUnit) setTemperatureUnit(savedUnit)

    if (savedCustomThemes) {
      try {
        const parsedThemes = JSON.parse(savedCustomThemes).map((theme: any) => ({
          ...theme,
          createdAt: new Date(theme.createdAt),
        }))
        setCustomThemes(parsedThemes)
      } catch (error) {
        console.error("Failed to parse custom themes:", error)
      }
    }

    if (savedActiveCustomTheme) {
      try {
        const parsedActiveTheme = JSON.parse(savedActiveCustomTheme)
        setActiveCustomTheme({
          ...parsedActiveTheme,
          createdAt: new Date(parsedActiveTheme.createdAt),
        })
      } catch (error) {
        console.error("Failed to parse active custom theme:", error)
      }
    }
  }, [])

  // Handle system theme changes
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        setResolvedTheme(systemTheme)
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", updateResolvedTheme)
      return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
    }
  }, [theme])

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement

    // Apply light/dark mode classes
    if (resolvedTheme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }

    // Remove all theme classes first
    root.classList.remove("theme-default", "theme-ocean", "theme-sunset", "theme-custom")

    // Apply theme colors
    let themeColors
    if (activeCustomTheme) {
      themeColors = activeCustomTheme.colors
      root.classList.add("theme-custom")
    } else {
      themeColors = defaultThemes[themePreset as keyof typeof defaultThemes]?.colors || defaultThemes.default.colors
      root.classList.add(`theme-${themePreset}`)
    }

    // Apply dark mode overrides if needed
    if (resolvedTheme === "dark") {
      themeColors = { ...themeColors, ...darkThemeOverrides }
    }

    // Set CSS variables with proper error handling
    try {
      Object.entries(themeColors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase()
        root.style.setProperty(`--${cssVar}`, value)
      })

      // Force a repaint to ensure styles are applied
      root.style.display = "none"
      root.offsetHeight // Trigger reflow
      root.style.display = ""
    } catch (error) {
      console.error("Failed to apply theme colors:", error)
    }
  }, [resolvedTheme, themePreset, activeCustomTheme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("weather-theme", newTheme)
  }

  const handleSetThemePreset = (preset: string) => {
    setThemePreset(preset)
    setActiveCustomTheme(null)
    localStorage.setItem("weather-theme-preset", preset)
    localStorage.removeItem("weather-active-custom-theme")
  }

  const handleSetTemperatureUnit = (newUnit: TemperatureUnit) => {
    setTemperatureUnit(newUnit)
    localStorage.setItem("weather-temperature-unit", newUnit)
  }

  const createCustomTheme = (themeData: Omit<CustomTheme, "id" | "createdAt">) => {
    const newTheme: CustomTheme = {
      ...themeData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }

    const updatedThemes = [...customThemes, newTheme]
    setCustomThemes(updatedThemes)
    localStorage.setItem("weather-custom-themes", JSON.stringify(updatedThemes))

    return newTheme
  }

  const updateCustomTheme = (id: string, updates: Partial<CustomTheme>) => {
    const updatedThemes = customThemes.map((theme) => (theme.id === id ? { ...theme, ...updates } : theme))
    setCustomThemes(updatedThemes)
    localStorage.setItem("weather-custom-themes", JSON.stringify(updatedThemes))

    if (activeCustomTheme?.id === id) {
      const updatedActiveTheme = { ...activeCustomTheme, ...updates }
      setActiveCustomTheme(updatedActiveTheme)
      localStorage.setItem("weather-active-custom-theme", JSON.stringify(updatedActiveTheme))
    }
  }

  const deleteCustomTheme = (id: string) => {
    const updatedThemes = customThemes.filter((theme) => theme.id !== id)
    setCustomThemes(updatedThemes)
    localStorage.setItem("weather-custom-themes", JSON.stringify(updatedThemes))

    if (activeCustomTheme?.id === id) {
      setActiveCustomTheme(null)
      setThemePreset("default")
      localStorage.removeItem("weather-active-custom-theme")
      localStorage.setItem("weather-theme-preset", "default")
    }
  }

  const applyCustomTheme = (customTheme: CustomTheme) => {
    setActiveCustomTheme(customTheme)
    setThemePreset("") // Clear preset when using custom theme
    localStorage.setItem("weather-active-custom-theme", JSON.stringify(customTheme))
    localStorage.removeItem("weather-theme-preset")
  }

  const resetToPresetTheme = (preset: string) => {
    setThemePreset(preset)
    setActiveCustomTheme(null)
    localStorage.setItem("weather-theme-preset", preset)
    localStorage.removeItem("weather-active-custom-theme")
  }

  const value: ThemeContextType = {
    theme,
    themePreset,
    temperatureUnit,
    customThemes,
    activeCustomTheme,
    setTheme: handleSetTheme,
    setThemePreset: handleSetThemePreset,
    setTemperatureUnit: handleSetTemperatureUnit,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    applyCustomTheme,
    resetToPresetTheme,
    resolvedTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
