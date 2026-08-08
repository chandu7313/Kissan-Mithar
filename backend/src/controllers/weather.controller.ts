import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weather.service.js';
import { AppError } from '../middleware/errorHandler.js';

export class WeatherController {
  static async getWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const latStr = (req.query.lat || req.query.latitude) as string;
      const lngStr = (req.query.lng || req.query.lon || req.query.longitude) as string;

      const lat = parseFloat(latStr || '18.5204');
      const lng = parseFloat(lngStr || '73.8567');

      if (isNaN(lat) || isNaN(lng)) {
        throw new AppError('Valid latitude and longitude are required', 400);
      }

      const weather = await WeatherService.getWeather(lat, lng);

      res.status(200).json({
        success: true,
        data: weather,
      });
    } catch (error) {
      next(error);
    }
  }
}
