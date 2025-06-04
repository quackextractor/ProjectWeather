"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TestTube } from "lucide-react"

interface TestMenuItemProps {
  onOpenTestSuite: () => void
}

export function TestMenuItem({ onOpenTestSuite }: TestMenuItemProps) {
  const [lastRunStatus, setLastRunStatus] = useState<"passed" | "failed" | "none">("none")

  const getStatusBadge = () => {
    switch (lastRunStatus) {
      case "passed":
        return (
          <Badge variant="default" className="bg-green-500 ml-2">
            Passed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="ml-2">
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Button variant="outline" onClick={onOpenTestSuite} className="flex items-center space-x-2">
      <TestTube className="h-4 w-4" />
      <span>Run Test Suite</span>
      {getStatusBadge()}
    </Button>
  )
}
