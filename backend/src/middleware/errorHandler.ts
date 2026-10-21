import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // Handle Database Connectivity & Timeout Errors first (always 503 retryable)
  const isConnectionOrTimeoutError =
    err instanceof Prisma.PrismaClientInitializationError ||
    err.constructor?.name === 'PrismaClientRustPanicError' ||
    err.code === 'P2024' || // Connection pool timeout
    err.code === 'P1001' || // Can't reach database server
    err.code === 'P1002' || // Database server reached but timed out
    err.code === 'P1008' || // Operations timed out
    err.code === 'P1017' || // Server closed connection
    err.message?.includes("Can't reach database server") ||
    err.message?.includes('Connection refused') ||
    err.message?.includes('connection pool') ||
    err.message?.includes('timed out');

  if (isConnectionOrTimeoutError) {
    statusCode = 503;
    message = 'Database temporarily unavailable or connection pool busy. Retrying...';
    res.setHeader('Retry-After', '1');
    logger.warn({ err: err.message, code: err.code }, 'Transient database connectivity issue');
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      message = 'A record with this value already exists';
      details = { field: (err.meta as any)?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error({ err, statusCode }, 'Server error');
  } else if (statusCode >= 400) {
    logger.warn({ statusCode, message }, 'Client error');
  }

  // In production: NEVER leak internal error details or stack traces
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      // Only include details for validation errors, never for 500s in production
      details: isProduction && statusCode >= 500 ? undefined : details,
      timestamp: new Date().toISOString(),
    },
  });
};
