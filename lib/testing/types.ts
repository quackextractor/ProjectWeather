export interface TestResult {
  name: string
  description?: string
  status: "passed" | "failed" | "skipped"
  duration: number
  error?: string
}

export interface TestSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  successRate: number
  totalDuration: number
}

export interface CoverageMetric {
  total: number
  covered: number
  percentage: number
}

export interface FileCoverage {
  name: string
  coverage: number
  lines: CoverageMetric
}

export interface CoverageReport {
  lines: CoverageMetric
  functions: CoverageMetric
  branches: CoverageMetric
  files: FileCoverage[]
}

export interface TestSuiteResult {
  summary: TestSummary
  coverage: CoverageReport
  tests: TestResult[]
  timestamp: Date
}

export type TestFunction = () => Promise<void> | void
export type ProgressCallback = (current: number, total: number, testName: string) => void
