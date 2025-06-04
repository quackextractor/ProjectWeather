"use client"

import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Cloudy } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherIconProps {
  code: number
  size?: number
  className?: string
  variant?: "default" | "primary"
}

export function WeatherIcon({ code, size = 24, className, variant = "default" }: WeatherIconProps) {
  const getWeatherIcon = (weatherCode: number) => {
    // Ensure we have a valid number
    const numCode = Number(weatherCode)

    // WMO Weather interpretation codes
    // Clear and cloudy
    if (numCode === 0) return Sun // Clear sky
    if (numCode === 1) return Cloudy // Mainly clear
    if (numCode === 2) return Cloudy // Partly cloudy
    if (numCode === 3) return Cloud // Overcast

    // Fog
    if (numCode === 45 || numCode === 48) return Cloud // Fog and depositing rime fog

    // Drizzle
    if ([51, 53, 55, 56, 57].includes(numCode)) return CloudDrizzle // Various drizzle types

    // Rain
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(numCode)) return CloudRain // Various rain types

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(numCode)) return CloudSnow // Various snow types

    // Thunderstorm
    if ([95, 96, 99].includes(numCode)) return CloudLightning // Thunderstorm types

    // Default fallback
    return Sun
  }

  const IconComponent = getWeatherIcon(code)
  const iconClass = variant === "primary" ? "text-primary" : "weather-icon"

  return <IconComponent size={size} className={cn(iconClass, className)} />
}