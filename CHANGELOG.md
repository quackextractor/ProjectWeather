# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2026-07-02

### Changed
- Switched repository package manager fully to pnpm and removed package-lock.json.

### Fixed
- Resolved all package security vulnerabilities by upgrading vite, vitest, and happy-dom to safe versions.

## [1.1.3] - 2026-06-21

### Added
- Integrated Github icon next to repository link in site footer.

### Changed
- Renamed application to "quackextractor's weather app" and updated description to "Customizable weather forecasting" in Header component.

## [1.1.2] - 2026-06-21

### Changed
- Replaced the copyright notice in the site footer with a link directly to the GitHub repository.

## [1.1.1] - 2026-06-21

### Added
- Integrated a site-wide footer linking directly to the Settings Privacy Policy tab.
- Referenced Open-Meteo's terms and privacy policy link within the Settings Privacy Notice.

### Changed
- Refactored settings dialog state management to allow opening the dialog to a specific tab.

## [1.1.0] - 2026-06-21

### Added
- Added comprehensive Vitest unit tests in `src/tests/components.test.tsx` for `ColorGroupEditor` and `SettingsDialog`.

### Changed
- Refactored `app/globals.css` media query for mobile screens to reduce margins and padding.
- Refactored `Header` component layout to flex stack vertically on mobile screens.
- Refactored `CurrentWeather` layout to flex stack vertically on mobile and adjusted temperature font size.
- Changed `ColorGroupEditor` tab list layout to enable horizontal scrolling on small screens.
- Redesigned `SettingsDialog` to scale to mobile viewport widths, adjusted padding and max-height constraints.

## [1.0.0] - 2026-06-20

### Added
- Integrated Vitest with JSOM/Happy-DOM for frontend testing.
- Created `src/tests/components.test.tsx` testing core UI components: Header, ErrorMessage, LoadingSpinner, ApiCredits, ThemeToggle, CurrentWeather, DailyForecast, and HourlyForecast.
- Configured `vitest.config.ts` path aliases and testing configurations.
- Configured automated test script in `package.json`.
- Added a GDPR-compliant Privacy Notice tab in the Settings Dialog detailing local storage, geolocation consent, and Open-Meteo API data processing.

### Changed
- Modernized project dependencies to secure versions.
- Upgraded `next` to `15.5.19` and enforced React 19 compatibility.
- Pin-override `postcss` to `8.5.10` via overrides in `package.json` to resolve 17 security vulnerabilities.
- Fixed `WeatherCondition` import path inside `src/services/weather-api/weather-api-serializer.ts` and `src/services/weather-api/weather-data-transformer.ts`.
- Restructured `MemoryCacheService` test case to correctly align with character-based sizing parameters.
- Restructured formatter test cases (`formatters.test.ts`) to align with exact physical units and classifications.

### Fixed
- Resolved all package security vulnerabilities.
- Fixed incorrect domain model import paths in `src/tests/weather-service.test.ts` and `src/tests/formatters.test.ts`.

## [0.1.0] - 2026-06-18

### Added
- Initial project layout and structure.
- Weather dashboard interface, weather API services, location search, and theme context definitions.
- Local in-app testing framework in `lib/testing/`.
