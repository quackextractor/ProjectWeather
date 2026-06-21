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

---

## 5. Responsive Layout Improvements & Expanded Test Coverage

To enhance usability on mobile viewports and ensure the robustness of the user settings interface:
* **Layout and Spacing Adaptations**:
  * **Margins and Padding**: Reduced card margins to `0.25rem` and background padding to `0.5rem` on viewport sizes smaller than `768px` via updated global CSS media queries.
  * **Header Component**: Transitioned header items from a horizontal flex layout to a stacked vertical alignment (`flex-col items-start`) on mobile, while preserving horizontal alignment (`md:flex-row md:items-center`) on larger displays.
  * **Current Weather Card**: Stacked weather details and key values vertically (`flex-col`) on small devices and scaled down temperature typography sizing to `text-4xl` for optimal display.
  * **Theme Picker Tabs**: Reconfigured color editing tabs list into a scrollable horizontal flex container (`overflow-x-auto scrollbar-thin`) to prevent text overlap on compact viewports.
  * **Settings Dialog**: Allowed dialog contents to expand up to `95vw` on mobile to fit text cleanly, with padding and heights dynamically adjusted.
* **Component Testing Extension**:
  * **ColorGroupEditor Tests**: Validates correct rendering of primary, secondary, accent, base, and weather-specific editing tabs.
  * **SettingsDialog Tests**: Asserts correct render lifecycle, settings context headers, and active tab interfaces.
* **Footer & Privacy Page Integration**:
  * **Global Footer**: Added a site-wide footer to `app/page.tsx` containing a link to the GitHub repository (with a GitHub icon) and a clickable "Privacy Policy" button. Clicking this button directly opens the `SettingsDialog` focused on the Privacy tab.
  * **Open-Meteo Privacy Link**: Integrated a direct hyperlink pointing to Open-Meteo's terms and privacy policy (`https://open-meteo.com/en/terms`) within the settings dialog's GDPR data processing clause.
  * **Application Renaming**: Updated the Header component to rename the website to "quackextractor's weather app" and modified its description to "Customizable weather forecasting".
