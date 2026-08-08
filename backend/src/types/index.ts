import { Request } from 'express';

export type UserRole = 'FARMER' | 'EXPERT' | 'ADMIN';

export interface AuthUserPayload {
  userId: string;
  firebaseUid?: string;
  phoneNumber?: string;
  role: UserRole;
  farmerId?: string;
  expertId?: string;
  adminId?: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export interface CloudinarySignPayload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

export interface AgricultureAlert {
  id: string;
  severity: 'WARNING' | 'ALERT' | 'ADVISORY' | 'INFO';
  title: string;
  message: string;
  category: 'RAIN' | 'SPRAY' | 'HEAT' | 'COLD' | 'WIND' | 'PEST' | 'IRRIGATION';
  icon: string;
  issuedAt: string;
  validUntil: string;
}

export interface WeatherResponseDto {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    conditionText: string;
    conditionIcon: string;
    windKph: number;
    windDirection: string;
    uvIndex: number;
    precipitationMm: number;
    lastUpdated: string;
  };
  hourly: Array<{
    time: string;
    tempC: number;
    rainProbability: number;
    conditionIcon: string;
    conditionText: string;
  }>;
  forecast: Array<{
    date: string;
    dayName: string;
    maxTempC: number;
    minTempC: number;
    rainProbability: number;
    rainfallMm: number;
    conditionText: string;
    conditionIcon: string;
  }>;
  rainfallHistory: Array<{
    day: string;
    rainfallMm: number;
  }>;
  agricultureAlerts: AgricultureAlert[];
  cachedAt?: string;
}
