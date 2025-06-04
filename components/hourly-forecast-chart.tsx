"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface HourlyForecastChartProps {
  chartData: Array<{
    time: string
    hour: number
    temperature: number
    feelsLike: number
    precipitation: number
    humidity: number
    windSpeed: number
    isCurrentHour: boolean
    rawTime: Date
    index: number
  }>
  temperatureUnit: "celsius" | "fahrenheit"
}

export function HourlyForecastChart({ chartData, temperatureUnit }: HourlyForecastChartProps) {
  const chartConfig = {
    temperature: {
      label: "Temperature",
      color: "hsl(var(--chart-1))",
    },
    feelsLike: {
      label: "Feels Like",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  return (
    <>
      <div className="h-[400px] w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                            <span className="font-bold text-muted-foreground">{label}</span>
                          </div>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {entry.dataKey === "temperature" ? "Temperature" : "Feels Like"}
                              </span>
                              <span className="font-bold" style={{ color: entry.color }}>
                                {entry.value}°{temperatureUnit === "celsius" ? "C" : "F"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-temperature)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-temperature)",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: "var(--color-temperature)",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="feelsLike"
                stroke="var(--color-feelsLike)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: "var(--color-feelsLike)",
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  stroke: "var(--color-feelsLike)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }}></div>
          <span className="text-sm text-muted-foreground">Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-1">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: "hsl(var(--chart-2))",
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent 0px, transparent 2px, hsl(var(--chart-2)) 2px, hsl(var(--chart-2)) 4px, transparent 4px, transparent 6px)",
              }}
            ></div>
          </div>
          <span className="text-sm text-muted-foreground">Feels Like</span>
        </div>
        {chartData.some((item) => item.isCurrentHour) && (
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: "hsl(var(--chart-1))",
                borderColor: "hsl(var(--background))",
              }}
            ></div>
            <span className="text-sm text-muted-foreground">Current Hour</span>
          </div>
        )}
      </div>
    </>
  )
}
