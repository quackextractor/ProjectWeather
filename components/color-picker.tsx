"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Pipette, Copy, Check } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hslValue, setHslValue] = useState(value)
  const [hexValue, setHexValue] = useState("")
  const [copied, setCopied] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Convert HSL to hex for display
  useEffect(() => {
    const hex = hslToHex(hslValue)
    setHexValue(hex)
  }, [hslValue])

  useEffect(() => {
    setHslValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hslToHex = (hsl: string): string => {
    try {
      const [h, s, l] = hsl.split(" ").map((val, index) => {
        if (index === 0) return Number.parseFloat(val)
        return Number.parseFloat(val.replace("%", "")) / 100
      })

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2

      let r = 0,
        g = 0,
        b = 0

      if (0 <= h && h < 60) {
        r = c
        g = x
        b = 0
      } else if (60 <= h && h < 120) {
        r = x
        g = c
        b = 0
      } else if (120 <= h && h < 180) {
        r = 0
        g = c
        b = x
      } else if (180 <= h && h < 240) {
        r = 0
        g = x
        b = c
      } else if (240 <= h && h < 300) {
        r = x
        g = 0
        b = c
      } else if (300 <= h && h < 360) {
        r = c
        g = 0
        b = x
      }

      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    } catch {
      return "#000000"
    }
  }

  const hexToHsl = (hex: string): string => {
    try {
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)

      return `${h} ${s}% ${l}%`
    } catch {
      return "0 0% 0%"
    }
  }

  const handleHexChange = (hex: string) => {
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      const hsl = hexToHsl(hex)
      setHslValue(hsl)
      onChange(hsl)
    }
    setHexValue(hex)
  }

  const handleHslChange = (hsl: string) => {
    setHslValue(hsl)
    onChange(hsl)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const presetColors = [
    { name: "Blue", value: "221.2 83.2% 53.3%" },
    { name: "Ocean", value: "199 89% 48%" },
    { name: "Orange", value: "24 95% 53%" },
    { name: "Green", value: "142 76% 36%" },
    { name: "Red", value: "348 83% 47%" },
    { name: "Purple", value: "271 81% 56%" },
    { name: "Yellow", value: "47 96% 53%" },
    { name: "Gray", value: "0 0% 50%" },
    { name: "Teal", value: "173 80% 40%" },
    { name: "Pink", value: "330 81% 60%" },
    { name: "Indigo", value: "263 70% 50%" },
    { name: "Emerald", value: "160 84% 39%" },
  ]

  return (
    <div ref={pickerRef} className="relative">
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-10 p-0 border-2 relative overflow-hidden"
            style={{ backgroundColor: `hsl(${hslValue})` }}
          >
            <Pipette className="h-4 w-4 text-white drop-shadow-sm" />
          </Button>
          <div className="flex-1 space-y-1">
            <Input
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm"
            />
            <div className="flex items-center space-x-1">
              <Input
                value={hslValue}
                onChange={(e) => handleHslChange(e.target.value)}
                placeholder="221.2 83.2% 53.3%"
                className="font-mono text-xs"
              />
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(hslValue)} className="h-8 w-8 p-0">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 space-y-4 shadow-lg">
          <div className="space-y-3">
            <label className="text-sm font-medium">Preset Colors</label>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setHslValue(color.value)
                    onChange(color.value)
                  }}
                  className="group relative w-full h-10 rounded border-2 border-gray-300 hover:border-gray-500 transition-all duration-200 overflow-hidden"
                  style={{ backgroundColor: `hsl(${color.value})` }}
                  title={color.name}
                >
                  <span className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow">
                      {color.name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color Information</label>
            <div className="text-xs space-y-1 font-mono">
              <div>HSL: {hslValue}</div>
              <div>HEX: {hexValue}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
