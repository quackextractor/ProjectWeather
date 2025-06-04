"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useWeather } from "@/contexts/weather-context"
import { WeatherIcon } from "@/components/weather-icon"
import { formatTemperature, formatTime, formatDate, getWindDirection } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { Clock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HourlyForecastChart } from "@/components/hourly-forecast-chart"

interface HourlyForecastProps {
  selectedDayIndex: number
}

export function HourlyForecast({ selectedDayIndex }: HourlyForecastProps) {
  const { forecast, isLoading } = useWeather()
  const { temperatureUnit } = useTheme()

  if (isLoading) {
    return (
      <Card className="weather-card">
        <CardHeader>
          <CardTitle>Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className="weather-card">
        <CardHeader>
          <CardTitle>Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">No hourly forecast data available</div>
        </CardContent>
      </Card>
    )
  }

  // Filter hourly data for the selected day
  const selectedDay = forecast.daily[selectedDayIndex]
  const selectedDate = selectedDay.date.toDateString()

  const hourlyData = forecast.hourly.filter((hour) => hour.time.toDateString() === selectedDate)

  // Get the day name for the title
  const dayName = selectedDayIndex === 0 ? "Today" : formatDate(selectedDay.date)
  const currentTime = new Date()

  // Prepare data for the chart
  const chartData = hourlyData.map((hour, index) => {
    const isCurrentHour =
      selectedDayIndex === 0 &&
      hour.time.getHours() === currentTime.getHours() &&
      hour.time.toDateString() === currentTime.toDateString()

    return {
      time: formatTime(hour.time),
      hour: hour.time.getHours(),
      temperature: temperatureUnit === "celsius" ? hour.temperature : Math.round((hour.temperature * 9) / 5 + 32),
      feelsLike: temperatureUnit === "celsius" ? hour.feelsLike : Math.round((hour.feelsLike * 9) / 5 + 32),
      precipitation: hour.precipitationProbability,
      humidity: hour.humidity,
      windSpeed: hour.windSpeed,
      isCurrentHour,
      rawTime: hour.time,
      index,
    }
  })

  return (
    <Card className="weather-card weather-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 weather-icon" />
          <span>Hourly Forecast for {dayName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hourly">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-4 p-4">
                {hourlyData.map((hour, index) => {
                  const isCurrentHour =
                    selectedDayIndex === 0 &&
                    hour.time.getHours() === currentTime.getHours() &&
                    hour.time.toDateString() === currentTime.toDateString()

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex-shrink-0 text-center p-4 rounded-lg transition-colors w-[120px]",
                        isCurrentHour
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm mb-3 font-medium",
                          isCurrentHour ? "text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {isCurrentHour ? "Now" : formatTime(hour.time)}
                      </div>

                      <WeatherIcon
                        code={hour.weatherCode}
                        size={36}
                        className="mx-auto mb-3"
                        variant={isCurrentHour ? "primary" : "default"}
                      />

                      <div className="font-semibold mb-2 text-lg">
                        {formatTemperature(hour.temperature, temperatureUnit)}
                      </div>

                      <div
                        className={cn(
                          "text-xs mb-2",
                          isCurrentHour ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        Feels {formatTemperature(hour.feelsLike, temperatureUnit)}
                      </div>

                      <div
                        className={cn(
                          "text-xs mb-2",
                          isCurrentHour ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        💧 {hour.precipitationProbability}%
                      </div>

                      <div
                        className={cn(
                          "text-xs mb-2",
                          isCurrentHour ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        💨 {hour.windSpeed} km/h
                      </div>

                      <div
                        className={cn(
                          "text-xs",
                          isCurrentHour ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {getWindDirection(hour.windDirection)}
                      </div>
                    </div>
                  )
                })}

                {hourlyData.length === 0 && (
                  <div className="w-full text-center py-8 text-muted-foreground">
                    No hourly data available for this day
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chart">
            <HourlyForecastChart chartData={chartData} temperatureUnit={temperatureUnit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
