"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Palette, Save, RotateCcw, Eye, Wand2, AlertTriangle, CheckCircle } from "lucide-react"
import { useTheme, type CustomTheme } from "@/contexts/theme-context"
import { ThemePreview } from "@/components/theme-preview"
import { ThemeValidator } from "@/utils/theme-validator"
import { ThemeGenerator } from "@/utils/theme-generator"
import { ColorGroupEditor } from "@/components/color-group-editor"

interface ThemeEditorProps {
  editingTheme?: CustomTheme | null
  onSave?: (theme: CustomTheme) => void
  onCancel?: () => void
}

export function ThemeEditor({ editingTheme, onSave, onCancel }: ThemeEditorProps) {
  const { createCustomTheme, updateCustomTheme, applyCustomTheme } = useTheme()

  const [themeName, setThemeName] = useState(editingTheme?.name || "")
  const [colors, setColors] = useState(
    editingTheme?.colors || {
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 84% 4.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 84% 4.9%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      weatherIcon: "221.2 83.2% 53.3%",
      weatherBgFrom: "214 100% 97%",
      weatherBgTo: "221 83% 95%",
      weatherCardAccent: "210 40% 96%",
    },
  )

  const [validation, setValidation] = useState(ThemeValidator.validateTheme(colors))
  const [previewMode, setPreviewMode] = useState(false)

  const handleColorChange = (colorKey: string, value: string) => {
    const sanitizedValue = ThemeValidator.sanitizeColorValue(value)
    const newColors = {
      ...colors,
      [colorKey]: sanitizedValue,
    }
    setColors(newColors)
    setValidation(ThemeValidator.validateTheme(newColors))
  }

  const handleSave = () => {
    if (!themeName.trim()) {
      alert("Please enter a theme name")
      return
    }

    if (!validation.isValid) {
      alert("Please fix validation errors before saving")
      return
    }

    const themeData = {
      name: themeName.trim(),
      colors,
    }

    if (editingTheme) {
      updateCustomTheme(editingTheme.id, themeData)
      onSave?.(editingTheme)
    } else {
      const newTheme = createCustomTheme(themeData)
      onSave?.(newTheme)
    }
  }

  const handlePreview = () => {
    const tempTheme: CustomTheme = {
      id: "preview",
      name: themeName || "Preview",
      colors,
      createdAt: new Date(),
    }
    applyCustomTheme(tempTheme)
    setPreviewMode(true)
  }

  const handleReset = () => {
    if (editingTheme) {
      setColors(editingTheme.colors)
      setThemeName(editingTheme.name)
    } else {
      setColors({
        primary: "221.2 83.2% 53.3%",
        primaryForeground: "210 40% 98%",
        secondary: "210 40% 96%",
        secondaryForeground: "222.2 84% 4.9%",
        accent: "210 40% 96%",
        accentForeground: "222.2 84% 4.9%",
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        card: "0 0% 100%",
        cardForeground: "222.2 84% 4.9%",
        muted: "210 40% 96%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "214.3 31.8% 91.4%",
        weatherIcon: "221.2 83.2% 53.3%",
        weatherBgFrom: "214 100% 97%",
        weatherBgTo: "221 83% 95%",
        weatherCardAccent: "210 40% 96%",
      })
      setThemeName("")
    }
    setValidation(ThemeValidator.validateTheme(colors))
  }

  const handleGenerateTheme = (harmony: "monochromatic" | "analogous" | "complementary" | "triadic") => {
    const generated = ThemeGenerator.generateFromBaseColor(colors.primary, themeName || "Generated Theme", harmony)
    setColors(generated.colors)
    setValidation(ThemeValidator.validateTheme(generated.colors))
  }

  const handleGenerateRandom = () => {
    const generated = ThemeGenerator.generateRandomTheme(themeName || "Random Theme")
    setColors(generated.colors)
    setValidation(ThemeValidator.validateTheme(generated.colors))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>{editingTheme ? "Edit Theme" : "Create Custom Theme"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-name">Theme Name</Label>
            <Input
              id="theme-name"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="Enter theme name..."
            />
          </div>

          {/* Validation Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {validation.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Theme Validation: {validation.isValid ? "Valid" : "Invalid"}</span>
            </div>

            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.warnings.slice(0, 3).map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                    {validation.warnings.length > 3 && (
                      <li className="text-sm">...and {validation.warnings.length - 3} more warnings</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} variant="outline" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
            <Button onClick={handleGenerateRandom} variant="outline" className="flex items-center space-x-2">
              <Wand2 className="h-4 w-4" />
              <span>Random</span>
            </Button>
          </div>

          {/* Color Harmony Generators */}
          <div className="space-y-2">
            <Label>Generate from Primary Color</Label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleGenerateTheme("monochromatic")}>
                Monochromatic
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleGenerateTheme("analogous")}>
                Analogous
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleGenerateTheme("complementary")}>
                Complementary
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleGenerateTheme("triadic")}>
                Triadic
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ColorGroupEditor colors={colors} onColorChange={handleColorChange} />

      <ThemePreview colors={colors} />

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} className="flex items-center space-x-2" disabled={!validation.isValid}>
          <Save className="h-4 w-4" />
          <span>{editingTheme ? "Update Theme" : "Save Theme"}</span>
        </Button>
      </div>
    </div>
  )
}
