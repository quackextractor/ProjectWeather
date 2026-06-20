"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Thermometer, SettingsIcon, Shield } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { CustomThemeManager } from "@/components/custom-theme-manager"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { themePreset, setThemePreset, temperatureUnit, setTemperatureUnit, activeCustomTheme, resetToPresetTheme } =
    useTheme()

  const themePresets = [
    { id: "default", name: "Default", description: "Classic blue theme" },
    { id: "ocean", name: "Ocean", description: "Deep blue and teal" },
    { id: "sunset", name: "Sunset", description: "Warm orange and pink" },
  ]

  const currentThemeValue = activeCustomTheme ? "custom" : themePreset

  const handleThemePresetChange = (value: string) => {
    if (value !== "custom") {
      resetToPresetTheme(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>Customize your weather app experience</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="themes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Theme Preset</span>
              </Label>
              <RadioGroup value={currentThemeValue} onValueChange={handleThemePresetChange} className="space-y-2">
                {themePresets.map((preset) => (
                  <div key={preset.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={preset.id} id={preset.id} />
                    <Label htmlFor={preset.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm text-muted-foreground">{preset.description}</div>
                    </Label>
                  </div>
                ))}
                {activeCustomTheme && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="flex-1 cursor-pointer">
                      <div className="font-medium">{activeCustomTheme.name}</div>
                      <div className="text-sm text-muted-foreground">Custom theme</div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomThemeManager />
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Thermometer className="h-4 w-4" />
                <span>Temperature Unit</span>
              </Label>
              <RadioGroup
                value={temperatureUnit}
                onValueChange={(value) => setTemperatureUnit(value as any)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="celsius" id="celsius" />
                  <Label htmlFor="celsius" className="cursor-pointer">
                    Celsius (°C)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                  <Label htmlFor="fahrenheit" className="cursor-pointer">
                    Fahrenheit (°F)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Privacy Notice</span>
              </Label>
              <div className="text-sm space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  This application respects your privacy and is designed to process personal data strictly in
                  compliance with the General Data Protection Regulation (GDPR).
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">1. Local Storage</h4>
                  <p>
                    Your configurations (active themes, temperature unit preferences, and the last searched location)
                    are stored locally in your browser&apos;s <code>localStorage</code>. No preference data is transmitted
                    to or stored on our servers.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">2. Third-Party Data Processing</h4>
                  <p>
                    Weather forecasting services and city search suggestions are powered by the external, public
                    <strong> Open-Meteo API</strong>. When querying weather details, your location query or geographical coordinates
                    and your IP address are sent directly from your browser to Open-Meteo to fulfill the request.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">3. Geolocation Consent</h4>
                  <p>
                    The application only accesses your precise device coordinates if you explicitly trigger the
                    &quot;Current Location&quot; lookup and approve the browser&apos;s native location access request.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
