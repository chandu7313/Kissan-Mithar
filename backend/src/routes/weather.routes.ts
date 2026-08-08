import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, WeatherController.getWeather);

export default router;
