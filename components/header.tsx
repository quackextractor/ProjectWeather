"use client"

import { Cloud, Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsDialog } from "@/components/settings-dialog"
import { TestMenuItem } from "@/components/test-menu-item"
import { useWeather } from "@/contexts/weather-context"
import { useState } from "react"

interface HeaderProps {
  onOpenTestSuite?: () => void
}

export function Header({ onOpenTestSuite }: HeaderProps) {
  const { refreshWeather, isLoading } = useWeather()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <Cloud className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weather App</h1>
          <p className="text-muted-foreground">Simple weather forecasting</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={refreshWeather} disabled={isLoading} className="relative">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        {onOpenTestSuite && <TestMenuItem onOpenTestSuite={onOpenTestSuite} />}

        <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </div>
    </header>
  )
}
