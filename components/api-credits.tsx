"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Calendar, TrendingUp } from "lucide-react"
import { useWeather } from "@/contexts/weather-context"

export function ApiCredits() {
  const { apiCallsToday } = useWeather()

  // Open-Meteo allows 10,000 calls per day for free
  const dailyLimit = 10000
  const usagePercentage = (apiCallsToday / dailyLimit) * 100

  return (
    <Card className="weather-card weather-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 weather-icon" />
          <span>API Usage</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Today's Usage</span>
            <span>
              {apiCallsToday} / {dailyLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3 p-3 theme-accent-bg rounded-lg">
            <Calendar className="h-4 w-4 weather-icon" />
            <div>
              <div className="text-sm text-muted-foreground">Calls Today</div>
              <div className="font-semibold">{apiCallsToday}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 theme-accent-bg rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="font-semibold">{(dailyLimit - apiCallsToday).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Powered by Open-Meteo API
        </div>
      </CardContent>
    </Card>
  )
}
