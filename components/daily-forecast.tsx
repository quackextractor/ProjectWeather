"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWeather } from "@/contexts/weather-context"
import { WeatherIcon } from "@/components/weather-icon"
import { formatTemperature, formatDate } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface DailyForecastProps {
  selectedDayIndex: number
  onDaySelect: (index: number) => void
}

export function DailyForecast({ selectedDayIndex, onDaySelect }: DailyForecastProps) {
  const { forecast, isLoading } = useWeather()
  const { temperatureUnit } = useTheme()

  if (isLoading) {
    return (
      <Card className="weather-card">
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center justify-between p-3 theme-accent-bg rounded-lg"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className="weather-card">
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No forecast data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="weather-card weather-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>7-Day Forecast</span>
          <span className="text-sm font-normal text-muted-foreground">
            {selectedDayIndex === 0 ? "Today" : formatDate(forecast.daily[selectedDayIndex]?.date)} selected
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {forecast.daily.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 relative",
                selectedDayIndex === index
                  ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                  : "hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]",
              )}
              onClick={() => onDaySelect(index)}
            >
              {selectedDayIndex === index && (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className={cn("flex-1", selectedDayIndex === index ? "ml-6" : "")}>
                <div className="font-medium">{index === 0 ? "Today" : formatDate(day.date)}</div>
                <div
                  className={cn(
                    "text-sm capitalize",
                    selectedDayIndex === index ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {day.description}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <WeatherIcon
                  code={day.weatherCode}
                  size={32}
                  variant={selectedDayIndex === index ? "primary" : "default"}
                />

                <div className="text-right min-w-[80px]">
                  <div className="font-semibold">{formatTemperature(day.temperatureMax, temperatureUnit)}</div>
                  <div
                    className={cn(
                      "text-sm",
                      selectedDayIndex === index ? "text-primary-foreground/80" : "text-muted-foreground",
                    )}
                  >
                    {formatTemperature(day.temperatureMin, temperatureUnit)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
