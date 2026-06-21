import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorMessage } from "@/components/error-message"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ApiCredits } from "@/components/api-credits"
import { Header } from "@/components/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrentWeather } from "@/components/current-weather"
import { DailyForecast } from "@/components/daily-forecast"
import { HourlyForecast } from "@/components/hourly-forecast"
import { ColorGroupEditor } from "@/components/color-group-editor"
import { SettingsDialog } from "@/components/settings-dialog"

// Mock contexts
vi.mock("@/contexts/theme-context", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    themePreset: "default",
    temperatureUnit: "celsius",
    setTheme: vi.fn(),
    setThemePreset: vi.fn(),
    setTemperatureUnit: vi.fn(),
    customThemes: [],
    activeCustomTheme: null,
    applyCustomTheme: vi.fn(),
    deleteCustomTheme: vi.fn(),
    resetToPresetTheme: vi.fn(),
  }),
}))

vi.mock("@/contexts/weather-context", () => ({
  useWeather: () => ({
    currentWeather: {
      temperature: 22,
      feelsLike: 23,
      humidity: 50,
      pressure: 1013,
      visibility: 10,
      windSpeed: 10,
      windDirection: 180,
      uvIndex: 4,
      weatherCode: 1,
      description: "Mainly clear",
      timestamp: new Date(),
      temperatureMax: 25,
      temperatureMin: 15,
    },
    forecast: {
      daily: [
        {
          date: new Date(),
          temperatureMax: 25,
          temperatureMin: 15,
          feelsLikeMax: 25,
          feelsLikeMin: 15,
          weatherCode: 1,
          description: "Mainly clear",
          precipitationSum: 0,
          precipitationProbability: 0,
          windSpeed: 10,
          windDirection: 180,
          uvIndex: 4,
        },
      ],
      hourly: [
        {
          time: new Date(),
          temperature: 20,
          feelsLike: 20,
          humidity: 50,
          precipitationProbability: 10,
          weatherCode: 1,
          windSpeed: 5,
          windDirection: 180,
          pressure: 1013,
          uvIndex: 1,
        },
      ],
    },
    location: {
      name: "Prague",
      country: "Czech Republic",
      region: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
    },
    isLoading: false,
    error: null,
    searchLocation: vi.fn(),
    setLocation: vi.fn(),
    refreshWeather: vi.fn(),
    apiCallsToday: 5,
  }),
}))

// Mock Recharts ResponsiveContainer to avoid layout issues in testing
vi.mock("recharts", async () => {
  const actual: any = await vi.importActual("recharts")
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  }
})

describe("ErrorMessage Component", () => {
  it("renders error message correctly", () => {
    render(<ErrorMessage message="An error occurred" />)
    expect(screen.getByText("An error occurred")).toBeInTheDocument()
  })

  it("calls onRetry callback when clicked", () => {
    const handleRetry = vi.fn()
    render(<ErrorMessage message="An error occurred" onRetry={handleRetry} />)
    const button = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(button)
    expect(handleRetry).toHaveBeenCalledOnce()
  })
})

describe("LoadingSpinner Component", () => {
  it("renders spinner without crashing", () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe("ApiCredits Component", () => {
  it("renders usage info correctly", () => {
    render(<ApiCredits />)
    expect(screen.getByText(/5 \/ 10,000/)).toBeInTheDocument()
    expect(screen.getByText("Powered by Open-Meteo API")).toBeInTheDocument()
  })
})

describe("Header Component", () => {
  it("renders site title", () => {
    const mockOpenTestSuite = vi.fn()
    render(<Header onOpenTestSuite={mockOpenTestSuite} />)
    expect(screen.getByText("quackextractor's weather app")).toBeInTheDocument()
  })
})

describe("ThemeToggle Component", () => {
  it("renders light and dark theme control", () => {
    const { container } = render(<ThemeToggle />)
    expect(container).toBeInTheDocument()
  })
})

describe("CurrentWeather Component", () => {
  it("renders weather metrics like temperature and condition description", () => {
    render(<CurrentWeather selectedDayIndex={0} />)
    expect(screen.getByText("22°C")).toBeInTheDocument()
    expect(screen.getByText("Mainly clear")).toBeInTheDocument()
  })
})

describe("DailyForecast Component", () => {
  it("renders list of forecast items", () => {
    const handleDaySelect = vi.fn()
    render(<DailyForecast selectedDayIndex={0} onDaySelect={handleDaySelect} />)
    expect(screen.getByText("7-Day Forecast")).toBeInTheDocument()
  })
})

describe("HourlyForecast Component", () => {
  it("renders hourly forecast details", () => {
    render(<HourlyForecast selectedDayIndex={0} />)
    expect(screen.getByText(/Hourly Forecast/i)).toBeInTheDocument()
  })
})

describe("ColorGroupEditor Component", () => {
  it("renders tab trigger list", () => {
    const mockColors = {
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 84% 4.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 84% 4.9%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      weatherIcon: "221.2 83.2% 53.3%",
      weatherBgFrom: "214 100% 97%",
      weatherBgTo: "221 83% 95%",
      weatherCardAccent: "210 40% 96%",
    }
    render(<ColorGroupEditor colors={mockColors} onColorChange={vi.fn()} />)
    expect(screen.getByRole("tab", { name: "Primary" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Secondary" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Accent" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Base" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Weather" })).toBeInTheDocument()
  })
})

describe("SettingsDialog Component", () => {
  it("renders when open is true", () => {
    render(<SettingsDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Themes" })).toBeInTheDocument()
  })
})
