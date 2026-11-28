import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { requireInternalService } from '../middleware/auth.js';

const router = Router();
router.use(requireInternalService);

/**
 * GET /internal/farmers/:id
 * Fetch summary profile of a farmer for peer microservices.
 */
router.get('/farmers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        village: true,
        district: true,
        state: true,
        languageCode: true,
        landAcres: true,
        primaryCrop: true,
      },
    });

    if (!farmer) {
      res.status(404).json({ success: false, error: { message: 'Farmer not found', statusCode: 404 } });
      return;
    }
    res.status(200).json({ success: true, data: farmer });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/farmers/by-phone/:phone
 */
router.get('/farmers/by-phone/:phone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmer = await prisma.farmer.findFirst({
      where: { phoneNumber: req.params.phone },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        village: true,
        district: true,
        state: true,
        languageCode: true,
        landAcres: true,
        primaryCrop: true,
      },
    });
    if (!farmer) {
      res.status(404).json({ success: false, error: { message: 'Farmer not found', statusCode: 404 } });
      return;
    }
    res.status(200).json({ success: true, data: farmer });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/devices?farmerId=...
 * Used by Notification Service to look up active FCM tokens without reading the devices table directly.
 */
router.get('/devices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmerId = String(req.query.farmerId || '').trim();
    if (!farmerId) {
      res.status(400).json({ success: false, error: { message: 'farmerId query param required', statusCode: 400 } });
      return;
    }

    const devices = await prisma.device.findMany({
      where: { farmerId },
      select: { id: true, fcmToken: true, platform: true },
    });

    res.status(200).json({ success: true, data: devices });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/devices/stats
 * Aggregated device counts by platform & 30d activity for Notification Service stats.
 */
router.get('/devices/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [devicePlatformStats, active30d] = await Promise.all([
      prisma.device.groupBy({ by: ['platform'], _count: { _all: true } }),
      prisma.device.count({ where: { lastActive: { gte: thirtyDaysAgo } } }),
    ]);

    let total = 0;
    let android = 0;
    let ios = 0;
    for (const d of devicePlatformStats) {
      const count = d._count._all;
      total += count;
      const plat = (d.platform || '').toLowerCase();
      if (plat === 'android') android += count;
      else if (plat === 'ios') ios += count;
    }

    res.status(200).json({
      success: true,
      data: { total, android, ios, active30d },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/devices/broadcast-targets?targetType=ALL|DISTRICT|CROP|VILLAGE|LANGUAGE&targetValue=...
 */
router.get('/devices/broadcast-targets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetType = String(req.query.targetType || 'ALL').toUpperCase();
    const targetValue = req.query.targetValue ? String(req.query.targetValue) : undefined;

    const whereClause: any = {};
    if (targetType === 'DISTRICT' && targetValue) {
      whereClause.district = { contains: targetValue.trim(), mode: 'insensitive' };
    } else if (targetType === 'CROP' && targetValue) {
      whereClause.primaryCrop = { contains: targetValue.trim(), mode: 'insensitive' };
    } else if (targetType === 'VILLAGE' && targetValue) {
      whereClause.village = { contains: targetValue.trim(), mode: 'insensitive' };
    } else if (targetType === 'LANGUAGE' && targetValue) {
      whereClause.languageCode = targetValue.trim();
    }

    const targetFarmers = await prisma.farmer.findMany({
      where: whereClause,
      select: {
        id: true,
        devices: { select: { fcmToken: true } },
      },
    });

    res.status(200).json({ success: true, data: targetFarmers });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /internal/audit-logs
 * Used by Notification Service and Admin workflows to persist AuthAuditLog entries via Identity ownership.
 */
router.post('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, userType, userName, userEmail, action, ipAddress, metadata } = req.body || {};
    if (!userId || !userType || !action) {
      res.status(400).json({
        success: false,
        error: { message: 'userId, userType, and action are required', statusCode: 400 },
      });
      return;
    }

    const record = await prisma.authAuditLog.create({
      data: {
        userId,
        userType,
        userName,
        userEmail,
        action,
        ipAddress: ipAddress || null,
        metadata: metadata || {},
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

export default router;
