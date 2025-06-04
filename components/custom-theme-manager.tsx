"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Palette, Check } from "lucide-react"
import { useTheme, type CustomTheme } from "@/contexts/theme-context"
import { ThemeEditor } from "@/components/theme-editor"

export function CustomThemeManager() {
  const { customThemes, activeCustomTheme, applyCustomTheme, deleteCustomTheme } = useTheme()
  const [showEditor, setShowEditor] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)

  const handleCreateNew = () => {
    setEditingTheme(null)
    setShowEditor(true)
  }

  const handleEdit = (theme: CustomTheme) => {
    setEditingTheme(theme)
    setShowEditor(true)
  }

  const handleDelete = (theme: CustomTheme) => {
    if (confirm(`Are you sure you want to delete "${theme.name}"?`)) {
      deleteCustomTheme(theme.id)
    }
  }

  const handleSave = () => {
    setShowEditor(false)
    setEditingTheme(null)
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingTheme(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Themes</h3>
        <Button onClick={handleCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Theme</span>
        </Button>
      </div>

      {customThemes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No custom themes created yet.</p>
            <p className="text-sm">Create your first custom theme to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customThemes.map((theme) => (
            <Card key={theme.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <span>{theme.name}</span>
                    {activeCustomTheme?.id === theme.id && (
                      <Badge variant="default" className="flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Active</span>
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(theme)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(theme)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Color Preview */}
                <div className="flex space-x-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    title="Primary"
                  />
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    title="Secondary"
                  />
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    title="Accent"
                  />
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: `hsl(${theme.colors.weatherIcon})` }}
                    title="Weather Icon"
                  />
                </div>

                <div className="text-xs text-muted-foreground">Created: {theme.createdAt.toLocaleDateString()}</div>

                <Button
                  variant={activeCustomTheme?.id === theme.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyCustomTheme(theme)}
                  className="w-full"
                >
                  {activeCustomTheme?.id === theme.id ? "Applied" : "Apply Theme"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTheme ? "Edit Custom Theme" : "Create Custom Theme"}</DialogTitle>
          </DialogHeader>
          <ThemeEditor editingTheme={editingTheme} onSave={handleSave} onCancel={handleCancel} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
