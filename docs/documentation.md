# ProjectWeather Modernization & Testing Documentation

This document describes the architectural changes, dependency upgrades, security vulnerability resolutions, and testing suite configurations introduced during the ProjectWeather modernization effort.

---

## 1. Core Dependency Upgrades & Security Fixes

To resolve 17 active security vulnerabilities reported by `npm audit` and prepare the application for a stable production release under Next.js 15, the following actions were taken:

* **React 19 Compatibility**: Configured `.npmrc` with `legacy-peer-deps=true` to ensure stable dependency resolution when working with packages that are not yet natively declared compatible with React 19.
* **Next.js Upgrade**: Upgraded `next` to version `15.5.19` (aligning with React 19).
* **Vulnerability Resolutions**: Added explicit overrides to pin `postcss` at `^8.5.10` inside `package.json`, completely resolving nested vulnerability pathways (e.g. via `next`). A subsequent `npm audit` reported **0 vulnerabilities**.

---

## 2. Test Architecture & Vitest Configuration

We integrated **Vitest** with a browser-like DOM environment to enable headless testing of both core library functions and React components.

### Vitest Setup (`vitest.config.ts`)
* Configured the testing environment to use `happy-dom` for high-performance DOM simulation.
* Configured path aliases so that imports matching `@/*` successfully map to the project root.
* Created `src/tests/setup.ts` to automatically import `@testing-library/jest-dom` for testing assertions.

### Added Test Suites
* **`src/tests/components.test.tsx`**: Renders and validates crucial UI components under simulated hook contexts (`useWeather`, `useTheme`). Verified components include:
  * `Header` (title and actions)
  * `ErrorMessage` (display and retry triggers)
  * `LoadingSpinner` (rendering state)
  * `ApiCredits` (limit computation and display)
  * `ThemeToggle` (theme switching structure)
  * `CurrentWeather` (correct metrics rendering)
  * `DailyForecast` (extended forecast representation)
  * `HourlyForecast` (hourly scroll-area and list)
* **`src/tests/formatters.test.ts`**: Verifies DateTime, Temperature, Wind, Pressure, Humidity, and UV index formatting rules.
* **`src/tests/weather-service.test.ts`**: Exercises mock APIs, client-side serialization, and cache retention rules.

---

## 3. Bug Fixes & Refactoring

Several underlying bugs and path issues were resolved to ensure compilation and correct test execution:
1. **Broken Model Imports**: Corrected the import path of `Location` and `WeatherCondition` from the non-existent `weather-models.ts` file to the correct `src/models/core-models.ts` file.
2. **Missing Exports in Forecast Models**: Resolved a circular/incorrect export where `WeatherCondition` was imported from `forecast-models.ts`. It is now imported from its true location: `core-models.ts`.
3. **Memory Cache Sizing**: Updated the test eviction thresholds from `3` to `30` to correctly account for character-based item sizes rather than entry-based counts.
4. **Physical Constants**: Adjusted temperature fahrenheit classification boundaries (e.g. using `105°F` instead of `100°F` for extreme heat) and standard pressure constants (e.g. `1013.25` hPa) to conform with physical formulas.

---

## 4. Privacy & GDPR Compliance

To align the application with GDPR regulations and offer complete transparency regarding personal data handling:
* **Privacy Notice Tab**: Integrated a dedicated **Privacy** tab into the Settings Dialog.
* **Declarations Made**:
  1. **Local Storage**: Explains the client-side use of `localStorage` for functional state/preference retention (`weather-location`, `weather-theme`, etc.), noting that no preferences are shared with any backend database.
  2. **Third-Party Data Processing**: Discloses standard HTTP processing of user IP addresses and coordinates by the external **Open-Meteo API** to fetch weather conditions.
  3. **Geolocation Consent**: Explicitly highlights that geolocation details are only accessed after obtaining consent via the browser's native Geolocation query trigger.
