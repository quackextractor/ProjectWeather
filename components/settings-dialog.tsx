"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Thermometer, SettingsIcon } from "lucide-react"
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom Themes</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
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
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
