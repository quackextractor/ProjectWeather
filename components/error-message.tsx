"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
