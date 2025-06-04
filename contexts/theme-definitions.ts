export const defaultThemes = {
  default: {
    name: "Default",
    colors: {
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 84% 4.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 84% 4.9%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      weatherIcon: "221.2 83.2% 53.3%",
      weatherBgFrom: "214 100% 97%",
      weatherBgTo: "221 83% 95%",
      weatherCardAccent: "210 40% 96%",
    },
  },
  ocean: {
    name: "Ocean",
    colors: {
      primary: "199 89% 48%",
      primaryForeground: "210 40% 98%",
      secondary: "197 37% 24%",
      secondaryForeground: "210 40% 98%",
      accent: "196 75% 88%",
      accentForeground: "197 37% 24%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      weatherIcon: "199 89% 48%",
      weatherBgFrom: "196 100% 97%",
      weatherBgTo: "199 89% 95%",
      weatherCardAccent: "196 75% 88%",
    },
  },
  sunset: {
    name: "Sunset",
    colors: {
      primary: "24 95% 53%",
      primaryForeground: "210 40% 98%",
      secondary: "33 100% 96%",
      secondaryForeground: "222.2 84% 4.9%",
      accent: "33 100% 88%",
      accentForeground: "24 95% 53%",
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      border: "214.3 31.8% 91.4%",
      weatherIcon: "24 95% 53%",
      weatherBgFrom: "33 100% 97%",
      weatherBgTo: "24 95% 95%",
      weatherCardAccent: "33 100% 88%",
    },
  },
}

export const darkThemeOverrides = {
  background: "222.2 84% 4.9%",
  foreground: "210 40% 98%",
  card: "222.2 84% 4.9%",
  cardForeground: "210 40% 98%",
  secondary: "217.2 32.6% 17.5%",
  secondaryForeground: "210 40% 98%",
  muted: "217.2 32.6% 17.5%",
  mutedForeground: "215 20.2% 65.1%",
  accent: "217.2 32.6% 17.5%",
  accentForeground: "210 40% 98%",
  border: "217.2 32.6% 17.5%",
  weatherBgFrom: "222.2 84% 4.9%",
  weatherBgTo: "217.2 32.6% 17.5%",
  weatherCardAccent: "217.2 32.6% 17.5%",
}

// Helper function to get theme names
export const getThemeNames = () => Object.keys(defaultThemes)

// Helper function to get a specific theme
export const getTheme = (themeName: keyof typeof defaultThemes) => {
  return defaultThemes[themeName] || defaultThemes.default
}

// Helper function to apply dark mode overrides to any theme
export const applyDarkModeOverrides = (themeColors: Record<string, string>) => {
  return { ...themeColors, ...darkThemeOverrides }
}
