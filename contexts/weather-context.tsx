"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import { WeatherService } from "@/services/weather-service"
import { LocationService } from "@/services/location-service"
import type { WeatherData, Location, ForecastData } from "@/types/weather"

interface WeatherContextType {
  currentWeather: WeatherData | null
  forecast: ForecastData | null
  location: Location | null
  isLoading: boolean
  error: string | null
  searchLocation: (query: string) => Promise<Location[]>
  setLocation: (location: Location) => Promise<void>
  refreshWeather: () => Promise<void>
  apiCallsToday: number
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [location, setLocationState] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiCallsToday, setApiCallsToday] = useState(0)

  // Memoize services to prevent recreation on every render
  const weatherService = useMemo(() => new WeatherService(), [])
  const locationService = useMemo(() => new LocationService(), [])

  const searchLocation = useCallback(
    async (query: string): Promise<Location[]> => {
      try {
        setError(null)
        return await locationService.searchLocations(query)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to search locations"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [locationService],
  )

  const setLocation = useCallback(
    async (newLocation: Location) => {
      try {
        setIsLoading(true)
        setError(null)
        setLocationState(newLocation)

        // Use the combined API call to reduce usage
        const { current, forecast: forecastData } = await weatherService.getWeatherAndForecast(
          newLocation.latitude,
          newLocation.longitude,
        )

        setCurrentWeather(current)
        setForecast(forecastData)
        setApiCallsToday((prev) => prev + 1) // Only 1 API call now

        // Store location in localStorage
        localStorage.setItem("weather-location", JSON.stringify(newLocation))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [weatherService],
  )

  const refreshWeather = useCallback(async () => {
    if (!location) return

    try {
      setIsLoading(true)
      setError(null)

      // Use the combined API call to reduce usage
      const { current, forecast: forecastData } = await weatherService.getWeatherAndForecast(
        location.latitude,
        location.longitude,
      )

      setCurrentWeather(current)
      setForecast(forecastData)
      setApiCallsToday((prev) => prev + 1) // Only 1 API call now
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh weather data"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [location, weatherService])

  // Load saved location on mount - only run once
  React.useEffect(() => {
    const loadSavedLocation = async () => {
      const savedLocation = localStorage.getItem("weather-location")
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation)
          await setLocation(parsedLocation)
        } catch (err) {
          console.error("Failed to parse saved location:", err)
        }
      }
    }

    loadSavedLocation()
  }, []) // Remove setLocation from dependencies to prevent infinite loop

  const value: WeatherContextType = useMemo(
    () => ({
      currentWeather,
      forecast,
      location,
      isLoading,
      error,
      searchLocation,
      setLocation,
      refreshWeather,
      apiCallsToday,
    }),
    [currentWeather, forecast, location, isLoading, error, searchLocation, setLocation, refreshWeather, apiCallsToday],
  )

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider")
  }
  return context
}
