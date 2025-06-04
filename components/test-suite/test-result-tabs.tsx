"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react"
import type { TestResult, TestSuiteResult } from "@/lib/testing/types"

interface TestResultTabsProps {
  results: TestSuiteResult | null
  downloadReport: () => void
}

export function TestResultTabs({ results, downloadReport }: TestResultTabsProps) {
  if (!results) return null

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "skipped":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="tests">Test Results</TabsTrigger>
        <TabsTrigger value="coverage">Coverage</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      {/* Summary Tab */}
      <TabsContent value="summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{results.summary.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{results.summary.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{results.summary.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{results.summary.totalDuration}ms</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Status */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span>Test Success Rate</span>
                  <span>{results.summary.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={results.summary.successRate} className="h-2" />
              </div>
              <Badge variant={results.summary.successRate >= 90 ? "default" : "destructive"} className="text-sm">
                {results.summary.successRate >= 90
                  ? "Excellent"
                  : results.summary.successRate >= 70
                    ? "Good"
                    : "Needs Improvement"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Test Results Tab */}
      <TabsContent value="tests">
        <Card>
          <CardHeader>
            <CardTitle>Individual Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {results.tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="font-medium">{test.name}</p>
                        {test.description && <p className="text-sm text-muted-foreground">{test.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{test.duration}ms</span>
                      <Badge variant={test.status === "passed" ? "default" : "destructive"}>{test.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Coverage Tab */}
      <TabsContent value="coverage">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Coverage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Lines</span>
                    <span>{results.coverage.lines.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={results.coverage.lines.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.coverage.lines.covered} / {results.coverage.lines.total} lines covered
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Functions</span>
                    <span>{results.coverage.functions.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={results.coverage.functions.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.coverage.functions.covered} / {results.coverage.functions.total} functions covered
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Branches</span>
                    <span>{results.coverage.branches.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={results.coverage.branches.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.coverage.branches.covered} / {results.coverage.branches.total} branches covered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coverage by File</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {results.coverage.files.map((file, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-sm">{file.coverage.toFixed(1)}%</span>
                      </div>
                      <Progress value={file.coverage} className="h-1" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Details Tab */}
      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {results.tests
                  .filter((test) => test.status === "failed")
                  .map((test, index) => (
                    <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-700">{test.name}</span>
                      </div>
                      {test.error && (
                        <div className="bg-red-100 p-3 rounded text-sm">
                          <pre className="whitespace-pre-wrap text-red-800">{test.error}</pre>
                        </div>
                      )}
                    </div>
                  ))}

                {results.tests.filter((test) => test.status === "failed").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>All tests passed! No errors to display.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
