"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Sun, Droplets } from "lucide-react"

interface ThemePreviewProps {
  colors: Record<string, string>
}

export function ThemePreview({ colors }: ThemePreviewProps) {
  const previewStyle = {
    "--preview-primary": colors.primary,
    "--preview-primary-foreground": colors.primaryForeground,
    "--preview-secondary": colors.secondary,
    "--preview-secondary-foreground": colors.secondaryForeground,
    "--preview-accent": colors.accent,
    "--preview-accent-foreground": colors.accentForeground,
    "--preview-background": colors.background,
    "--preview-foreground": colors.foreground,
    "--preview-card": colors.card,
    "--preview-card-foreground": colors.cardForeground,
    "--preview-muted": colors.muted,
    "--preview-muted-foreground": colors.mutedForeground,
    "--preview-border": colors.border,
    "--preview-weather-icon": colors.weatherIcon,
    "--preview-weather-bg-from": colors.weatherBgFrom,
    "--preview-weather-bg-to": colors.weatherBgTo,
    "--preview-weather-card-accent": colors.weatherCardAccent,
  } as React.CSSProperties

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="p-6 rounded-lg border-2 transition-all duration-300"
          style={{
            ...previewStyle,
            background: `linear-gradient(135deg, hsl(${colors.weatherBgFrom}), hsl(${colors.weatherBgTo}))`,
            borderColor: `hsl(${colors.border})`,
            color: `hsl(${colors.foreground})`,
          }}
        >
          <div className="space-y-6">
            {/* Header Preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="p-3 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: `hsl(${colors.primary})` }}
                >
                  <Cloud className="h-6 w-6" style={{ color: `hsl(${colors.primaryForeground})` }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: `hsl(${colors.foreground})` }}>
                    Weather App
                  </h3>
                  <p className="text-sm" style={{ color: `hsl(${colors.mutedForeground})` }}>
                    Theme Preview
                  </p>
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-md font-medium transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: `hsl(${colors.primary})`,
                  color: `hsl(${colors.primaryForeground})`,
                }}
              >
                Button
              </button>
            </div>

            {/* Weather Card Preview */}
            <div
              className="p-4 rounded-lg border transition-all duration-200"
              style={{
                backgroundColor: `hsl(${colors.card})`,
                borderColor: `hsl(${colors.border})`,
                color: `hsl(${colors.cardForeground})`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold" style={{ color: `hsl(${colors.cardForeground})` }}>
                  Current Weather
                </h4>
                <Sun className="h-6 w-6" style={{ color: `hsl(${colors.weatherIcon})` }} />
              </div>
              <div className="text-2xl font-bold mb-3" style={{ color: `hsl(${colors.cardForeground})` }}>
                22°C
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  style={{ backgroundColor: `hsl(${colors.weatherCardAccent})` }}
                >
                  <Droplets className="h-4 w-4" style={{ color: `hsl(${colors.weatherIcon})` }} />
                  <span className="text-sm font-medium" style={{ color: `hsl(${colors.accentForeground})` }}>
                    65%
                  </span>
                </div>
                <div
                  className="p-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                  style={{ backgroundColor: `hsl(${colors.weatherCardAccent})` }}
                >
                  <Sun className="h-4 w-4" style={{ color: `hsl(${colors.weatherIcon})` }} />
                  <span className="text-sm font-medium" style={{ color: `hsl(${colors.accentForeground})` }}>
                    UV 5
                  </span>
                </div>
              </div>
            </div>

            {/* Color Palette Display */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium" style={{ color: `hsl(${colors.mutedForeground})` }}>
                Color Palette
              </h5>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <div
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: `hsl(${colors.primary})` }}
                    title="Primary"
                  />
                  <span className="text-xs" style={{ color: `hsl(${colors.mutedForeground})` }}>
                    Primary
                  </span>
                </div>
                <div className="space-y-1">
                  <div
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: `hsl(${colors.secondary})` }}
                    title="Secondary"
                  />
                  <span className="text-xs" style={{ color: `hsl(${colors.mutedForeground})` }}>
                    Secondary
                  </span>
                </div>
                <div className="space-y-1">
                  <div
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: `hsl(${colors.accent})` }}
                    title="Accent"
                  />
                  <span className="text-xs" style={{ color: `hsl(${colors.mutedForeground})` }}>
                    Accent
                  </span>
                </div>
                <div className="space-y-1">
                  <div
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: `hsl(${colors.weatherIcon})` }}
                    title="Weather Icon"
                  />
                  <span className="text-xs" style={{ color: `hsl(${colors.mutedForeground})` }}>
                    Weather
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
