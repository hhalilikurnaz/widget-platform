import rateLimit from 'express-rate-limit';

import {
  ANALYTICS_RATE_LIMIT_MAX_REQUESTS,
  ANALYTICS_RATE_LIMIT_WINDOW_MS,
  PUBLIC_RATE_LIMIT_MAX_REQUESTS,
  PUBLIC_RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  SUBMISSION_RATE_LIMIT_MAX_REQUESTS,
  SUBMISSION_RATE_LIMIT_WINDOW_MS,
} from '../constants/index.js';

export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    message: 'Too many requests, please try again later',
    timestamp: new Date().toISOString(),
  },
});

export const publicRateLimiter = rateLimit({
  windowMs: PUBLIC_RATE_LIMIT_WINDOW_MS,
  max: PUBLIC_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
    message: 'Too many requests, please try again later',
    timestamp: new Date().toISOString(),
  },
});

export const submissionRateLimiter = rateLimit({
  windowMs: SUBMISSION_RATE_LIMIT_WINDOW_MS,
  max: SUBMISSION_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many submissions, please try again later',
    },
    message: 'Too many submissions, please try again later',
    timestamp: new Date().toISOString(),
  },
});

export const analyticsRateLimiter = rateLimit({
  windowMs: ANALYTICS_RATE_LIMIT_WINDOW_MS,
  max: ANALYTICS_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many analytics events, please try again later',
    },
    message: 'Too many analytics events, please try again later',
    timestamp: new Date().toISOString(),
  },
});
