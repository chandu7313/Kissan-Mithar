import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getIO } from '../config/socket.js';

const verifyInternalSignature = (req: Request, res: Response, next: NextFunction): void => {
  const serviceName = req.headers['x-service-name'];
  const timestamp = req.headers['x-service-timestamp'];
  const signature = req.headers['x-service-signature'];

  if (
    typeof serviceName !== 'string' ||
    typeof timestamp !== 'string' ||
    typeof signature !== 'string'
  ) {
    res.status(403).json({
      success: false,
      error: { message: 'Forbidden: Valid internal service signature required', statusCode: 403 },
    });
    return;
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > 5 * 60 * 1000) {
    res.status(403).json({
      success: false,
      error: { message: 'Forbidden: Expired internal service timestamp', statusCode: 403 },
    });
    return;
  }

  const pathOnly = req.originalUrl.split('?')[0];
  const payload = `${serviceName}:${timestamp}:${req.method.toUpperCase()}:${pathOnly}`;
  const expected = crypto
    .createHmac('sha256', env.INTERNAL_SERVICE_SECRET)
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    res.status(403).json({
      success: false,
      error: { message: 'Forbidden: Invalid internal service signature', statusCode: 403 },
    });
    return;
  }

  next();
};

const emitSchema = z.object({
  room: z.string().min(1).optional(),
  event: z.string().min(1),
  data: z.any().optional(),
});

const router = Router();

router.post('/realtime/emit', verifyInternalSignature, (req: Request, res: Response) => {
  const parsed = emitSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { message: 'Invalid realtime emit payload', statusCode: 400 },
    });
    return;
  }

  const io = getIO();
  if (io) {
    if (parsed.data.room) {
      io.to(parsed.data.room).emit(parsed.data.event, parsed.data.data);
    } else {
      io.emit(parsed.data.event, parsed.data.data);
    }
  }

  res.status(200).json({
    success: true,
    delivered: Boolean(io),
    event: parsed.data.event,
    room: parsed.data.room || null,
  });
});

export default router;
