# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-20

### Added
- Integrated Vitest with JSOM/Happy-DOM for frontend testing.
- Created `src/tests/components.test.tsx` testing core UI components: Header, ErrorMessage, LoadingSpinner, ApiCredits, ThemeToggle, CurrentWeather, DailyForecast, and HourlyForecast.
- Configured `vitest.config.ts` path aliases and testing configurations.
- Configured automated test script in `package.json`.

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
