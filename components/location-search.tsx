"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWeather } from "@/contexts/weather-context"
import { debounce } from "@/lib/utils"
import type { Location } from "@/types/weather"

export function LocationSearch() {
  const { searchLocation, setLocation, location, isLoading } = useWeather()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        setIsSearching(false)
        return
      }

      try {
        setIsSearching(true)
        const results = await searchLocation(searchQuery)
        setSuggestions(results.slice(0, 5)) // Limit to 5 suggestions
        setShowSuggestions(true)
      } catch (error) {
        console.error("Search failed:", error)
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300),
    [searchLocation],
  )

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query, debouncedSearch])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationSelect = async (selectedLocation: Location) => {
    setQuery(selectedLocation.name)
    setShowSuggestions(false)
    setSuggestions([])
    await setLocation(selectedLocation)
  }

  const handleCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setGeoLoading(true)

    try {
      // Wrap geolocation in a promise for better error handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        )
      })

      const { latitude, longitude } = position.coords
      const currentLocation: Location = {
        name: "Current Location",
        latitude,
        longitude,
        country: "",
        region: "",
      }

      await setLocation(currentLocation)
      setQuery("Current Location")
    } catch (error) {
      console.error("Geolocation error:", error)
      let errorMessage = "Failed to get your location."

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
      }

      alert(errorMessage)
    } finally {
      setGeoLoading(false)
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <Card className="weather-card p-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10"
              disabled={isLoading}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleCurrentLocation}
            disabled={isLoading || geoLoading}
            className="flex items-center space-x-2"
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 weather-icon" />}
            <span className="hidden sm:inline">Current</span>
          </Button>
        </div>

        {location && (
          <div className="mt-3 text-sm text-muted-foreground">
            <MapPin className="inline h-4 w-4 mr-1 weather-icon" />
            {location.name}
            {location.region && `, ${location.region}`}
            {location.country && `, ${location.country}`}
          </div>
        )}
      </Card>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="weather-card absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
              onClick={() => handleLocationSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground border-b last:border-b-0 transition-colors"
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-sm text-muted-foreground">
                {suggestion.region && `${suggestion.region}, `}
                {suggestion.country}
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  )
}
