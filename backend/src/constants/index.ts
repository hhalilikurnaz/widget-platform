export const APP_VERSION = '1.0.0';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const RATE_LIMIT_MAX_REQUESTS = 100;

export const DATABASE_STATUS = {
  CONNECTED: 'connected',
  NOT_CONNECTED: 'not_connected',
} as const;

export type DatabaseStatus = (typeof DATABASE_STATUS)[keyof typeof DATABASE_STATUS];
