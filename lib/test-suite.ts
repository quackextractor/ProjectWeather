import type { TestResult, TestSuiteResult, TestFunction, ProgressCallback } from "./types"
import { WeatherServiceTests } from "./suites/weather-service-tests"
import { LocationServiceTests } from "./suites/location-service-tests"
import { FormatterTests } from "./suites/formatter-tests"
import { ValidatorTests } from "./suites/validator-tests"
import { ThemeTests } from "./suites/theme-tests"
import { CacheServiceTests } from "./suites/cache-service-tests"
import { CoverageCalculator } from "./coverage-calculator"
import { WeatherServiceComprehensiveTests } from "./suites/weather-service-comprehensive-tests"
import { LocationServiceComprehensiveTests } from "./suites/location-service-comprehensive-tests"
import { ThemeContextTests } from "./suites/theme-context-tests"
import { UtilsComprehensiveTests } from "./suites/utils-comprehensive-tests"

interface TestCase {
  name: string
  description?: string
  testFn: TestFunction
  suite: string
}

export class TestSuite {
  private tests: TestCase[] = []
  public onProgress?: ProgressCallback

  constructor() {
    this.registerTests()
  }

  private registerTests() {
    // Weather Service Tests (Original + Comprehensive)
    const weatherTests = new WeatherServiceTests()
    this.addTestSuite("Weather Service", weatherTests.getTests())

    const weatherComprehensiveTests = new WeatherServiceComprehensiveTests()
    this.addTestSuite("Weather Service Advanced", weatherComprehensiveTests.getTests())

    // Location Service Tests (Original + Comprehensive)
    const locationTests = new LocationServiceTests()
    this.addTestSuite("Location Service", locationTests.getTests())

    const locationComprehensiveTests = new LocationServiceComprehensiveTests()
    this.addTestSuite("Location Service Advanced", locationComprehensiveTests.getTests())

    // Formatter Tests
    const formatterTests = new FormatterTests()
    this.addTestSuite("Formatters", formatterTests.getTests())

    // Validator Tests
    const validatorTests = new ValidatorTests()
    this.addTestSuite("Validators", validatorTests.getTests())

    // Theme Tests (Original + Comprehensive)
    const themeTests = new ThemeTests()
    this.addTestSuite("Theme System", themeTests.getTests())

    const themeContextTests = new ThemeContextTests()
    this.addTestSuite("Theme Context", themeContextTests.getTests())

    // Cache Service Tests
    const cacheTests = new CacheServiceTests()
    this.addTestSuite("Cache Service", cacheTests.getTests())

    // Utils Tests (Comprehensive)
    const utilsComprehensiveTests = new UtilsComprehensiveTests()
    this.addTestSuite("Utils Advanced", utilsComprehensiveTests.getTests())
  }

  private addTestSuite(suiteName: string, tests: Array<{ name: string; description?: string; testFn: TestFunction }>) {
    tests.forEach((test) => {
      this.tests.push({
        name: `${suiteName}: ${test.name}`,
        description: test.description,
        testFn: test.testFn,
        suite: suiteName,
      })
    })
  }

  async runAllTests(): Promise<TestSuiteResult> {
    const results: TestResult[] = []
    const startTime = Date.now()

    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i]

      if (this.onProgress) {
        this.onProgress(i + 1, this.tests.length, test.name)
      }

      const result = await this.runSingleTest(test)
      results.push(result)

      // Add small delay to show progress
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    const totalDuration = Date.now() - startTime
    const summary = this.calculateSummary(results, totalDuration)
    const coverage = await this.calculateCoverage()

    return {
      summary,
      coverage,
      tests: results,
      timestamp: new Date(),
    }
  }

  private async runSingleTest(test: TestCase): Promise<TestResult> {
    const startTime = Date.now()

    try {
      await test.testFn()
      return {
        name: test.name,
        description: test.description,
        status: "passed",
        duration: Date.now() - startTime,
      }
    } catch (error) {
      return {
        name: test.name,
        description: test.description,
        status: "failed",
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private calculateSummary(results: TestResult[], totalDuration: number) {
    const total = results.length
    const passed = results.filter((r) => r.status === "passed").length
    const failed = results.filter((r) => r.status === "failed").length
    const skipped = results.filter((r) => r.status === "skipped").length
    const successRate = total > 0 ? (passed / total) * 100 : 0

    return {
      total,
      passed,
      failed,
      skipped,
      successRate,
      totalDuration,
    }
  }

  private async calculateCoverage() {
    const calculator = new CoverageCalculator()
    return calculator.calculateCoverage()
  }
}
