"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/color-picker"
import type { CustomTheme } from "@/contexts/theme-context"

interface ColorGroupEditorProps {
  colors: CustomTheme["colors"]
  onColorChange: (colorKey: string, value: string) => void
}

export function ColorGroupEditor({ colors, onColorChange }: ColorGroupEditorProps) {
  const colorGroups = {
    primary: {
      title: "Primary Colors",
      colors: [
        { key: "primary", label: "Primary", description: "Main brand color" },
        { key: "primaryForeground", label: "Primary Text", description: "Text on primary background" },
      ],
    },
    secondary: {
      title: "Secondary Colors",
      colors: [
        { key: "secondary", label: "Secondary", description: "Secondary background color" },
        { key: "secondaryForeground", label: "Secondary Text", description: "Text on secondary background" },
      ],
    },
    accent: {
      title: "Accent Colors",
      colors: [
        { key: "accent", label: "Accent", description: "Accent background color" },
        { key: "accentForeground", label: "Accent Text", description: "Text on accent background" },
      ],
    },
    base: {
      title: "Base Colors",
      colors: [
        { key: "background", label: "Background", description: "Main background color" },
        { key: "foreground", label: "Text", description: "Main text color" },
        { key: "card", label: "Card Background", description: "Card background color" },
        { key: "cardForeground", label: "Card Text", description: "Text on cards" },
        { key: "muted", label: "Muted Background", description: "Muted background color" },
        { key: "mutedForeground", label: "Muted Text", description: "Muted text color" },
        { key: "border", label: "Border", description: "Border color" },
      ],
    },
    weather: {
      title: "Weather-Specific Colors",
      colors: [
        { key: "weatherIcon", label: "Weather Icons", description: "Color for weather icons" },
        { key: "weatherBgFrom", label: "Background Start", description: "Gradient start color" },
        { key: "weatherBgTo", label: "Background End", description: "Gradient end color" },
        { key: "weatherCardAccent", label: "Card Accents", description: "Weather card accent color" },
      ],
    },
  }

  return (
    <Tabs defaultValue="primary" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="primary">Primary</TabsTrigger>
        <TabsTrigger value="secondary">Secondary</TabsTrigger>
        <TabsTrigger value="accent">Accent</TabsTrigger>
        <TabsTrigger value="base">Base</TabsTrigger>
        <TabsTrigger value="weather">Weather</TabsTrigger>
      </TabsList>

      {Object.entries(colorGroups).map(([groupKey, group]) => (
        <TabsContent key={groupKey} value={groupKey}>
          <Card>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.colors.map((colorConfig) => (
                  <ColorPicker
                    key={colorConfig.key}
                    label={colorConfig.label}
                    value={colors[colorConfig.key as keyof typeof colors]}
                    onChange={(value) => onColorChange(colorConfig.key, value)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
