"use client"

import { useState, useEffect } from "react"
import { WeatherProvider } from "@/contexts/weather-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { Header } from "@/components/header"
import { LocationSearch } from "@/components/location-search"
import { CurrentWeather } from "@/components/current-weather"
import { DailyForecast } from "@/components/daily-forecast"
import { HourlyForecast } from "@/components/hourly-forecast"
import { ApiCredits } from "@/components/api-credits"
import { TestRunner } from "@/components/test-runner"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function WeatherApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0) // Default to today (index 0)
  const [showTestSuite, setShowTestSuite] = useState(false)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center weather-background">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center weather-background">
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      </div>
    )
  }

  return (
    <ThemeProvider>
      <WeatherProvider>
        <div className="min-h-screen weather-background">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <Header onOpenTestSuite={() => setShowTestSuite(true)} />

            {showTestSuite ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowTestSuite(false)}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Weather</span>
                  </Button>
                  <h2 className="text-2xl font-bold">Application Test Suite</h2>
                </div>
                <TestRunner />
              </div>
            ) : (
              <div className="space-y-6">
                <LocationSearch />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <CurrentWeather selectedDayIndex={selectedDayIndex} />
                    <HourlyForecast selectedDayIndex={selectedDayIndex} />
                  </div>

                  <div className="space-y-6">
                    <DailyForecast selectedDayIndex={selectedDayIndex} onDaySelect={setSelectedDayIndex} />
                    <ApiCredits />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </WeatherProvider>
    </ThemeProvider>
  )
}
