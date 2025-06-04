"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Eye, Droplets, Wind, Gauge, Sun } from "lucide-react"
import { useWeather } from "@/contexts/weather-context"
import { WeatherIcon } from "@/components/weather-icon"
import { formatTemperature, formatTime, formatDate } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

interface CurrentWeatherProps {
  selectedDayIndex: number
}

export function CurrentWeather({ selectedDayIndex }: CurrentWeatherProps) {
  const { currentWeather, forecast, location, isLoading } = useWeather()
  const { temperatureUnit } = useTheme()

  if (isLoading) {
    return (
      <Card className="weather-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!location) {
    return (
      <Card className="weather-card">
        <CardContent className="p-6 text-center text-gray-500">Select a location to view weather</CardContent>
      </Card>
    )
  }

  // Determine which weather data to show
  const isToday = selectedDayIndex === 0
  const selectedDay = forecast?.daily[selectedDayIndex]

  // Always use the daily forecast weather code for consistency, even for "Today"
  // This ensures the icon matches what's shown in the 7-day forecast
  const weatherData =
    isToday && currentWeather && selectedDay
      ? {
          temperature: currentWeather.temperature,
          temperatureMax: currentWeather.temperatureMax,
          temperatureMin: currentWeather.temperatureMin,
          weatherCode: selectedDay.weatherCode, // Use daily forecast weather code for consistency
          description: selectedDay.description, // Use daily forecast description for consistency
          feelsLike: currentWeather.feelsLike,
          humidity: currentWeather.humidity,
          pressure: currentWeather.pressure,
          visibility: currentWeather.visibility,
          windSpeed: currentWeather.windSpeed,
          uvIndex: currentWeather.uvIndex,
          timestamp: currentWeather.timestamp,
        }
      : selectedDay
        ? {
            temperature: Math.round((selectedDay.temperatureMax + selectedDay.temperatureMin) / 2),
            temperatureMax: selectedDay.temperatureMax,
            temperatureMin: selectedDay.temperatureMin,
            weatherCode: selectedDay.weatherCode,
            description: selectedDay.description,
            feelsLike: Math.round((selectedDay.feelsLikeMax + selectedDay.feelsLikeMin) / 2),
            humidity: null, // Will be calculated from hourly data
            pressure: null, // Will be calculated from hourly data
            visibility: 10, // Default value for forecast days
            windSpeed: selectedDay.windSpeed,
            uvIndex: selectedDay.uvIndex,
            timestamp: selectedDay.date,
          }
        : null

  // Calculate average values from hourly data for forecast days
  if (!isToday && selectedDay && forecast) {
    const selectedDate = selectedDay.date.toDateString()
    const dayHourlyData = forecast.hourly.filter((hour) => hour.time.toDateString() === selectedDate)

    if (dayHourlyData.length > 0) {
      // Calculate averages from hourly data
      const avgHumidity = dayHourlyData.reduce((sum, hour) => sum + hour.humidity, 0) / dayHourlyData.length
      const avgPressure = dayHourlyData.reduce((sum, hour) => sum + hour.pressure, 0) / dayHourlyData.length

      weatherData.humidity = Math.round(avgHumidity)
      weatherData.pressure = Math.round(avgPressure)
    }
  }

  if (!weatherData) {
    return (
      <Card className="weather-card">
        <CardContent className="p-6 text-center text-gray-500">No weather data available for selected day</CardContent>
      </Card>
    )
  }

  // Generate title based on selected day
  const getTitle = () => {
    if (isToday) {
      return "Current Weather"
    }
    const dayName = selectedDayIndex === 1 ? "Tomorrow" : formatDate(selectedDay!.date)
    return `Weather for ${dayName}`
  }

  // Weather details that are available for both current and forecast data
  const availableDetails = [
    {
      icon: Thermometer,
      label: "Feels like",
      value: formatTemperature(weatherData.feelsLike, temperatureUnit),
    },
    {
      icon: Eye,
      label: "Visibility",
      value: `${weatherData.visibility} km`,
    },
    ...(weatherData.humidity !== null
      ? [
          {
            icon: Droplets,
            label: "Humidity",
            value: `${weatherData.humidity}%`,
          },
        ]
      : []),
    {
      icon: Wind,
      label: "Wind",
      value: `${weatherData.windSpeed} km/h`,
    },
    ...(weatherData.pressure !== null
      ? [
          {
            icon: Gauge,
            label: "Pressure",
            value: `${weatherData.pressure} hPa`,
          },
        ]
      : []),
    {
      icon: Sun,
      label: "UV Index",
      value: weatherData.uvIndex.toString(),
    },
  ]

  return (
    <Card className="weather-card weather-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getTitle()}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {isToday ? formatTime(weatherData.timestamp) : formatDate(weatherData.timestamp)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold">{formatTemperature(weatherData.temperature, temperatureUnit)}</div>
            <div className="text-lg text-muted-foreground capitalize">{weatherData.description}</div>
            <div className="text-sm text-muted-foreground mt-1">
              H: {formatTemperature(weatherData.temperatureMax, temperatureUnit)} L:{" "}
              {formatTemperature(weatherData.temperatureMin, temperatureUnit)}
            </div>
          </div>
          <div className="text-right">
            <WeatherIcon code={weatherData.weatherCode} size={80} className="mb-2 weather-icon" variant="default" />
          </div>
        </div>

        {availableDetails.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableDetails.map((detail, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 theme-accent-bg rounded-lg">
                <detail.icon className="h-5 w-5 weather-icon" />
                <div>
                  <div className="text-sm text-muted-foreground">{detail.label}</div>
                  <div className="font-semibold">{detail.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}