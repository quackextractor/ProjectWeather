# Weather App - Advanced Weather Forecasting Application

A modern, feature-rich weather application built with Next.js, TypeScript, and Tailwind CSS. This application provides comprehensive weather information with customizable themes, detailed forecasts, and a robust testing suite.

## Features

### Core Weather Features
- **Current Weather**: Real-time weather conditions with detailed metrics
- **7-Day Forecast**: Extended weather predictions with daily summaries
- **Hourly Forecast**: Detailed hourly predictions for each day
- **Location Search**: Search and save multiple locations worldwide
- **Geolocation Support**: Automatic location detection
- **Weather Charts**: Interactive temperature and precipitation charts

### Advanced Features
- **Custom Themes**: Create and manage personalized color themes
- **Theme Presets**: Built-in themes (Default, Ocean, Sunset)
- **Dark/Light Mode**: Automatic system theme detection
- **Temperature Units**: Celsius and Fahrenheit support
- **Responsive Design**: Optimized for all device sizes
- **Progressive Web App**: Install as a native app

### Developer Features
- **Comprehensive Testing**: Testing suite for unit tests with coverage reporting
- **Error Handling**: Robust error management and user feedback
- **Performance Optimization**: Efficient caching and data management
- **Accessibility**: WCAG compliant interface
- **Type Safety**: Full TypeScript implementation

## Architecture

### Design Patterns
- **Repository Pattern**: Weather data access abstraction
- **Observer Pattern**: Theme and weather state management
- **Factory Pattern**: Weather condition and model creation
- **Singleton Pattern**: Cache service implementation
- **Strategy Pattern**: Different weather data formatting strategies

### Core Interfaces
- **IWeatherService**: Weather data retrieval interface
- **ILocation**: Location data structure
- **IWeatherForecast**: Forecast data interface
- **ICacheService**: Caching abstraction
- **IThemeProvider**: Theme management interface

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm package manager
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/quackextractor/ProjectWeather.git
   cd ProjectWeather
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
The application uses the Open-Meteo API (no API key required) but supports configuration:

```env
# Optional: Custom API endpoints
NEXT_PUBLIC_WEATHER_API_URL=https://api.open-meteo.com/v1
NEXT_PUBLIC_GEOCODING_API_URL=https://geocoding-api.open-meteo.com/v1

# Optional: Application settings
NEXT_PUBLIC_DEFAULT_LOCATION=Prague
NEXT_PUBLIC_CACHE_DURATION=300000
```

### Application Configuration
Modify `src/config/app-config.ts` to customize:

```typescript
export const appConfig = {
  api: {
    baseUrl: "https://api.open-meteo.com/v1",
    geocodingUrl: "https://geocoding-api.open-meteo.com/v1",
    timeout: 10000,
    retryAttempts: 3,
  },
  cache: {
    weatherCacheDuration: 5 * 60 * 1000, // 5 minutes
    locationCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    maxCacheSize: 100,
  },
  defaults: {
    forecastDays: 7,
    temperatureUnit: "celsius",
    theme: "system",
  },
}
```

## Customization

### Creating Custom Themes
1. Navigate to Settings → Theme Management
2. Click "Create Custom Theme"
3. Set a Theme name
4. Customize colors using the color picker
5. Preview changes in real-time
6. Save and apply your theme

### Theme Structure
```typescript
interface CustomTheme {
  id: string
  name: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    // ... more color properties
  }
  createdAt: Date
}
```

## Testing

### Running Tests

Tests can be either run in the app under `Landing Page > Run Test Suite > Run Tests`

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm run test -- --grep "Weather Service"
```

### Test Structure
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API and service integration testing
- **Coverage Reports**: Comprehensive code coverage analysis
- **Performance Tests**: Load and stress testing

### Test Suites
- Weather Service Tests
- Location Service Tests
- Theme System Tests
- Formatter Tests
- Validator Tests
- Cache Service Tests

## Usage

### Basic Usage
1. **Location Search**: Use the search bar to find locations
2. **Current Weather**: View current conditions on the main dashboard
3. **Forecasts**: Navigate between daily and hourly forecasts
4. **Settings**: Customize themes, units, and preferences

### Advanced Features
1. **Custom Themes**: Create personalized color schemes
2. **Weather Charts**: Analyze temperature trends

## API Reference

### Weather Service
```typescript
interface IWeatherService {
  getCurrentWeather(location: ILocation): Promise<ICurrentWeather>
  getForecast(location: ILocation): Promise<IWeatherForecast>
  searchLocations(query: string): Promise<readonly ILocation[]>
  reverseGeocode(lat: number, lon: number): Promise<ILocation | null>
}
```

### Theme Management
```typescript
interface ThemeContextType {
  theme: Theme
  temperatureUnit: TemperatureUnit
  customThemes: CustomTheme[]
  setTheme: (theme: Theme) => void
  createCustomTheme: (theme: CustomTheme) => void
  // ... more methods
}
```

## Security

### Data Privacy
- No personal data collection
- Local storage for preferences
- No third-party tracking
- HTTPS enforcement in production

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Open-Meteo**: Weather data API
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling framework
- **Next.js**: React framework

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---
