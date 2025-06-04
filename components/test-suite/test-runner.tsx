"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, FileText, RefreshCw, Download } from "lucide-react"
import { TestSuite } from "@/lib/testing/test-suite"
import type { TestSuiteResult } from "@/lib/testing/types"
import { TestResultTabs } from "./test-result-tabs"

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestSuiteResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState("")

  const runTests = useCallback(async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest("")
    setResults(null)

    const testSuite = new TestSuite()

    // Set up progress tracking
    testSuite.onProgress = (current: number, total: number, testName: string) => {
      setProgress((current / total) * 100)
      setCurrentTest(testName)
    }

    try {
      const testResults = await testSuite.runAllTests()
      setResults(testResults)
    } catch (error) {
      console.error("Test execution failed:", error)
    } finally {
      setIsRunning(false)
      setProgress(100)
      setCurrentTest("")
    }
  }, [])

  const downloadReport = useCallback(() => {
    if (!results) return

    const report = {
      timestamp: new Date().toISOString(),
      summary: results.summary,
      coverage: results.coverage,
      tests: results.tests.map((test) => ({
        name: test.name,
        status: test.status,
        duration: test.duration,
        error: test.error,
      })),
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Test Suite Runner</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={runTests} disabled={isRunning} className="flex items-center space-x-2">
                {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                <span>{isRunning ? "Running Tests..." : "Run Tests"}</span>
              </Button>
              {results && (
                <Button variant="outline" onClick={downloadReport} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && <TestResultTabs results={results} downloadReport={downloadReport} />}

      {/* No Results State */}
      {!results && !isRunning && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Test Results</h3>
            <p className="text-muted-foreground mb-4">Click "Run Tests" to execute the test suite and view results.</p>
            <Button onClick={runTests} className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Run Tests</span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}