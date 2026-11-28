import { rateLimit } from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      statusCode: 429,
    },
  },
});

// Strict limiter for OTP send endpoints — 5 requests per 10 minutes per IP
export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many OTP requests. Please wait 10 minutes before trying again.',
      statusCode: 429,
    },
  },
});

// Strict limiter for OTP verify endpoints — 10 attempts per 10 minutes per IP
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many verification attempts. Please request a new OTP.',
      statusCode: 429,
    },
  },
});

// General auth limiter — for login-password, etc
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 auth requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again shortly.',
      statusCode: 429,
    },
  },
});
