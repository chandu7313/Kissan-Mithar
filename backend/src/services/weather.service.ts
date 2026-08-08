import axios from 'axios';
import { env } from '../config/env.js';
import { AgricultureAlert, WeatherResponseDto } from '../types/index.js';

interface CacheEntry {
  data: WeatherResponseDto;
  expiresAt: number;
}

export class WeatherService {
  private static cache = new Map<string, CacheEntry>();
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Generates a cache key rounded to 2 decimal places (~1.1 km precision)
   */
  private static getCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  }

  /**
   * Evaluates agronomic rules to generate agricultural warnings/advisories
   */
  private static generateAgricultureAlerts(
    currentTemp: number,
    humidity: number,
    windKph: number,
    maxRainProb: number,
    precipitationMm: number
  ): AgricultureAlert[] {
    const alerts: AgricultureAlert[] = [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Rule 1: Rain & Spray Advisory
    if (maxRainProb >= 65 || precipitationMm > 10) {
      alerts.push({
        id: `ALERT-RAIN-${now.toISOString().slice(0, 10)}`,
        severity: 'WARNING',
        category: 'RAIN',
        title: 'Heavy Rain Expected — Delay Spraying',
        message:
          'High probability of rainfall in next 24-48 hours. Postpone pesticide, fungicide, and fertilizer spraying to prevent chemical runoff.',
        icon: 'thunderstorm',
        issuedAt: now.toISOString(),
        validUntil: tomorrow.toISOString(),
      });
    }

    // Rule 2: Heatwave & Evaporation Advisory
    if (currentTemp >= 38) {
      alerts.push({
        id: `ALERT-HEAT-${now.toISOString().slice(0, 10)}`,
        severity: 'ALERT',
        category: 'HEAT',
        title: 'High Temperature Advisory — Increase Irrigation',
        message:
          'Temperatures exceeding 38°C will increase evapotranspiration. Water saplings and orchards in early morning or late evening.',
        icon: 'wb_sunny',
        issuedAt: now.toISOString(),
        validUntil: tomorrow.toISOString(),
      });
    }

    // Rule 3: High Wind Advisory
    if (windKph >= 25) {
      alerts.push({
        id: `ALERT-WIND-${now.toISOString().slice(0, 10)}`,
        severity: 'ADVISORY',
        category: 'WIND',
        title: 'High Wind Speeds — Delay Foliar Spray',
        message:
          `Winds above 25 km/h (${windKph} km/h recorded) will cause spray drift. Ensure nursery shade nets are secured.`,
        icon: 'air',
        issuedAt: now.toISOString(),
        validUntil: tomorrow.toISOString(),
      });
    }

    // Rule 4: Fungal & Pest Risk
    if (humidity >= 85 && currentTemp >= 25 && currentTemp <= 34) {
      alerts.push({
        id: `ALERT-PEST-${now.toISOString().slice(0, 10)}`,
        severity: 'ADVISORY',
        category: 'PEST',
        title: 'High Fungal Disease Risk — Inspect Crops',
        message:
          'Combination of high humidity (>85%) and warm temperatures creates ideal conditions for anthracnose and leaf spot fungi. Inspect new flushes.',
        icon: 'pest_control',
        issuedAt: now.toISOString(),
        validUntil: tomorrow.toISOString(),
      });
    }

    return alerts;
  }

  /**
   * Generates realistic simulated weather forecast data for Indian agricultural zones
   */
  private static generateSimulatedWeather(lat: number, lng: number): WeatherResponseDto {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const currentTemp = 29.5;
    const humidity = 68;
    const windKph = 14.2;
    const maxRainProb = 75;
    const precipitationMm = 4.8;

    const hourly = Array.from({ length: 8 }).map((_, i) => {
      const hTime = new Date(now.getTime() + (i + 1) * 3 * 3600 * 1000);
      const hours = hTime.getHours().toString().padStart(2, '0');
      return {
        time: `${hours}:00`,
        tempC: Math.round((currentTemp + (Math.sin(i) * 3)) * 10) / 10,
        rainProbability: Math.min(100, Math.max(10, Math.round(50 + Math.cos(i) * 30))),
        conditionIcon: i % 2 === 0 ? 'rainy' : 'partly_cloudy_day',
        conditionText: i % 2 === 0 ? 'Light Rain Showers' : 'Partly Cloudy',
      };
    });

    const forecast = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now.getTime() + i * 24 * 3600 * 1000);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()];
      const rainP = i === 1 ? 80 : 30 + (i * 8) % 50;
      return {
        date: d.toISOString().slice(0, 10),
        dayName,
        maxTempC: 32 + (i % 3),
        minTempC: 22 + (i % 2),
        rainProbability: rainP,
        rainfallMm: rainP > 60 ? 12.5 : 1.2,
        conditionText: rainP > 60 ? 'Thunderstorms with Rain' : 'Sunny with scattered clouds',
        conditionIcon: rainP > 60 ? 'thunderstorm' : 'partly_cloudy_day',
      };
    });

    const rainfallHistory = [
      { day: 'Mon', rainfallMm: 0.0 },
      { day: 'Tue', rainfallMm: 4.2 },
      { day: 'Wed', rainfallMm: 12.8 },
      { day: 'Thu', rainfallMm: 8.5 },
      { day: 'Fri', rainfallMm: 0.0 },
      { day: 'Sat', rainfallMm: 15.0 },
      { day: 'Sun', rainfallMm: 6.2 },
    ];

    const agricultureAlerts = this.generateAgricultureAlerts(
      currentTemp,
      humidity,
      windKph,
      maxRainProb,
      precipitationMm
    );

    return {
      location: {
        name: 'Pune Rural',
        region: 'Maharashtra',
        country: 'India',
        lat,
        lon: lng,
      },
      current: {
        tempC: currentTemp,
        feelsLikeC: 31.0,
        humidity,
        conditionText: 'Scattered Showers',
        conditionIcon: 'rainy',
        windKph,
        windDirection: 'WSW',
        uvIndex: 6,
        precipitationMm,
        lastUpdated: now.toISOString(),
      },
      hourly,
      forecast,
      rainfallHistory,
      agricultureAlerts,
      cachedAt: now.toISOString(),
    };
  }

  /**
   * Fetches weather data with 10-minute in-memory caching and agriculture alerts
   */
  static async getWeather(lat: number, lng: number): Promise<WeatherResponseDto> {
    const cacheKey = this.getCacheKey(lat, lng);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    let weatherData: WeatherResponseDto;

    if (env.WEATHER_API_KEY && !env.MOCK_WEATHER_FALLBACK) {
      try {
        const response = await axios.get(`${env.WEATHER_API_URL}/forecast`, {
          params: {
            lat,
            lon: lng,
            appid: env.WEATHER_API_KEY,
            units: 'metric',
          },
          timeout: 5000,
        });

        const raw = response.data;
        const currentTemp = raw.list?.[0]?.main?.temp || 28;
        const humidity = raw.list?.[0]?.main?.humidity || 65;
        const windKph = (raw.list?.[0]?.wind?.speed || 3.5) * 3.6;
        const rainProb = (raw.list?.[0]?.pop || 0.4) * 100;

        const alerts = this.generateAgricultureAlerts(
          currentTemp,
          humidity,
          windKph,
          rainProb,
          0
        );

        weatherData = {
          location: {
            name: raw.city?.name || 'Farm Location',
            region: 'India',
            country: 'India',
            lat,
            lon: lng,
          },
          current: {
            tempC: currentTemp,
            feelsLikeC: raw.list?.[0]?.main?.feels_like || currentTemp,
            humidity,
            conditionText: raw.list?.[0]?.weather?.[0]?.description || 'Clear Sky',
            conditionIcon: 'partly_cloudy_day',
            windKph: Math.round(windKph * 10) / 10,
            windDirection: 'SW',
            uvIndex: 6,
            precipitationMm: 2.0,
            lastUpdated: new Date().toISOString(),
          },
          hourly: [],
          forecast: [],
          rainfallHistory: [],
          agricultureAlerts: alerts,
        };
      } catch (err) {
        console.warn('[WeatherService] Live API failed, falling back to simulated data:', err);
        weatherData = this.generateSimulatedWeather(lat, lng);
      }
    } else {
      weatherData = this.generateSimulatedWeather(lat, lng);
    }

    // Cache the response
    this.cache.set(cacheKey, {
      data: weatherData,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return weatherData;
  }
}
