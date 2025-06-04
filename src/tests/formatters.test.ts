import { describe, it, expect } from "vitest"
import {
  TemperatureFormatter,
  DateTimeFormatter,
  WindFormatter,
  PressureFormatter,
  HumidityFormatter,
  UVIndexFormatter,
} from "../utils/formatters"

describe("TemperatureFormatter", () => {
  describe("format", () => {
    it("should format celsius temperatures correctly", () => {
      expect(TemperatureFormatter.format(20, "celsius")).toBe("20°C")
      expect(TemperatureFormatter.format(20.7, "celsius")).toBe("21°C")
      expect(TemperatureFormatter.format(-5, "celsius")).toBe("-5°C")
    })

    it("should format fahrenheit temperatures correctly", () => {
      expect(TemperatureFormatter.format(20, "fahrenheit")).toBe("68°F")
      expect(TemperatureFormatter.format(0, "fahrenheit")).toBe("32°F")
      expect(TemperatureFormatter.format(-10, "fahrenheit")).toBe("14°F")
    })

    it("should respect precision parameter", () => {
      expect(TemperatureFormatter.format(20.567, "celsius", 1)).toBe("20.6°C")
      expect(TemperatureFormatter.format(20.567, "celsius", 2)).toBe("20.57°C")
    })
  })

  describe("convert", () => {
    it("should convert celsius to fahrenheit", () => {
      expect(TemperatureFormatter.convert(0, "celsius", "fahrenheit")).toBe(32)
      expect(TemperatureFormatter.convert(20, "celsius", "fahrenheit")).toBe(68)
      expect(TemperatureFormatter.convert(-10, "celsius", "fahrenheit")).toBe(14)
    })

    it("should convert fahrenheit to celsius", () => {
      expect(TemperatureFormatter.convert(32, "fahrenheit", "celsius")).toBe(0)
      expect(TemperatureFormatter.convert(68, "fahrenheit", "celsius")).toBe(20)
      expect(TemperatureFormatter.convert(14, "fahrenheit", "celsius")).toBe(-10)
    })

    it("should return same value for same units", () => {
      expect(TemperatureFormatter.convert(20, "celsius", "celsius")).toBe(20)
      expect(TemperatureFormatter.convert(68, "fahrenheit", "fahrenheit")).toBe(68)
    })
  })

  describe("getComfortLevel", () => {
    it("should return correct comfort levels for celsius", () => {
      expect(TemperatureFormatter.getComfortLevel(-15).level).toBe("freezing")
      expect(TemperatureFormatter.getComfortLevel(0).level).toBe("cold")
      expect(TemperatureFormatter.getComfortLevel(10).level).toBe("cool")
      expect(TemperatureFormatter.getComfortLevel(20).level).toBe("comfortable")
      expect(TemperatureFormatter.getComfortLevel(28).level).toBe("warm")
      expect(TemperatureFormatter.getComfortLevel(35).level).toBe("hot")
      expect(TemperatureFormatter.getComfortLevel(45).level).toBe("extreme")
    })

    it("should handle fahrenheit temperatures", () => {
      expect(TemperatureFormatter.getComfortLevel(32, "fahrenheit").level).toBe("cold")
      expect(TemperatureFormatter.getComfortLevel(68, "fahrenheit").level).toBe("comfortable")
      expect(TemperatureFormatter.getComfortLevel(100, "fahrenheit").level).toBe("extreme")
    })
  })
})

describe("DateTimeFormatter", () => {
  const testDate = new Date("2024-01-15T14:30:00Z")

  describe("formatTime", () => {
    it("should format time in 12-hour format", () => {
      const result = DateTimeFormatter.formatTime(testDate, "12h")
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/)
    })

    it("should format time in 24-hour format", () => {
      const result = DateTimeFormatter.formatTime(testDate, "24h")
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe("formatDate", () => {
    it('should return "Today" for current date', () => {
      const today = new Date()
      expect(DateTimeFormatter.formatDate(today)).toBe("Today")
    })

    it('should return "Tomorrow" for next day', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(DateTimeFormatter.formatDate(tomorrow)).toBe("Tomorrow")
    })

    it('should return "Yesterday" for previous day', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(DateTimeFormatter.formatDate(yesterday)).toBe("Yesterday")
    })

    it("should format dates in different formats", () => {
      const date = new Date("2024-01-15")

      const short = DateTimeFormatter.formatDate(date, "short")
      expect(short).toMatch(/Jan \d{1,2}/)

      const long = DateTimeFormatter.formatDate(date, "long")
      expect(long).toMatch(/Monday, January \d{1,2}, 2024/)
    })
  })

  describe("getRelativeTime", () => {
    it('should return "Just now" for very recent times', () => {
      const now = new Date()
      expect(DateTimeFormatter.getRelativeTime(now)).toBe("Just now")
    })

    it("should return minutes ago for recent times", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(DateTimeFormatter.getRelativeTime(fiveMinutesAgo)).toBe("5 minutes ago")
    })

    it("should return hours ago for times within a day", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(DateTimeFormatter.getRelativeTime(twoHoursAgo)).toBe("2 hours ago")
    })
  })

  describe("formatDuration", () => {
    it("should format durations correctly", () => {
      expect(DateTimeFormatter.formatDuration(1000)).toBe("1 second")
      expect(DateTimeFormatter.formatDuration(2000)).toBe("2 seconds")
      expect(DateTimeFormatter.formatDuration(60000)).toBe("1 minute")
      expect(DateTimeFormatter.formatDuration(3600000)).toBe("1 hour")
      expect(DateTimeFormatter.formatDuration(86400000)).toBe("1 day")
    })
  })
})

describe("WindFormatter", () => {
  describe("formatSpeed", () => {
    it("should format wind speed in km/h", () => {
      expect(WindFormatter.formatSpeed(10, "kmh")).toBe("10 km/h")
      expect(WindFormatter.formatSpeed(15.7, "kmh")).toBe("16 km/h")
    })

    it("should format wind speed in mph", () => {
      expect(WindFormatter.formatSpeed(10, "mph")).toBe("6 mph")
    })

    it("should format wind speed in m/s", () => {
      expect(WindFormatter.formatSpeed(10, "ms")).toBe("3 m/s")
    })
  })

  describe("getDirection", () => {
    it("should return correct wind direction abbreviations", () => {
      expect(WindFormatter.getDirection(0)).toBe("N")
      expect(WindFormatter.getDirection(90)).toBe("E")
      expect(WindFormatter.getDirection(180)).toBe("S")
      expect(WindFormatter.getDirection(270)).toBe("W")
      expect(WindFormatter.getDirection(45)).toBe("NE")
    })

    it("should handle degrees over 360", () => {
      expect(WindFormatter.getDirection(450)).toBe("E") // 450 % 360 = 90
    })
  })

  describe("getDirectionName", () => {
    it("should return full direction names", () => {
      expect(WindFormatter.getDirectionName(0)).toBe("North")
      expect(WindFormatter.getDirectionName(90)).toBe("East")
      expect(WindFormatter.getDirectionName(45)).toBe("Northeast")
    })
  })

  describe("getBeaufortScale", () => {
    it("should return correct Beaufort scale values", () => {
      expect(WindFormatter.getBeaufortScale(0).scale).toBe(0)
      expect(WindFormatter.getBeaufortScale(0).description).toBe("Calm")

      expect(WindFormatter.getBeaufortScale(5).scale).toBe(1)
      expect(WindFormatter.getBeaufortScale(5).description).toBe("Light air")

      expect(WindFormatter.getBeaufortScale(25).scale).toBe(4)
      expect(WindFormatter.getBeaufortScale(25).description).toBe("Moderate breeze")

      expect(WindFormatter.getBeaufortScale(120).scale).toBe(12)
      expect(WindFormatter.getBeaufortScale(120).description).toBe("Hurricane")
    })
  })
})

describe("PressureFormatter", () => {
  describe("format", () => {
    it("should format pressure in hPa", () => {
      expect(PressureFormatter.format(1013, "hPa")).toBe("1013 hPa")
      expect(PressureFormatter.format(1013.25, "hPa")).toBe("1013 hPa")
    })

    it("should format pressure in inHg", () => {
      expect(PressureFormatter.format(1013, "inHg")).toBe("29.92 inHg")
    })

    it("should format pressure in mmHg", () => {
      expect(PressureFormatter.format(1013, "mmHg")).toBe("760 mmHg")
    })
  })

  describe("getTrend", () => {
    it("should detect rising pressure", () => {
      const trend = PressureFormatter.getTrend(1015, 1010)
      expect(trend.trend).toBe("rising")
      expect(trend.symbol).toBe("↗")
    })

    it("should detect falling pressure", () => {
      const trend = PressureFormatter.getTrend(1010, 1015)
      expect(trend.trend).toBe("falling")
      expect(trend.symbol).toBe("↘")
    })

    it("should detect steady pressure", () => {
      const trend = PressureFormatter.getTrend(1013, 1013.5)
      expect(trend.trend).toBe("steady")
      expect(trend.symbol).toBe("→")
    })
  })
})

describe("HumidityFormatter", () => {
  describe("format", () => {
    it("should format humidity as percentage", () => {
      expect(HumidityFormatter.format(65)).toBe("65%")
      expect(HumidityFormatter.format(65.7)).toBe("66%")
    })
  })

  describe("getComfortLevel", () => {
    it("should return correct comfort levels", () => {
      expect(HumidityFormatter.getComfortLevel(25).level).toBe("very-dry")
      expect(HumidityFormatter.getComfortLevel(35).level).toBe("dry")
      expect(HumidityFormatter.getComfortLevel(50).level).toBe("comfortable")
      expect(HumidityFormatter.getComfortLevel(65).level).toBe("humid")
      expect(HumidityFormatter.getComfortLevel(80).level).toBe("very-humid")
    })
  })
})

describe("UVIndexFormatter", () => {
  describe("format", () => {
    it("should format UV index as rounded integer", () => {
      expect(UVIndexFormatter.format(3.7)).toBe("4")
      expect(UVIndexFormatter.format(5.2)).toBe("5")
    })
  })

  describe("getLevel", () => {
    it("should return correct UV index levels", () => {
      expect(UVIndexFormatter.getLevel(1).level).toBe("low")
      expect(UVIndexFormatter.getLevel(1).protection).toBe("No protection required")

      expect(UVIndexFormatter.getLevel(4).level).toBe("moderate")
      expect(UVIndexFormatter.getLevel(4).protection).toBe("Seek shade during midday hours")

      expect(UVIndexFormatter.getLevel(6).level).toBe("high")
      expect(UVIndexFormatter.getLevel(6).protection).toBe("Protection required")

      expect(UVIndexFormatter.getLevel(9).level).toBe("very-high")
      expect(UVIndexFormatter.getLevel(9).protection).toBe("Extra protection required")

      expect(UVIndexFormatter.getLevel(12).level).toBe("extreme")
      expect(UVIndexFormatter.getLevel(12).protection).toBe("Avoid being outside")
    })
  })
})
